import { Link } from "react-router-dom";
// Style
import "./DashboardSectionBlock.css";
// Hooks
import type { DashboardSection } from "@/hooks";
// Components
import { ArticleTable, Notice } from "@/components";

export function DashboardSectionBlock({
  title,
  status,
  rows,
  loading,
  failed,
}: DashboardSection) {
  return (
    <div className="dashboard-section">
      <div className="dashboard-section__head">
        <h2 className="dashboard-section__title">{title}</h2>
        <Link to={`/articles?status=${status}`}>See all</Link>
      </div>
      {loading && <p className="muted">Loading...</p>}
      {failed && <Notice tone="error">Could not load articles.</Notice>}
      {!loading && !failed && <ArticleTable rows={rows} />}
    </div>
  );
}
