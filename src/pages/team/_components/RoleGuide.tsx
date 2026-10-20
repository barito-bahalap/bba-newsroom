// Style
import "./RoleGuide.css";

const GUIDE = [
  ["Writer", "writes drafts and submits them for review."],
  [
    "Editor",
    "edits drafts and articles in review, returns them with a note, adds corrections.",
  ],
  [
    "Publisher",
    "publishes and unpublishes, manages categories, adds corrections.",
  ],
  [
    "Admin",
    "governance only. Manages the team, reads the audit log, can unpublish with a reason. Cannot write, edit or publish.",
  ],
];

export function RoleGuide() {
  return (
    <ul className="role-guide">
      {GUIDE.map(([role, text]) => (
        <li key={role}>
          <strong>{role}:</strong> {text}
        </li>
      ))}
    </ul>
  );
}
