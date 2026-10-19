import { STATUS_LABEL } from "@/lib/format";
import type { ArticleStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
  );
}
