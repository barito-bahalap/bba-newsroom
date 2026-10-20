import { useState } from "react";
// Style
import "./CorrectionPanel.css";
// Components
import { Notice } from "@/components";
// Utils
import { formatDateTime, type Correction } from "@/lib";

interface CorrectionPanelProps {
  corrections: Correction[];
  canAdd: boolean;
  busy: boolean;
  error: string;
  onAdd: (note: string) => Promise<boolean>;
}

export function CorrectionPanel({
  corrections,
  canAdd,
  busy,
  error,
  onAdd,
}: CorrectionPanelProps) {
  const [note, setNote] = useState("");

  async function submit() {
    if (note.trim() === "") return;
    const added = await onAdd(note);
    if (added) setNote("");
  }

  return (
    <section className="corrections">
      <h2 className="corrections__title">Corrections</h2>
      <p className="muted">
        Corrections are public notices shown on the article. They cannot be
        edited or removed.
      </p>
      {corrections.length === 0 && <p className="muted">None.</p>}
      <ul className="corrections__list">
        {corrections.map((correction) => (
          <li key={correction.id} className="corrections__item">
            <div>{correction.note}</div>
            <div className="muted">
              {formatDateTime(correction.created_at)} by{" "}
              {correction.author?.full_name ?? "Unknown"}
            </div>
          </li>
        ))}
      </ul>
      {canAdd && (
        <div className="corrections__form">
          <textarea
            rows={3}
            value={note}
            placeholder="Describe the correction"
            onChange={(event) => setNote(event.target.value)}
          />
          {error && <Notice tone="error">{error}</Notice>}
          <div>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy || note.trim() === ""}
              onClick={() => void submit()}
            >
              Publish correction notice
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
