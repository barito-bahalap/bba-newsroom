import { Link } from "react-router-dom";
// Style
import "./ArticleTable.css";
// Components
import { StatusBadge } from "./StatusBadge";
// Utils
import { formatDateTime, type ArticleListRow } from "@/lib";

export function ArticleTable({ rows }: { rows: ArticleListRow[] }) {
  if (rows.length === 0) return <p className="muted">No articles.</p>;
  return (
    <div className="data-table-wrap">
      <table className="data-table article-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Category</th>
            <th>Author</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="article-table__title">
                <Link to={`/articles/${row.id}`}>
                  {row.title || "(untitled)"}
                </Link>
              </td>
              <td>
                <StatusBadge status={row.status} />
              </td>
              <td>{row.category?.name ?? "-"}</td>
              <td>{row.author?.full_name ?? "-"}</td>
              <td>{formatDateTime(row.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
