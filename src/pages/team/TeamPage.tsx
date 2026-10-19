import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTeam, useUpdateMember } from "@/hooks/useTeam";
import { ROLE_LABEL, errMessage, formatDateTime } from "@/lib/format";
import type { Role } from "@/lib/types";

const ROLES = Object.keys(ROLE_LABEL) as Role[];

export default function TeamPage() {
  const { profile } = useAuth();
  const team = useTeam();
  const update = useUpdateMember();
  const [error, setError] = useState("");

  async function change(
    input: { id: string; role?: Role; is_active?: boolean },
    label: string,
  ) {
    if (!window.confirm(label)) return;
    setError("");
    try {
      await update.mutateAsync(input);
    } catch (caught) {
      setError(errMessage(caught));
    }
  }

  return (
    <div>
      <h1>TeamPage</h1>
      <p className="muted">
        New members are invited from the Supabase dashboard (Authentication,
        Users, Invite user). They appear here as inactive until you activate
        them and assign a role.
      </p>
      <ul>
        <li>Writer: writes drafts and submits them for review.</li>
        <li>
          Editor: edits drafts and articles in review, returns them with a note.
        </li>
        <li>
          Publisher: publishes and unpublishes, manages categories, adds
          corrections.
        </li>
        <li>
          Admin: governance only. Manages the team, reads the audit log, can
          unpublish with a reason. Cannot write, edit or publish.
        </li>
      </ul>

      {error && <p className="error">{error}</p>}
      {team.isLoading && <p className="muted">Loading...</p>}
      {team.error && <p className="error">Could not load the team.</p>}

      {team.data && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {team.data.map((member) => {
              const isSelf = member.id === profile?.id;
              return (
                <tr key={member.id}>
                  <td>
                    {member.full_name || "-"}{" "}
                    {isSelf && <span className="muted">(you)</span>}
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <select
                      value={member.role}
                      disabled={isSelf || update.isPending}
                      onChange={(event) =>
                        void change(
                          { id: member.id, role: event.target.value as Role },
                          `Change ${member.email} to ${ROLE_LABEL[event.target.value as Role]}?`,
                        )
                      }
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={member.is_active}
                      disabled={isSelf || update.isPending}
                      onChange={(event) =>
                        void change(
                          { id: member.id, is_active: event.target.checked },
                          `${event.target.checked ? "Activate" : "Deactivate"} ${member.email}?`,
                        )
                      }
                    />
                  </td>
                  <td>{formatDateTime(member.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
