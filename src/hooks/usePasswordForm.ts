import { useState } from "react";
// Hooks
import { useAuth } from "@/contexts";

export const MIN_PASSWORD_LENGTH = 12;

export function usePasswordForm(onDone?: () => void) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setSuccess("");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
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
    setPassword("");
    setConfirm("");
    setSuccess("Password updated.");
    onDone?.();
  }

  return {
    password,
    confirm,
    error,
    success,
    busy,
    setPassword,
    setConfirm,
    submit,
  };
}
