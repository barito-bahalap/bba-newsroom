# bba-newsroom

Internal newsroom CMS for Barito Bahalap Media (BBM). Used by the BBM editorial team to write, review and publish articles. Not public-facing. Deploy to its own subdomain (for example `newsroom.baritobahalap.com`).

## Firewall rules

- Own repo, own Supabase project, own auth users. Do not share a project, tables or logins with BBA, BBT or the Control Plane.
- The site is noindex (meta tag, `X-Robots-Tag` header in `vercel.json`).
- The Founder/CEO account holds the `admin` role: governance only, no writing, editing or publishing.

## Stack

Vite, React 19, TypeScript, React Router, TanStack Query, Tiptap, Supabase through `@barito-bahalap/supabase`, shared styles through `@barito-bahalap/styles`. English only.

## Setup

1. Create a new Supabase project dedicated to the newsroom.
2. Run `supabase/schema.sql` in the SQL editor. It is safe to run again.
3. Authentication: disable public signups, set minimum password length to 12, set Site URL and add `http://localhost:5173` plus the production URL to Redirect URLs.
4. Copy `.env.example` to `.env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. `pnpm install`, then `pnpm dev`.
6. Invite yourself (Authentication, Users, Invite user), open the link, set a password, then run:

```sql
update public.profiles
set role = 'admin', is_active = true
where email = 'you@example.com';
```

7. Invite the rest of the team the same way, then activate them and assign roles on the Team page. Sign in as a publisher and create categories before the first publication.

## Roles and workflow

| Role      | Can do                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Writer    | Write drafts, edit own drafts, submit for review                                                             |
| Editor    | Writer rights, edit any draft or article in review, return with a note, add corrections                      |
| Publisher | Editor rights, publish, unpublish, republish, edit published articles, manage categories, read the audit log |
| Admin     | Manage team and roles, read the audit log, unpublish with a reason. Cannot create, edit or publish           |

```
draft -> in_review -> published -> unpublished -> published
            |                          |
            +-> draft (note required)  +-> draft
```

Review is mandatory. Slug locks after first publication. Unpublishing needs a reason. Corrections are append-only. All of this is enforced in Postgres (RLS and triggers), not only in the UI. The audit log is written by triggers and cannot be changed from the client.

## Structure

```
src/
  main.tsx              providers and entry
  app/                  App and router (routes/)
  components/layout/    Layout, Header
  components/module/    shared dumb components (Field, Notice, ArticleTable, ...)
  hooks/                all logic, data and form state
  lib/                  types, permissions, formatting, navigation, uploads
  pages/<name>/         XxxPage.tsx + XxxPage.css, page-only parts in _/components
  styles/app.css        local --nr-* tokens and global primitives
supabase/schema.sql
```

Pages orchestrate, hooks hold the logic, components only render. Every tsx has its own css.

## Contract with the public BBM site

Read with the publishable key: `public_articles` view, `public_corrections` view, `categories` table, and the public `newsroom-media` bucket. The public site must sanitize `body_html` before rendering, show a visible label for `content_type = 'partnership'`, show correction notices, and use `slug` as the URL key.

## Known limits

- Members are invited from the Supabase dashboard.
- Saving is manual, no autosave. Concurrent edits are last-write-wins.
- A publisher can publish their own article.
