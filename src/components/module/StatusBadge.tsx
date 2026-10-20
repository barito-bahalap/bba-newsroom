// Style
import "./StatusBadge.css";
// Utils
import { STATUS_LABEL, type ArticleStatus } from "@/lib";

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
