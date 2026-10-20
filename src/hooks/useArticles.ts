import { keepPreviousData, useQuery } from "@tanstack/react-query";
// Utils
import { supabase } from "@/lib";
import type { ArticleListRow, ArticleStatus } from "@/lib";

export const PAGE_SIZE = 20;

export interface ArticleFilters {
  status: ArticleStatus | "all";
  search: string;
  categoryId: string;
  page: number;
}

const LIST_COLUMNS =
  "id, title, slug, status, updated_at, published_at, category:categories(name), author:profiles(full_name)";

export function useArticleList(filters: ArticleFilters) {
  return useQuery({
    queryKey: ["articles", "list", filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const from = (filters.page - 1) * PAGE_SIZE;
      let query = supabase
        .from("articles")
        .select(LIST_COLUMNS, { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (filters.status !== "all") query = query.eq("status", filters.status);
      if (filters.categoryId)
        query = query.eq("category_id", filters.categoryId);
      if (filters.search.trim())
        query = query.ilike("title", `%${filters.search.trim()}%`);
      const { data, error, count } = await query;
      if (error) throw error;
      return {
        rows: (data ?? []) as unknown as ArticleListRow[],
        total: count ?? 0,
      };
    },
  });
}

export function useArticlesByStatus(
  status: ArticleStatus,
  limit = 8,
  enabled = true,
) {
  return useQuery({
    queryKey: ["articles", "by-status", status, limit],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(LIST_COLUMNS)
        .eq("status", status)
        .order("updated_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as ArticleListRow[];
    },
  });
}

export function useArticleCounts() {
  return useQuery({
    queryKey: ["articles", "counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("article_counts");
      if (error) throw error;
      const counts: Record<ArticleStatus, number> = {
        draft: 0,
        in_review: 0,
        published: 0,
        unpublished: 0,
      };
      for (const row of (data ?? []) as {
        status: ArticleStatus;
        total: number;
      }[]) {
        counts[row.status] = Number(row.total);
      }
      return counts;
    },
  });
}
