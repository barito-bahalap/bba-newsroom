import { useState } from "react";
// Hooks
import { useAuth } from "@/contexts";
// Utils
import { authLink } from "@/lib";

export function useLoginForm() {
  const { signIn, sendReset } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(authLink.error ?? "");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  async function submit() {
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

  function toggleForgot() {
    setForgot((value) => !value);
    setError("");
    setInfo("");
  }

  return {
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
  };
}
