-- BBM Newsroom schema
-- Run once in the SQL editor of the dedicated NEWSROOM Supabase project.
-- Rules (roles, workflow, audit) are enforced here in Postgres, not in the UI.

-- 1. Types
create type public.user_role as enum ('writer', 'editor', 'publisher', 'admin');
create type public.article_status as enum ('draft', 'in_review', 'published', 'unpublished');
create type public.content_type as enum ('editorial', 'partnership');

-- 2. Profiles (one per auth user; inactive until an admin activates)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.user_role not null default 'writer',
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.app_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

-- 3. Audit log (written only by triggers)
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_created_idx on public.audit_log (created_at desc);
create index audit_log_entity_idx on public.audit_log (entity, created_at desc);

create or replace function public.log_audit(
  p_action text,
  p_entity text,
  p_entity_id text,
  p_detail jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (auth.uid(), p_action, p_entity, p_entity_id, coalesce(p_detail, '{}'::jsonb));
$$;
revoke all on function public.log_audit(text, text, text, jsonb) from public, anon, authenticated;

-- 4. Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

-- 5. Articles
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  slug text unique check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  body_html text not null default '',
  cover_url text,
  cover_alt text,
  cover_credit text,
  category_id uuid references public.categories (id) on delete restrict,
  tags text[] not null default '{}',
  content_type public.content_type not null default 'editorial',
  sponsor_name text,
  byline text,
  seo_title text,
  seo_description text,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  status public.article_status not null default 'draft',
  review_note text,
  unpublished_reason text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_status_updated_idx on public.articles (status, updated_at desc);
create index articles_author_idx on public.articles (author_id);
create index articles_category_idx on public.articles (category_id);
create index articles_published_idx on public.articles (published_at desc) where status = 'published';

create table public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  title text not null,
  excerpt text not null,
  body_html text not null,
  edited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index article_revisions_article_idx on public.article_revisions (article_id, created_at desc);

-- Append-only public correction notices (hak koreksi)
create table public.corrections (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  note text not null check (char_length(btrim(note)) > 0),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index corrections_article_idx on public.corrections (article_id, created_at desc);

-- 6. Validation helper
create or replace function public.article_problem(a public.articles, for_publish boolean)
returns text
language plpgsql
stable
as $$
begin
  if btrim(coalesce(a.title, '')) = '' then
    return 'Title is required';
  end if;
  if btrim(regexp_replace(coalesce(a.body_html, ''), '<[^>]*>', '', 'g')) = ''
     and coalesce(a.body_html, '') !~* '<img' then
    return 'Body is empty';
  end if;
  if for_publish then
    if a.slug is null then return 'Slug is required to publish'; end if;
    if btrim(coalesce(a.excerpt, '')) = '' then return 'Excerpt is required to publish'; end if;
    if a.category_id is null then return 'Category is required to publish'; end if;
    if a.content_type = 'partnership' and btrim(coalesce(a.sponsor_name, '')) = '' then
      return 'Partner name is required for partnership content';
    end if;
  end if;
  return null;
end;
$$;

-- 7. Article guard: role rules, workflow transitions, field protection
create or replace function public.articles_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.user_role := public.app_role();
  req_note text;
  req_reason text;
  problem text;
begin
  if auth.uid() is null then
    return new; -- SQL editor / service role (seeding, maintenance)
  end if;
  if caller is null then
    raise exception 'Not an active team member';
  end if;

  if tg_op = 'INSERT' then
    if caller = 'admin' then
      raise exception 'The admin role cannot create articles';
    end if;
    new.author_id := auth.uid();
    new.status := 'draft';
    new.published_at := null;
    new.review_note := null;
    new.unpublished_reason := null;
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  req_note := btrim(coalesce(new.review_note, ''));
  req_reason := btrim(coalesce(new.unpublished_reason, ''));

  -- Admin: governance only. Can unpublish with a reason, nothing else.
  if caller = 'admin' then
    if not (old.status = 'published' and new.status = 'unpublished') then
      raise exception 'Admin can only unpublish a published article';
    end if;
    if req_reason = '' then
      raise exception 'A reason is required to unpublish';
    end if;
    new := old;
    new.status := 'unpublished';
    new.unpublished_reason := req_reason;
    new.updated_at := now();
    return new;
  end if;

  new.author_id := old.author_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  new.review_note := old.review_note;
  new.unpublished_reason := old.unpublished_reason;
  new.published_at := old.published_at;

  if new.status is distinct from old.status then
    if old.status = 'draft' and new.status = 'in_review' then
      new.review_note := null;
    elsif old.status = 'in_review' and new.status = 'draft' then
      if caller = 'writer' then
        raise exception 'Only an editor or publisher can return an article to draft';
      end if;
      if req_note = '' then
        raise exception 'A review note is required when returning an article';
      end if;
      new.review_note := req_note;
    elsif old.status = 'in_review' and new.status = 'published' then
      if caller <> 'publisher' then
        raise exception 'Only a publisher can publish';
      end if;
      new.review_note := null;
      new.published_at := coalesce(old.published_at, now());
    elsif old.status = 'published' and new.status = 'unpublished' then
      if caller <> 'publisher' then
        raise exception 'Only a publisher or admin can unpublish';
      end if;
      if req_reason = '' then
        raise exception 'A reason is required to unpublish';
      end if;
      new.unpublished_reason := req_reason;
    elsif old.status = 'unpublished' and new.status = 'published' then
      if caller <> 'publisher' then
        raise exception 'Only a publisher can republish';
      end if;
      new.unpublished_reason := null;
      new.published_at := coalesce(old.published_at, now());
    elsif old.status = 'unpublished' and new.status = 'draft' then
      if caller <> 'publisher' then
        raise exception 'Only a publisher can reopen an unpublished article';
      end if;
    else
      raise exception 'Invalid status change: % to %', old.status, new.status;
    end if;
  else
    if caller = 'writer' and (old.status <> 'draft' or old.author_id <> auth.uid()) then
      raise exception 'Writers can only edit their own drafts';
    end if;
    if caller = 'editor' and old.status not in ('draft', 'in_review') then
      raise exception 'Editors cannot edit published or unpublished articles';
    end if;
  end if;

  if old.published_at is not null and new.slug is distinct from old.slug then
    raise exception 'Slug is locked after first publication';
  end if;

  if new.status = 'published' then
    problem := public.article_problem(new, true);
  elsif new.status = 'in_review' then
    problem := public.article_problem(new, false);
  end if;
  if problem is not null then
    raise exception '%', problem;
  end if;

  return new;
end;
$$;

create trigger articles_guard_trg
before insert or update on public.articles
for each row execute function public.articles_guard();

-- 8. Revisions and audit for articles
create or replace function public.articles_after()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.log_audit('article.deleted', 'article', old.id::text,
      jsonb_build_object('title', old.title, 'status', old.status));
    return old;
  end if;

  if tg_op = 'INSERT' then
    perform public.log_audit('article.created', 'article', new.id::text,
      jsonb_build_object('title', new.title));
    if btrim(new.body_html) <> '' then
      insert into public.article_revisions (article_id, title, excerpt, body_html, edited_by)
      values (new.id, new.title, new.excerpt, new.body_html, auth.uid());
    end if;
    return new;
  end if;

  if new.title is distinct from old.title
     or new.excerpt is distinct from old.excerpt
     or new.body_html is distinct from old.body_html then
    insert into public.article_revisions (article_id, title, excerpt, body_html, edited_by)
    values (new.id, new.title, new.excerpt, new.body_html, auth.uid());
  end if;

  if new.status is distinct from old.status then
    perform public.log_audit('article.status_changed', 'article', new.id::text,
      jsonb_build_object(
        'title', new.title,
        'from', old.status,
        'to', new.status,
        'review_note', new.review_note,
        'reason', new.unpublished_reason
      ));
  end if;
  return new;
end;
$$;

create trigger articles_after_trg
after insert or update or delete on public.articles
for each row execute function public.articles_after();

-- 9. Audit for categories, corrections
create or replace function public.generic_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_json jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  perform public.log_audit(tg_table_name || '.' || lower(tg_op), tg_table_name, row_json ->> 'id', row_json);
  return null;
end;
$$;

create trigger categories_audit_trg
after insert or update or delete on public.categories
for each row execute function public.generic_audit();

create trigger corrections_audit_trg
after insert on public.corrections
for each row execute function public.generic_audit();

-- 10. Profiles: creation on invite, guard, audit
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1))
  );
  perform public.log_audit('member.invited', 'profile', new.id::text, jsonb_build_object('email', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.user_role := public.app_role();
begin
  if auth.uid() is null then
    return new; -- SQL editor / service role (bootstrap first admin)
  end if;

  new.id := old.id;
  new.email := old.email;
  new.created_at := old.created_at;

  if new.role is distinct from old.role or new.is_active is distinct from old.is_active then
    if caller is distinct from 'admin' then
      raise exception 'Only an admin can change roles or activation';
    end if;
    if old.id = auth.uid() then
      raise exception 'You cannot change your own role or activation';
    end if;
  elsif old.id <> auth.uid() and caller is distinct from 'admin' then
    raise exception 'You can only edit your own profile';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_trg
before update on public.profiles
for each row execute function public.profiles_guard();

create or replace function public.profiles_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role or new.is_active is distinct from old.is_active then
    perform public.log_audit('member.updated', 'profile', new.id::text,
      jsonb_build_object(
        'email', new.email,
        'role_from', old.role,
        'role_to', new.role,
        'active_from', old.is_active,
        'active_to', new.is_active
      ));
  end if;
  return new;
end;
$$;

create trigger profiles_audit_trg
after update on public.profiles
for each row execute function public.profiles_audit();

-- 11. Dashboard counts (security invoker: respects row level security)
create or replace function public.article_counts()
returns table (status public.article_status, total bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select a.status, count(*) from public.articles a group by a.status
$$;

-- 12. Row level security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.article_revisions enable row level security;
alter table public.corrections enable row level security;
alter table public.audit_log enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.app_role() is not null);
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.app_role() = 'admin')
  with check (id = auth.uid() or public.app_role() = 'admin');

-- categories
create policy categories_select_staff on public.categories for select to authenticated
  using (public.app_role() is not null);
create policy categories_select_public on public.categories for select to anon
  using (true);
create policy categories_write on public.categories for all to authenticated
  using (public.app_role() = 'publisher')
  with check (public.app_role() = 'publisher');

-- articles
create policy articles_select on public.articles for select to authenticated
  using (
    public.app_role() in ('editor', 'publisher', 'admin')
    or (public.app_role() = 'writer' and author_id = auth.uid())
  );
create policy articles_insert on public.articles for insert to authenticated
  with check (public.app_role() in ('writer', 'editor', 'publisher') and author_id = auth.uid());
create policy articles_update on public.articles for update to authenticated
  using (
    (public.app_role() = 'writer' and author_id = auth.uid() and status = 'draft')
    or (public.app_role() = 'editor' and status in ('draft', 'in_review'))
    or public.app_role() in ('publisher', 'admin')
  )
  with check (public.app_role() is not null);
create policy articles_delete on public.articles for delete to authenticated
  using (
    (public.app_role() in ('writer', 'editor', 'publisher') and author_id = auth.uid() and status = 'draft')
    or (public.app_role() = 'publisher' and status in ('draft', 'unpublished'))
  );

-- revisions
create policy revisions_select on public.article_revisions for select to authenticated
  using (exists (select 1 from public.articles a where a.id = article_id));

-- corrections
create policy corrections_select on public.corrections for select to authenticated
  using (exists (select 1 from public.articles a where a.id = article_id));
create policy corrections_insert on public.corrections for insert to authenticated
  with check (
    public.app_role() in ('editor', 'publisher')
    and created_by = auth.uid()
    and exists (select 1 from public.articles a where a.id = article_id and a.status = 'published')
  );

-- audit log: read only for admin and publisher, no client writes
create policy audit_select on public.audit_log for select to authenticated
  using (public.app_role() in ('admin', 'publisher'));
revoke insert, update, delete on public.audit_log from anon, authenticated;
revoke insert, update, delete on public.article_revisions from anon, authenticated;
revoke update, delete on public.corrections from anon, authenticated;

-- 13. Read-only views for the public BBM site (published content only)
create or replace view public.public_articles as
select
  a.id,
  a.slug,
  a.title,
  a.excerpt,
  a.body_html,
  a.cover_url,
  a.cover_alt,
  a.cover_credit,
  a.tags,
  a.content_type,
  a.sponsor_name,
  a.seo_title,
  a.seo_description,
  a.published_at,
  a.updated_at,
  c.name as category_name,
  c.slug as category_slug,
  coalesce(nullif(btrim(a.byline), ''), p.full_name) as author_name
from public.articles a
join public.profiles p on p.id = a.author_id
left join public.categories c on c.id = a.category_id
where a.status = 'published';

create or replace view public.public_corrections as
select c.id, c.article_id, c.note, c.created_at
from public.corrections c
join public.articles a on a.id = c.article_id
where a.status = 'published';

grant select on public.public_articles, public.public_corrections to anon, authenticated;

-- 14. Media bucket (images only, 5 MB, public read by URL, staff upload)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'newsroom-media',
  'newsroom-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy newsroom_media_upload on storage.objects for insert to authenticated
  with check (
    bucket_id = 'newsroom-media'
    and public.app_role() in ('writer', 'editor', 'publisher')
  );
