import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArticleForm from "@/components/ArticleForm";
import CorrectionPanel from "@/components/CorrectionPanel";
import RevisionList from "@/components/RevisionList";
import RichTextEditor from "@/components/RichTextEditor";
import StatusBadge from "@/components/StatusBadge";
import WorkflowBar from "@/components/WorkflowBar";
import {
  useAddCorrection,
  useArticle,
  useCorrections,
  useDeleteArticle,
  useRevisions,
  useSaveArticle,
  type SaveInput,
} from "@/hooks/useArticle";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import {
  emptyValues,
  fromArticle,
  type ArticleValues,
} from "@/lib/articleValues";
import {
  STATUS_LABEL,
  errMessage,
  formatDateTime,
  slugify,
} from "@/lib/format";
import {
  WORKFLOW_TARGET,
  availableActions,
  can,
  canDelete,
  canEditContent,
  type WorkflowAction,
} from "@/lib/permissions";
import { uploadImage } from "@/lib/storage";
import type { ArticleStatus, Revision } from "@/lib/types";

function Editor({ id }: { id: string | undefined }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isNew = !id;

  const articleQuery = useArticle(id);
  const categories = useCategories();
  const revisions = useRevisions(id);
  const corrections = useCorrections(id);
  const save = useSaveArticle();
  const remove = useDeleteArticle();
  const addCorrection = useAddCorrection(id ?? "");

  const article = articleQuery.data ?? null;

  const [values, setValues] = useState<ArticleValues>(emptyValues);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [correctionError, setCorrectionError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const loadedId = article?.id;
  useEffect(() => {
    if (!article) return;
    setValues(fromArticle(article));
    setSlugTouched(Boolean(article.slug));
    setDirty(false);
    setResetCount((count) => count + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedId]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!profile) return null;
  if (!isNew && articleQuery.isLoading)
    return <p className="muted">Loading...</p>;
  if (!isNew && articleQuery.error)
    return <p className="error">Could not load this article.</p>;
  if (!isNew && !article) {
    return (
      <div>
        <p>Article not found, or you do not have access to it.</p>
        <Link to="/articles">Back to articles</Link>
      </div>
    );
  }

  const role = profile.role;
  const status: ArticleStatus = article?.status ?? "draft";
  const isAuthor = isNew || article?.author_id === profile.id;
  const canEdit = isNew
    ? can.writeArticles(role)
    : canEditContent(role, status, isAuthor);
  const actions = isNew ? [] : availableActions(role, status, isAuthor);
  const slugLocked = Boolean(article?.published_at);

  function patch(next: Partial<ArticleValues>) {
    setValues((current) => ({ ...current, ...next }));
    setDirty(true);
    setMessage("");
  }

  function handleTitle(title: string) {
    if (!slugTouched && !slugLocked) patch({ title, slug: slugify(title) });
    else patch({ title });
  }

  function handleSlug(raw: string) {
    setSlugTouched(true);
    patch({
      slug: raw
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-{2,}/g, "-"),
    });
  }

  async function persist(transition?: SaveInput["transition"]) {
    setError("");
    setMessage("");
    try {
      const saved = await save.mutateAsync({
        id,
        values: canEdit ? { ...values, slug: slugify(values.slug) } : undefined,
        transition,
      });
      setDirty(false);
      if (isNew) {
        navigate(`/articles/${saved.id}`, { replace: true });
      } else {
        if (canEdit)
          setValues((current) => ({ ...current, slug: saved.slug ?? "" }));
        setMessage(
          transition
            ? `Status is now: ${STATUS_LABEL[saved.status]}.`
            : "Saved.",
        );
      }
    } catch (caught) {
      setError(errMessage(caught));
    }
  }

  function handleAction(action: WorkflowAction, note?: string) {
    void persist({ status: WORKFLOW_TARGET[action], note });
  }

  async function handleDelete() {
    if (!article) return;
    if (
      !window.confirm("Delete this article permanently? This cannot be undone.")
    )
      return;
    try {
      await remove.mutateAsync(article.id);
      navigate("/articles", { replace: true });
    } catch (caught) {
      setError(errMessage(caught));
    }
  }

  async function handleCoverUpload(file: File) {
    if (!profile) return;
    setUploadingCover(true);
    setError("");
    try {
      patch({ cover_url: await uploadImage(file, profile.id) });
    } catch (caught) {
      setError(errMessage(caught));
    } finally {
      setUploadingCover(false);
    }
  }

  function handleRestore(revision: Revision) {
    patch({
      title: revision.title,
      excerpt: revision.excerpt,
      body_html: revision.body_html,
    });
    setResetCount((count) => count + 1);
  }

  async function handleAddCorrection(note: string): Promise<boolean> {
    setCorrectionError("");
    try {
      await addCorrection.mutateAsync(note);
      return true;
    } catch (caught) {
      setCorrectionError(errMessage(caught));
      return false;
    }
  }

  return (
    <div>
      <div className="row between">
        <h1>{isNew ? "New article" : values.title || "(untitled)"}</h1>
        <StatusBadge status={status} />
      </div>

      {article && (
        <p className="muted">
          Created {formatDateTime(article.created_at)}. Last updated{" "}
          {formatDateTime(article.updated_at)}.
          {article.published_at &&
            ` First published ${formatDateTime(article.published_at)}.`}
        </p>
      )}

      {article && status === "draft" && article.review_note && (
        <p className="notice">Returned for changes: {article.review_note}</p>
      )}
      {article && status === "unpublished" && article.unpublished_reason && (
        <p className="notice">
          Unpublished. Reason: {article.unpublished_reason}
        </p>
      )}
      {!isNew && !canEdit && (
        <p className="notice">
          You can view this article but not edit it in its current status.
        </p>
      )}

      <div className="row actions">
        {canEdit && (
          <button
            type="button"
            disabled={save.isPending || (!isNew && !dirty)}
            onClick={() => void persist()}
          >
            {isNew ? "Save draft" : "Save changes"}
          </button>
        )}
        <WorkflowBar
          actions={actions}
          busy={save.isPending}
          onAction={handleAction}
        />
        {article && canDelete(role, status, isAuthor) && (
          <button type="button" onClick={() => void handleDelete()}>
            Delete
          </button>
        )}
      </div>

      {dirty && <p className="muted">You have unsaved changes.</p>}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <ArticleForm
        values={values}
        categories={categories.data ?? []}
        readOnly={!canEdit}
        slugLocked={slugLocked}
        uploadingCover={uploadingCover}
        onChange={patch}
        onTitleChange={handleTitle}
        onSlugChange={handleSlug}
        onUploadCover={(file) => void handleCoverUpload(file)}
        body={
          <RichTextEditor
            initialHtml={values.body_html}
            resetKey={String(resetCount)}
            editable={canEdit}
            onChange={(html) => patch({ body_html: html })}
            onUploadImage={(file) => uploadImage(file, profile.id)}
          />
        }
      />

      {article && (
        <>
          <details>
            <summary>Revisions ({revisions.data?.length ?? 0})</summary>
            <RevisionList
              revisions={revisions.data ?? []}
              canRestore={canEdit}
              onRestore={handleRestore}
            />
          </details>
          {(status === "published" || (corrections.data?.length ?? 0) > 0) && (
            <CorrectionPanel
              corrections={corrections.data ?? []}
              canAdd={can.addCorrection(role) && status === "published"}
              busy={addCorrection.isPending}
              error={correctionError}
              onAdd={handleAddCorrection}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function ArticleEditor() {
  const { id } = useParams();
  return <Editor key={id ?? "new"} id={id} />;
}
