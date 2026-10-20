import type { AuditRow } from "./types";

export const AUDIT_ENTITIES = [
  { value: "", label: "Everything" },
  { value: "article", label: "Articles" },
  { value: "profile", label: "Team" },
  { value: "categories", label: "Categories" },
  { value: "corrections", label: "Corrections" },
];

export function summarizeAudit(row: AuditRow): string {
  const detail = row.detail as Record<string, unknown>;
  switch (row.action) {
    case "article.status_changed": {
      const reason = (detail.reason ?? detail.review_note) as
        | string
        | null
        | undefined;
      return `${String(detail.title ?? "")}: ${String(detail.from)} -> ${String(detail.to)}${
        reason ? ` (${reason})` : ""
      }`;
    }
    case "article.created":
    case "article.deleted":
      return String(detail.title ?? "");
    case "member.invited":
      return String(detail.email ?? "");
    case "member.updated":
      return `${String(detail.email)}: role ${String(detail.role_from)} -> ${String(
        detail.role_to,
      )}, active ${String(detail.active_from)} -> ${String(detail.active_to)}`;
    case "corrections.insert":
      return String(detail.note ?? "");
    default:
      return String(detail.name ?? "");
  }
}
