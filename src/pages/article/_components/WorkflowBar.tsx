import { useState } from "react";
// Style
import "./WorkflowBar.css";
// Components
import { FieldTag } from "@/components";
// Utils
import { WORKFLOW_LABEL, needsNote, type WorkflowAction } from "@/lib";

interface WorkflowBarProps {
  actions: WorkflowAction[];
  busy: boolean;
  onAction: (action: WorkflowAction, note?: string) => void;
}

const NOTE_LABEL: Partial<Record<WorkflowAction, string>> = {
  return: "Review note for the writer (required)",
  unpublish: "Reason for unpublishing (required, recorded in the audit log)",
};

export function WorkflowBar({ actions, busy, onAction }: WorkflowBarProps) {
  const [pending, setPending] = useState<WorkflowAction | null>(null);
  const [note, setNote] = useState("");

  if (actions.length === 0) return null;

  function start(action: WorkflowAction) {
    if (needsNote(action)) {
      setPending(action);
      setNote("");
      return;
    }
    onAction(action);
  }

  function confirm() {
    if (!pending || note.trim() === "") return;
    onAction(pending, note.trim());
    setPending(null);
    setNote("");
  }

  return (
    <div className="workflow">
      <div className="cluster">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => start(action)}
          >
            {WORKFLOW_LABEL[action]}
          </button>
        ))}
      </div>
      {pending && (
        <div className="workflow__note">
          <FieldTag label={NOTE_LABEL[pending] ?? "Note"}>
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </FieldTag>
          <div className="cluster">
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy || note.trim() === ""}
              onClick={confirm}
            >
              Confirm: {WORKFLOW_LABEL[pending]}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setPending(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
