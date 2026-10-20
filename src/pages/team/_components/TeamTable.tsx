// Style
import "./TeamTable.css";
// Utils
import { ROLES, ROLE_LABEL, formatDateTime } from "@/lib";
import type { Profile, Role } from "@/lib";

interface TeamTableProps {
  members: Profile[];
  selfId: string | null;
  busy: boolean;
  onRole: (member: Profile, role: Role) => void;
  onActive: (member: Profile, active: boolean) => void;
}

export function TeamTable({
  members,
  selfId,
  busy,
  onRole,
  onActive,
}: TeamTableProps) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
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
          {members.map((member) => {
            const isSelf = member.id === selfId;
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
                    aria-label={`Role of ${member.email}`}
                    disabled={isSelf || busy}
                    onChange={(event) =>
                      onRole(member, event.target.value as Role)
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
                    aria-label={`Active: ${member.email}`}
                    checked={member.is_active}
                    disabled={isSelf || busy}
                    onChange={(event) => onActive(member, event.target.checked)}
                  />
                </td>
                <td>{formatDateTime(member.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
