import type { ArticleStatus, Role } from "./types";

export type WorkflowAction =
  | "submit"
  | "return"
  | "publish"
  | "unpublish"
  | "republish"
  | "reopen";

export const WORKFLOW_TARGET: Record<WorkflowAction, ArticleStatus> = {
  submit: "in_review",
  return: "draft",
  publish: "published",
  unpublish: "unpublished",
  republish: "published",
  reopen: "draft",
};

export const WORKFLOW_LABEL: Record<WorkflowAction, string> = {
  submit: "Submit for review",
  return: "Return to draft",
  publish: "Publish",
  unpublish: "Unpublish",
  republish: "Republish",
  reopen: "Move back to draft",
};

export const WRITE_ROLES: Role[] = ["writer", "editor", "publisher"];

export const can = {
  writeArticles: (role: Role) => WRITE_ROLES.includes(role),
  manageCategories: (role: Role) => role === "publisher",
  manageTeam: (role: Role) => role === "admin",
  viewAudit: (role: Role) => role === "admin" || role === "publisher",
  addCorrection: (role: Role) => role === "editor" || role === "publisher",
};

export function canEditContent(
  role: Role,
  status: ArticleStatus,
  isAuthor: boolean,
): boolean {
  if (role === "writer") return isAuthor && status === "draft";
  if (role === "editor") return status === "draft" || status === "in_review";
  if (role === "publisher") return true;
  return false;
}

export function availableActions(
  role: Role,
  status: ArticleStatus,
  isAuthor: boolean,
): WorkflowAction[] {
  const actions: WorkflowAction[] = [];
  if (status === "draft" && canEditContent(role, status, isAuthor)) {
    actions.push("submit");
  }
  if (status === "in_review") {
    if (role === "editor" || role === "publisher") actions.push("return");
    if (role === "publisher") actions.push("publish");
  }
  if (status === "published" && (role === "publisher" || role === "admin")) {
    actions.push("unpublish");
  }
  if (status === "unpublished" && role === "publisher") {
    actions.push("republish", "reopen");
  }
  return actions;
}

export function canDelete(
  role: Role,
  status: ArticleStatus,
  isAuthor: boolean,
): boolean {
  if (can.writeArticles(role) && isAuthor && status === "draft") return true;
  return (
    role === "publisher" && (status === "draft" || status === "unpublished")
  );
}

export function needsNote(action: WorkflowAction): boolean {
  return action === "return" || action === "unpublish";
}
