import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// Hooks
import { useArticleList, useCategories } from ".";
// Utils
import { STATUSES, type ArticleStatus } from "@/lib";

export function useArticleFilters() {
  const [params, setParams] = useSearchParams();
  const categories = useCategories();

  const rawStatus = params.get("status") ?? "all";
  const status: ArticleStatus | "all" = (STATUSES as string[]).includes(
    rawStatus,
  )
    ? (rawStatus as ArticleStatus)
    : "all";
  const search = params.get("q") ?? "";
  const categoryId = params.get("category") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  const list = useArticleList({ status, search, categoryId, page });

  function update(patch: Record<string, string>) {
    const next = new URLSearchParams(params);
    if (!("page" in patch)) next.delete("page");
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value === "all") next.delete(key);
      else next.set(key, value);
    }
    setParams(next);
  }

  return {
    status,
    categoryId,
    page,
    searchInput,
    categories: categories.data ?? [],
    list,
    setSearchInput,
    setStatus: (value: string) => update({ status: value }),
    setCategory: (value: string) => update({ category: value }),
    setPage: (value: number) => update({ page: String(value) }),
    submitSearch: () => update({ q: searchInput.trim() }),
  };
}
