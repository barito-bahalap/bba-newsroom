import { useState } from "react";
// Style
import "./WorkflowBar.css";
// Utils
import { WORKFLOW_LABEL, needsNote, type WorkflowAction } from "@/lib";

interface Props {
  actions: WorkflowAction[];
  busy: boolean;
  onAction: (action: WorkflowAction, note?: string) => void;
}

const NOTE_LABEL: Partial<Record<WorkflowAction, string>> = {
  return: "Review note for the writer (required)",
  unpublish: "Reason for unpublishing (required, recorded in the audit log)",
};

export function WorkflowBar({ actions, busy, onAction }: Props) {
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
      <div className="row">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            disabled={busy}
            onClick={() => start(action)}
          >
            {WORKFLOW_LABEL[action]}
          </button>
        ))}
      </div>
      {pending && (
        <div className="field">
          <span className="label">{NOTE_LABEL[pending]}</span>
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="row">
            <button
              type="button"
              disabled={busy || note.trim() === ""}
              onClick={confirm}
            >
              Confirm: {WORKFLOW_LABEL[pending]}
            </button>
            <button type="button" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
