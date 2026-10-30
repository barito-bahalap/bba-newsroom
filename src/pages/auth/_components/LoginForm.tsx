import type { FormEvent } from "react";
// Style
import "./LoginForm.css";
// Components
import { Button, Input, Notice } from "@/components";

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
      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {!forgot && (
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          obscurial
        />
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice>{info}</Notice>}

      <div className="stack center">
        <Button
          label={forgot ? "Send reset link" : "Sign in"}
          type="submit"
          disabled={busy}
        />
        <Button
          label={forgot ? "Back to sign in" : "Forgot password"}
          type="button"
          className="btn"
          onClick={toggleForgot}
        />
      </div>
    </form>
  );
}
