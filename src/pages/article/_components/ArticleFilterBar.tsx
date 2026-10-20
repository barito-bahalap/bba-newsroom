import type { FormEvent } from "react";
// Style
import "./ArticleFilterBar.css";
// Utils
import { STATUSES, STATUS_LABEL } from "@/lib";
import type { ArticleStatus, Category } from "@/lib";

interface ArticleFilterBarProps {
  status: ArticleStatus | "all";
  categoryId: string;
  searchInput: string;
  categories: Category[];
  onStatus: (value: string) => void;
  onCategory: (value: string) => void;
  onSearchInput: (value: string) => void;
  onSubmit: () => void;
}

export function ArticleFilterBar({
  status,
  categoryId,
  searchInput,
  categories,
  onStatus,
  onCategory,
  onSearchInput,
  onSubmit,
}: ArticleFilterBarProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <select
        value={status}
        aria-label="Status"
        onChange={(event) => onStatus(event.target.value)}
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
        aria-label="Category"
        onChange={(event) => onCategory(event.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input
        type="search"
        placeholder="Search title"
        aria-label="Search title"
        value={searchInput}
        onChange={(event) => onSearchInput(event.target.value)}
      />
      <button type="submit" className="btn">
        Search
      </button>
    </form>
  );
}
