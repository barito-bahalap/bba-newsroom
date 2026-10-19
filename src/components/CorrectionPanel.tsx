import { useState } from "react";
import { formatDateTime } from "@/lib/format";
import type { Correction } from "@/lib/types";

interface Props {
  corrections: Correction[];
  canAdd: boolean;
  busy: boolean;
  error: string;
  onAdd: (note: string) => Promise<boolean>;
}

export default function CorrectionPanel({
  corrections,
  canAdd,
  busy,
  error,
  onAdd,
}: Props) {
  const [note, setNote] = useState("");

  async function submit() {
    if (note.trim() === "") return;
    const added = await onAdd(note);
    if (added) setNote("");
  }

  return (
    <section>
      <h3>Corrections</h3>
      <p className="muted">
        Corrections are public notices shown on the article. They cannot be
        edited or removed.
      </p>
      {corrections.length === 0 && <p className="muted">None.</p>}
      <ul className="plain">
        {corrections.map((correction) => (
          <li key={correction.id}>
            <div>{correction.note}</div>
            <div className="muted">
              {formatDateTime(correction.created_at)} by{" "}
              {correction.author?.full_name ?? "Unknown"}
            </div>
          </li>
        ))}
      </ul>
      {canAdd && (
        <div className="field">
          <textarea
            rows={3}
            value={note}
            placeholder="Describe the correction"
            onChange={(event) => setNote(event.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button
            type="button"
            disabled={busy || note.trim() === ""}
            onClick={() => void submit()}
          >
            Publish correction notice
          </button>
        </div>
      )}
    </section>
  );
}
