// Style
import "./AuditPage.css";
// Hooks
import { AUDIT_PAGE_SIZE, useAuditView } from "@/hooks";
// Components
import { Notice, PageHeader, Pagination } from "@/components";
import { AuditFilter, AuditTable } from "./_components";

export default function AuditPage() {
  const { entity, page, audit, setEntity, setPage } = useAuditView();

  return (
    <div className="audit-page">
      <PageHeader title="Audit log" />
      <p className="muted">
        Entries are written by the database and cannot be edited or deleted from
        this app.
      </p>
      <AuditFilter entity={entity} onEntity={setEntity} />

      {audit.isLoading && <p className="muted">Loading...</p>}
      {audit.error && (
        <Notice tone="error">Could not load the audit log.</Notice>
      )}
      {audit.data && (
        <>
          <AuditTable rows={audit.data.rows} />
          <Pagination
            page={page}
            totalPages={Math.ceil(audit.data.total / AUDIT_PAGE_SIZE)}
            onPageChange={setPage}
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
