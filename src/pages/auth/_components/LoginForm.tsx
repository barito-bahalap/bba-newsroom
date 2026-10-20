import type { FormEvent } from "react";
// Style
import "./LoginForm.css";
// Components
import { FieldTag, Notice } from "@/components";

interface LoginFormProps {
  email: string;
  password: string;
  forgot: boolean;
  error: string;
  info: string;
  busy: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  toggleForgot: () => void;
  submit: () => void;
}

export function LoginForm({
  email,
  password,
  forgot,
  error,
  info,
  busy,
  setEmail,
  setPassword,
  toggleForgot,
  submit,
}: LoginFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <FieldTag label="Email">
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FieldTag>
      {!forgot && (
        <FieldTag label="Password">
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FieldTag>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice>{info}</Notice>}
      <div className="cluster">
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {forgot ? "Send reset link" : "Sign in"}
        </button>
        <button type="button" className="btn" onClick={toggleForgot}>
          {forgot ? "Back to sign in" : "Forgot password"}
        </button>
      </div>
    </form>
  );
}
