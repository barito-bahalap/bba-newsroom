import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { authLink } from "@/lib/supabase";
import { Input } from "@barito-bahalap/components";

export default function LoginPage() {
  const { session, loading, signIn, sendReset } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(authLink.error ?? "");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  if (!loading && session) return <Navigate to={from} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    if (forgot) {
      await sendReset(email.trim());
      setInfo(
        "If that email belongs to a team member, a reset link has been sent.",
      );
    } else {
      const message = await signIn(email.trim(), password);
      if (message) setError(message);
    }
    setBusy(false);
  }

  return (
    <div className="card-narrow">
      <h1>BBM Newsroom</h1>
      <p className="muted">
        Internal tool for the Barito Bahalap Media editorial team.
      </p>
      <form onSubmit={(event) => void handleSubmit(event)}>
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
          />
        )}
        {error && <p className="error">{error}</p>}
        {info && <p className="notice">{info}</p>}
        <div className="row">
          <button type="submit" disabled={busy}>
            {forgot ? "Send reset link" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForgot((value) => !value);
              setError("");
              setInfo("");
            }}
          >
            {forgot ? "Back to sign in" : "Forgot password"}
          </button>
        </div>
      </form>
    </div>
  );
}
