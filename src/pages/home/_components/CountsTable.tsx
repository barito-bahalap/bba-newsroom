import { Link } from "react-router-dom";
// Style
import "./CountsTable.css";
// Components
import { Notice } from "@/components";
// Utils
import { STATUSES, STATUS_LABEL, type ArticleStatus } from "@/lib";

interface CountsTableProps {
  counts: Record<ArticleStatus, number> | undefined;
  failed: boolean;
}

export function CountsTable({ counts, failed }: CountsTableProps) {
  return (
    <div className="counts">
      <h2 className="counts__title">Overview</h2>
      {failed && <Notice tone="error">Could not load counts.</Notice>}
      <div className="counts__grid">
        {STATUSES.map((status) => (
          <Link
            key={status}
            to={`/articles?status=${status}`}
            className="counts__item"
          >
            <span className="counts__value">
              {counts ? counts[status] : "-"}
            </span>
            <span className="counts__label">{STATUS_LABEL[status]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
