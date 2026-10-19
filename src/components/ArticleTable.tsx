import { Link } from "react-router-dom";
import { formatDateTime } from "@/lib/format";
import type { ArticleListRow } from "@/lib/types";
import StatusBadge from "./StatusBadge";

export default function ArticleTable({ rows }: { rows: ArticleListRow[] }) {
  if (rows.length === 0) return <p className="muted">No articles.</p>;
  return (
    <table>
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
            <td>
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
  );
}
