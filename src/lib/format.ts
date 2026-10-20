import type { ArticleStatus, Role } from "./types";

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  unpublished: "Unpublished",
};

export const STATUSES = Object.keys(STATUS_LABEL) as ArticleStatus[];

export const ROLE_LABEL: Record<Role, string> = {
  writer: "Writer",
  editor: "Editor",
  publisher: "Publisher",
  admin: "Admin",
};

export const ROLES = Object.keys(ROLE_LABEL) as Role[];

const dateTime = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTime.format(new Date(iso)) : "-";
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function parseTags(input: string): string[] {
  const tags = input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return Array.from(new Set(tags)).slice(0, 10);
}

export function errMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const { message, code } = error as { message?: unknown; code?: unknown };
    if (code === "23505")
      return "That value is already in use (for example, the slug is taken).";
    if (code === "23503")
      return "This item is still referenced elsewhere and cannot be removed.";
    if (typeof message === "string" && message) return message;
  }
  return "Something went wrong. Please try again.";
}
