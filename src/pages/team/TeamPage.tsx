// Style
import "./TeamPage.css";
// Hooks
import { useTeamAdmin } from "@/hooks";
// Components
import { Notice, PageHeader } from "@/components";
import { RoleGuide, TeamTable } from "./_components";

export default function TeamPage() {
  const admin = useTeamAdmin();
  const { team } = admin;

  return (
    <div className="team-page">
      <PageHeader title="Team" />
      <p className="muted">
        New members are invited from the Supabase dashboard (Authentication,
        Users, Invite user). They appear here as inactive until you activate
        them and assign a role.
      </p>
      <RoleGuide />

      {admin.error && <Notice tone="error">{admin.error}</Notice>}
      {team.isLoading && <p className="muted">Loading...</p>}
      {team.error && <Notice tone="error">Could not load the team.</Notice>}
      {team.data && (
        <TeamTable
          members={team.data}
          selfId={admin.selfId}
          busy={admin.busy}
          onRole={admin.changeRole}
          onActive={admin.setActive}
        />
      )}
    </div>
  );
}
