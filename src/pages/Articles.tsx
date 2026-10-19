import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ArticleTable from "@/components/ArticleTable";
import Pagination from "@/components/Pagination";
import { PAGE_SIZE, useArticleList } from "@/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { STATUS_LABEL } from "@/lib/format";
import { can } from "@/lib/permissions";
import type { ArticleStatus } from "@/lib/types";

const STATUSES = Object.keys(STATUS_LABEL) as ArticleStatus[];

export default function Articles() {
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const categories = useCategories();

  const rawStatus = params.get("status") ?? "all";
  const status = (STATUSES as string[]).includes(rawStatus)
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

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    update({ q: searchInput.trim() });
  }

  if (!profile) return null;

  return (
    <div>
      <div className="row between">
        <h1>Articles</h1>
        {can.writeArticles(profile.role) && (
          <Link className="button" to="/articles/new">
            Write a new article
          </Link>
        )}
      </div>

      <form className="row" onSubmit={submitSearch}>
        <select
          value={status}
          onChange={(event) => update({ status: event.target.value })}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>
        <select
          value={categoryId}
          onChange={(event) => update({ category: event.target.value })}
        >
          <option value="">All categories</option>
          {(categories.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search title"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {list.isLoading && <p className="muted">Loading...</p>}
      {list.error && <p className="error">Could not load articles.</p>}
      {list.data && (
        <>
          <ArticleTable rows={list.data.rows} />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={list.data.total}
            onPage={(next) => update({ page: String(next) })}
          />
        </>
      )}
    </div>
  );
}
