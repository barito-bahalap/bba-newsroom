import { Link } from "react-router-dom";
// Style
import "./ArticlesPage.css";
// Contexts & Hooks
import { useAuth } from "@/contexts";
import { PAGE_SIZE, useArticleFilters } from "@/hooks";
// Components
import { Notice, PageHeader, Pagination } from "@/components";
import { ArticleTable } from "@/components";
import { ArticleFilterBar } from "./_components";
// Utils
import { can } from "@/lib";

export default function ArticlesPage() {
  const { profile } = useAuth();
  const filters = useArticleFilters();

  if (!profile) return null;

  const { list } = filters;

  return (
    <div className="articles-page">
      <PageHeader title="Articles">
        {can.writeArticles(profile.role) && (
          <Link className="btn btn--primary" to="/articles/new">
            Write a new article
          </Link>
        )}
      </PageHeader>

      <ArticleFilterBar
        status={filters.status}
        categoryId={filters.categoryId}
        searchInput={filters.searchInput}
        categories={filters.categories}
        onStatus={filters.setStatus}
        onCategory={filters.setCategory}
        onSearchInput={filters.setSearchInput}
        onSubmit={filters.submitSearch}
      />

      {list.isLoading && <p className="muted">Loading...</p>}
      {list.error && <Notice tone="error">Could not load articles.</Notice>}
      {list.data && (
        <>
          <ArticleTable rows={list.data.rows} />
          <Pagination
            page={filters.page}
            totalPages={Math.ceil(list.data.total / PAGE_SIZE)}
            onPageChange={filters.setPage}
            prevLabel="Previous"
            nextLabel="Next"
            pageLabel="Page"
            ofLabel="of"
          />
        </>
      )}
    </div>
  );
}
