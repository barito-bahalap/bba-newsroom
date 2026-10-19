# bba-newsroom

Internal newsroom CMS for Barito Bahalap Media (BBM). Used by the BBM editorial team to write, review and publish articles. Not public-facing.

Deploy to its own subdomain (for example `newsroom.baritobahalap.com`). The public BBM site only reads published content through two read-only views.

## Firewall rules

- Own repo, own Supabase project, own auth users. Do not share a project, tables or logins with BBA, BBT or the Control Plane.
- No styles package dependency and no BBT/BBA branding. The UI is deliberately plain.
- The site is noindex (meta tag, `robots.txt`, `X-Robots-Tag` header in `vercel.json`).
- The Founder/CEO account should hold the `admin` role: governance only, no writing, editing or publishing.

## Stack

Vite, React 19, TypeScript (strict), React Router, TanStack Query, Supabase (Auth, Postgres, Storage), Tiptap editor.

## Roles and workflow

| Role      | Can do                                                                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Writer    | Write drafts, edit own drafts, submit for review                                                                                                                 |
| Editor    | Everything a writer does, edit any draft or article in review, return to draft with a note, add corrections                                                      |
| Publisher | Everything an editor does, publish, unpublish, republish, edit published articles, manage categories, delete drafts and unpublished articles, read the audit log |
| Admin     | Governance only: manage team and roles, read the audit log, unpublish with a reason. Cannot create, edit or publish                                              |

Article status flow:

```
draft -> in_review -> published -> unpublished -> published
            |                          |
            +-> draft (note required)  +-> draft
```

- A draft cannot jump to published. Review is mandatory.
- Slug is locked after first publication.
- Publishing requires title, body, slug, excerpt and category. Partnership content also requires a partner name.
- Unpublishing requires a reason. Returning to draft requires a note.
- Corrections are append-only public notices on published articles.

All of this is enforced in Postgres (RLS policies and triggers in `supabase/schema.sql`), not only in the UI. The audit log is written by database triggers and cannot be edited or deleted from the client.

## Setup

1. Create a new Supabase project dedicated to the newsroom.
2. Open the SQL editor and run `supabase/schema.sql` once.
3. Authentication settings:
   - Providers: disable "Allow new users to sign up" (invite only).
   - Password: minimum length 12.
   - URL configuration: set Site URL to the newsroom URL and add `http://localhost:5174` and the production URL to Redirect URLs.
   - Recommended: enable TOTP multi-factor authentication.
4. Copy `.env.example` to `.env` and fill in the project URL and anon key.
5. Install and run:

```bash
npm install
npm run dev
```

6. Create the first admin. Invite yourself from Authentication, Users, Invite user, open the invite link and set a password. Then run this in the SQL editor:

```sql
update public.profiles
set role = 'admin', is_active = true
where email = 'you@example.com';
```

7. Add the rest of the team the same way (invite from the Supabase dashboard). They appear under Team as inactive. Activate them and assign a role there. New accounts have no access until activated, even if someone bypasses the invite-only setting.
8. Sign in as a publisher and create categories before the first publication.

## Scripts

| Command             | Purpose                        |
| ------------------- | ------------------------------ |
| `npm run dev`       | Dev server on port 5174        |
| `npm run build`     | Typecheck and production build |
| `npm run preview`   | Preview the production build   |
| `npm run typecheck` | Typecheck only                 |

## Deployment

Static host with SPA fallback to `index.html`. `vercel.json` already includes the rewrite and security headers. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's environment.

## Pages

| Route                            | Access                                               | Purpose                                          |
| -------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `/login`                         | Public                                               | Sign in, password reset request                  |
| `/set-password`                  | Invite or reset link                                 | Set a password                                   |
| `/`                              | Active members                                       | Counts and work queues by role                   |
| `/articles`                      | Active members                                       | Filter, search, paginate                         |
| `/articles/new`, `/articles/:id` | Writers, editors, publishers (new); all roles (view) | Editor, workflow actions, revisions, corrections |
| `/categories`                    | Publisher                                            | Manage categories                                |
| `/team`                          | Admin                                                | Activate members, assign roles                   |
| `/audit`                         | Admin, publisher                                     | Audit log                                        |
| `/account`                       | Active members                                       | Display name, password                           |

## Contract with the public BBM site

The public site reads only these, with the anon key:

- `public_articles` view: published articles with category and byline.
- `public_corrections` view: correction notices for published articles.
- `categories` table (public read).
- Storage bucket `newsroom-media` (public image URLs).

Rules for the public site:

- Sanitize `body_html` before rendering (for example DOMPurify). The editor produces clean HTML, but the database does not guarantee it.
- Show a visible label when `content_type = 'partnership'`, using `sponsor_name`.
- Show correction notices on the article.
- Use `slug` as the URL key.

## Data model

`profiles`, `categories`, `articles`, `article_revisions`, `corrections`, `audit_log`. Helper functions: `app_role()`, `article_counts()`, `log_audit()`.

## Project structure

```
src/
  main.tsx            entry, providers
  App.tsx             routes and role guards
  lib/                supabase client, types, permissions, formatting, uploads
  hooks/              auth and data hooks (TanStack Query)
  components/         display components, no data fetching
  pages/              page orchestration
supabase/schema.sql   tables, RLS, triggers, views, storage policy
```

## Known limits

- Members are invited from the Supabase dashboard. In-app invites need a server function with the service role key.
- Saving is manual. No autosave, to keep revision history meaningful.
- Concurrent edits on the same article are last-write-wins.
- A publisher can publish an article they wrote. Add a four-eyes rule in `articles_guard()` if the team grows.
