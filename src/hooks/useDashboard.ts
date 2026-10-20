import type { UseQueryResult } from "@tanstack/react-query";
// Contexts & Hooks
import { useAuth } from "@/contexts";
import { useArticleCounts, useArticlesByStatus } from ".";
// Utils
import { dashboardSpecsFor } from "@/lib";
import type { ArticleListRow, ArticleStatus } from "@/lib";

export interface DashboardSection {
  title: string;
  status: ArticleStatus;
  rows: ArticleListRow[];
  loading: boolean;
  failed: boolean;
}

export function useDashboard() {
  const { profile } = useAuth();
  const role = profile?.role;

  const counts = useArticleCounts();
  const review = useArticlesByStatus("in_review");
  const drafts = useArticlesByStatus("draft", 8, role !== "admin");
  const published = useArticlesByStatus(
    "published",
    8,
    role === "publisher" || role === "admin",
  );

  const queries: Partial<
    Record<ArticleStatus, UseQueryResult<ArticleListRow[]>>
  > = {
    in_review: review,
    draft: drafts,
    published,
  };

  const sections: DashboardSection[] = role
    ? dashboardSpecsFor(role).map((spec) => {
        const query = queries[spec.status];
        return {
          ...spec,
          rows: query?.data ?? [],
          loading: Boolean(query?.isLoading),
          failed: Boolean(query?.error),
        };
      })
    : [];

  return { profile, counts, sections };
}
