import { useState } from "react";
import Pagination from "@/components/Pagination";
import { AUDIT_PAGE_SIZE, useAuditLog } from "@/hooks/useAudit";
import { formatDateTime } from "@/lib/format";
import type { AuditRow } from "@/lib/types";

const ENTITIES = [
  { value: "", label: "Everything" },
  { value: "article", label: "Articles" },
  { value: "profile", label: "Team" },
  { value: "categories", label: "Categories" },
  { value: "corrections", label: "Corrections" },
];

function summarize(row: AuditRow): string {
  const detail = row.detail as Record<string, unknown>;
  switch (row.action) {
    case "article.status_changed": {
      const reason = (detail.reason ?? detail.review_note) as
        | string
        | null
        | undefined;
      return `${String(detail.title ?? "")}: ${String(detail.from)} -> ${String(detail.to)}${
        reason ? ` (${reason})` : ""
      }`;
    }
    case "article.created":
    case "article.deleted":
      return String(detail.title ?? "");
    case "member.invited":
      return String(detail.email ?? "");
    case "member.updated":
      return `${String(detail.email)}: role ${String(detail.role_from)} -> ${String(
        detail.role_to,
      )}, active ${String(detail.active_from)} -> ${String(detail.active_to)}`;
    case "corrections.insert":
      return String(detail.note ?? "");
    default:
      return String(detail.name ?? "");
  }
}

export default function AuditLog() {
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);
  const audit = useAuditLog(entity, page);

  return (
    <div>
      <h1>Audit log</h1>
      <p className="muted">
        Entries are written by the database and cannot be edited or deleted from
        this app.
      </p>
      <div className="row">
        <select
          value={entity}
          onChange={(event) => {
            setEntity(event.target.value);
            setPage(1);
          }}
        >
          {ENTITIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {audit.isLoading && <p className="muted">Loading...</p>}
      {audit.error && <p className="error">Could not load the audit log.</p>}

      {audit.data && (
        <>
          <table>
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
              {audit.data.rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDateTime(row.created_at)}</td>
                  <td>
                    {row.actor?.full_name || row.actor?.email || "System"}
                  </td>
                  <td>
                    <code>{row.action}</code>
                  </td>
                  <td>{summarize(row)}</td>
                  <td>
                    <details>
                      <summary>View</summary>
                      <pre>{JSON.stringify(row.detail, null, 2)}</pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            pageSize={AUDIT_PAGE_SIZE}
            total={audit.data.total}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}
