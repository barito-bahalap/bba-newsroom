// Style
import "./ArticleMeta.css";
// Components
import { Notice } from "@/components";
// Utils
import { formatDateTime } from "@/lib";
import type { Article } from "@/lib";

export function ArticleMeta({
  article,
  canEdit,
}: {
  article: Article | null;
  canEdit: boolean;
}) {
  if (!article) return null;
  return (
    <>
      <p className="muted">
        Created {formatDateTime(article.created_at)}. Last updated{" "}
        {formatDateTime(article.updated_at)}.
        {article.published_at &&
          ` First published ${formatDateTime(article.published_at)}.`}
      </p>
      {article.status === "draft" && article.review_note && (
        <Notice>Returned for changes: {article.review_note}</Notice>
      )}
      {article.status === "unpublished" && article.unpublished_reason && (
        <Notice>Unpublished. Reason: {article.unpublished_reason}</Notice>
      )}
      {!canEdit && (
        <Notice>
          You can view this article but not edit it in its current status.
        </Notice>
      )}
    </>
  );
}
