// Style
import "./RevisionList.css";
// Utils
import { formatDateTime, type Revision } from "@/lib";

interface RevisionListProps {
  revisions: Revision[];
  canRestore: boolean;
  onRestore: (revision: Revision) => void;
}

export function RevisionList({
  revisions,
  canRestore,
  onRestore,
}: RevisionListProps) {
  if (revisions.length === 0) return <p className="muted">No revisions yet.</p>;
  return (
    <ul className="revisions">
      {revisions.map((revision) => (
        <li key={revision.id} className="revisions__item">
          <div>
            <div>{formatDateTime(revision.created_at)}</div>
            <div className="muted">
              {revision.editor?.full_name ?? "Unknown"}
            </div>
          </div>
          {canRestore && (
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => onRestore(revision)}
            >
              Load into editor
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
