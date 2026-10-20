import type { FormEvent } from "react";
// Style
import "./PasswordForm.css";
// Hooks
import { MIN_PASSWORD_LENGTH } from "@/hooks";
// Components
import { FieldTag, Notice } from ".";

interface PasswordFormProps {
  password: string;
  confirm: string;
  error: string;
  success: string;
  busy: boolean;
  submitLabel: string;
  setPassword: (value: string) => void;
  setConfirm: (value: string) => void;
  submit: () => void;
}

export function PasswordForm({
  password,
  confirm,
  error,
  success,
  busy,
  submitLabel,
  setPassword,
  setConfirm,
  submit,
}: PasswordFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  return (
    <form className="password-form" onSubmit={handleSubmit}>
      <FieldTag label={`New password (min ${MIN_PASSWORD_LENGTH} characters)`}>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FieldTag>
      <FieldTag label="Confirm password">
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </FieldTag>
      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}
      <div>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
