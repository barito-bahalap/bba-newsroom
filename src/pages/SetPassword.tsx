import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const MIN_LENGTH = 12;

export default function SetPassword() {
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <p className="center">Loading...</p>;

  if (!session) {
    return (
      <div className="card-narrow">
        <h1>Link expired</h1>
        <p>
          This link is invalid or has expired. Request a new one from the
          sign-in page.
        </p>
        <Link to="/login">Go to sign in</Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const message = await updatePassword(password);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="card-narrow">
      <h1>Set your password</h1>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <label className="field">
          <span>New password (min {MIN_LENGTH} characters)</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          Save password
        </button>
      </form>
    </div>
  );
}
