import { useState } from "react";
// Contexts & Hooks
import { useAuth } from "@/contexts";
import { useUpdateOwnName } from ".";
// Utils
import { errMessage } from "@/lib";

export function useNameForm() {
  const { profile, refreshProfile } = useAuth();
  const update = useUpdateOwnName();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function submit() {
    if (!profile) return;
    setMessage("");
    setFailed(false);
    try {
      await update.mutateAsync({ id: profile.id, full_name: name });
      await refreshProfile();
      setMessage("Name updated.");
    } catch (error) {
      setFailed(true);
      setMessage(errMessage(error));
    }
  }

  return { name, message, failed, busy: update.isPending, setName, submit };
}
