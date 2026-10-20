// Style
import "./RevisionList.css";
// Utils
import { formatDateTime, type Revision } from "@/lib";

interface Props {
  revisions: Revision[];
  canRestore: boolean;
  onRestore: (revision: Revision) => void;
}

export function RevisionList({ revisions, canRestore, onRestore }: Props) {
  if (revisions.length === 0) return <p className="muted">No revisions yet.</p>;
  return (
    <ul className="plain">
      {revisions.map((revision) => (
        <li key={revision.id}>
          <div>{formatDateTime(revision.created_at)}</div>
          <div className="muted">{revision.editor?.full_name ?? "Unknown"}</div>
          {canRestore && (
            <button type="button" onClick={() => onRestore(revision)}>
              Load into editor
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
