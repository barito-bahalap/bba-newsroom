import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateOwnName } from "@/hooks/useTeam";
import { ROLE_LABEL, errMessage } from "@/lib/format";

const MIN_LENGTH = 12;

export default function AccountPage() {
  const { profile, refreshProfile, updatePassword } = useAuth();
  const updateName = useUpdateOwnName();

  const [name, setName] = useState(profile?.full_name ?? "");
  const [nameMessage, setNameMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  if (!profile) return null;

  async function handleName(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setNameMessage("");
    try {
      await updateName.mutateAsync({ id: profile.id, full_name: name });
      await refreshProfile();
      setNameMessage("Name updated.");
    } catch (caught) {
      setNameMessage(errMessage(caught));
    }
  }

  async function handlePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    if (password.length < MIN_LENGTH) {
      setPasswordError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    const message = await updatePassword(password);
    if (message) {
      setPasswordError(message);
      return;
    }
    setPassword("");
    setConfirm("");
    setPasswordMessage("Password updated.");
  }

  return (
    <div className="card-narrow">
      <h1>AccountPage</h1>
      <p>
        {profile.email} ({ROLE_LABEL[profile.role]})
      </p>

      <h2>Display name</h2>
      <p className="muted">
        Shown as the default byline on articles you write.
      </p>
      <form onSubmit={(event) => void handleName(event)}>
        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        {nameMessage && <p className="notice">{nameMessage}</p>}
        <button
          type="submit"
          disabled={updateName.isPending || name.trim() === ""}
        >
          Save name
        </button>
      </form>

      <h2>Change password</h2>
      <form onSubmit={(event) => void handlePassword(event)}>
        <label className="field">
          <span>New password (min {MIN_LENGTH} characters)</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </label>
        {passwordError && <p className="error">{passwordError}</p>}
        {passwordMessage && <p className="success">{passwordMessage}</p>}
        <button type="submit">Update password</button>
      </form>
    </div>
  );
}
