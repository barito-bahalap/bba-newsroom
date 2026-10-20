import { can } from "./permissions";
import type { ArticleStatus, Role } from "./types";

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

export function navLinksFor(role: Role): NavItem[] {
  const links: NavItem[] = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/articles", label: "Articles", end: true },
  ];
  if (can.writeArticles(role))
    links.push({ to: "/articles/new", label: "Write" });
  if (can.manageCategories(role))
    links.push({ to: "/categories", label: "Categories" });
  if (can.manageTeam(role)) links.push({ to: "/team", label: "Team" });
  if (can.viewAudit(role)) links.push({ to: "/audit", label: "Audit log" });
  links.push({ to: "/account", label: "Account" });
  return links;
}

export interface DashboardSpec {
  title: string;
  status: ArticleStatus;
}

export function dashboardSpecsFor(role: Role): DashboardSpec[] {
  const review: DashboardSpec = {
    title: "Waiting for review",
    status: "in_review",
  };
  const drafts: DashboardSpec = { title: "Drafts", status: "draft" };
  const published: DashboardSpec = {
    title: "Recently published",
    status: "published",
  };
  if (role === "admin") return [published, review];
  if (role === "publisher") return [review, drafts, published];
  return [review, drafts];
}
