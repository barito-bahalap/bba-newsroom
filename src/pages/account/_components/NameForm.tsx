import type { FormEvent } from "react";
// Style
import "./NameForm.css";
// Components
import { FieldTag, Notice } from "@/components";

interface NameFormProps {
  name: string;
  message: string;
  failed: boolean;
  busy: boolean;
  setName: (value: string) => void;
  submit: () => void;
}

export function NameForm({
  name,
  message,
  failed,
  busy,
  setName,
  submit,
}: NameFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  return (
    <form className="name-form" onSubmit={handleSubmit}>
      <FieldTag label="Full name">
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FieldTag>
      {message && (
        <Notice tone={failed ? "error" : "success"}>{message}</Notice>
      )}
      <div>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={busy || name.trim() === ""}
        >
          Save name
        </button>
      </div>
    </form>
  );
}
