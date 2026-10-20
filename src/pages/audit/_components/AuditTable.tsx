// Style
import "./AuditTable.css";
// Utils
import { formatDateTime, summarizeAudit, type AuditRow } from "@/lib";

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  if (rows.length === 0) return <p className="muted">No entries.</p>;
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Who</th>
            <th>Action</th>
            <th>Summary</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{formatDateTime(row.created_at)}</td>
              <td>{row.actor?.full_name || row.actor?.email || "System"}</td>
              <td>
                <code>{row.action}</code>
              </td>
              <td>{summarizeAudit(row)}</td>
              <td>
                <details>
                  <summary>View</summary>
                  <pre className="audit-table__json">
                    {JSON.stringify(row.detail, null, 2)}
                  </pre>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
