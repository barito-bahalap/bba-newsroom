export type Role = "writer" | "editor" | "publisher" | "admin";
export type ArticleStatus = "draft" | "in_review" | "published" | "unpublished";
export type ContentType = "editorial" | "partnership";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string;
  body_html: string;
  cover_url: string | null;
  cover_alt: string | null;
  cover_credit: string | null;
  category_id: string | null;
  tags: string[];
  content_type: ContentType;
  sponsor_name: string | null;
  byline: string | null;
  seo_title: string | null;
  seo_description: string | null;
  author_id: string;
  status: ArticleStatus;
  review_note: string | null;
  unpublished_reason: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleListRow {
  id: string;
  title: string;
  slug: string | null;
  status: ArticleStatus;
  updated_at: string;
  published_at: string | null;
  category: { name: string } | null;
  author: { full_name: string } | null;
}

export interface Revision {
  id: string;
  article_id: string;
  title: string;
  excerpt: string;
  body_html: string;
  edited_by: string | null;
  created_at: string;
  editor: { full_name: string } | null;
}

export interface Correction {
  id: string;
  article_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
  author: { full_name: string } | null;
}

export interface AuditRow {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: Record<string, unknown>;
  created_at: string;
  actor: { full_name: string; email: string } | null;
}
