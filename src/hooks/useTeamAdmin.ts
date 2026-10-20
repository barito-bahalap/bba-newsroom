import { useState } from "react";
// Contexts & Hooks
import { useAuth } from "@/contexts";
import { useTeam, useUpdateMember } from ".";
// Utils
import { ROLE_LABEL, errMessage } from "@/lib";
import type { Profile, Role } from "@/lib";

export function useTeamAdmin() {
  const { profile } = useAuth();
  const team = useTeam();
  const update = useUpdateMember();
  const [error, setError] = useState("");

  async function apply(
    input: { id: string; role?: Role; is_active?: boolean },
    question: string,
  ) {
    if (!window.confirm(question)) return;
    setError("");
    try {
      await update.mutateAsync(input);
    } catch (caught) {
      setError(errMessage(caught));
    }
  }

  function changeRole(member: Profile, role: Role) {
    void apply(
      { id: member.id, role },
      `Change ${member.email} to ${ROLE_LABEL[role]}?`,
    );
  }

  function setActive(member: Profile, active: boolean) {
    void apply(
      { id: member.id, is_active: active },
      `${active ? "Activate" : "Deactivate"} ${member.email}?`,
    );
  }

  return {
    team,
    selfId: profile?.id ?? null,
    error,
    busy: update.isPending,
    changeRole,
    setActive,
  };
}
