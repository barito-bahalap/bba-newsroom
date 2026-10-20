import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Contexts & Hooks
import { useAuth } from "@/contexts";
import {
  useAddCorrection,
  useArticle,
  useCorrections,
  useDeleteArticle,
  useRevisions,
  useSaveArticle,
  useCategories,
  type SaveInput,
} from ".";
// Utils
import {
  STATUS_LABEL,
  WORKFLOW_TARGET,
  availableActions,
  can,
  canDelete,
  canEditContent,
  emptyValues,
  errMessage,
  fromArticle,
  slugify,
  uploadImage,
} from "@/lib";
import type {
  ArticleStatus,
  ArticleValues,
  Revision,
  WorkflowAction,
} from "@/lib";

export function useArticleEditor(id: string | undefined) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isNew = !id;

  const articleQuery = useArticle(id);
  const categories = useCategories();
  const revisions = useRevisions(id);
  const corrections = useCorrections(id);
  const save = useSaveArticle();
  const remove = useDeleteArticle();
  const addCorrectionMutation = useAddCorrection(id ?? "");

  const article = articleQuery.data ?? null;

  const [values, setValues] = useState<ArticleValues>(emptyValues);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [correctionError, setCorrectionError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [loadedId, setLoadedId] = useState<string>();

  if (article && loadedId !== article.id) {
    setLoadedId(article.id);
    setValues(fromArticle(article));
    setSlugTouched(Boolean(article.slug));
    setDirty(false);
    setResetCount((count) => count + 1);
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const role = profile?.role;
  const status: ArticleStatus = article?.status ?? "draft";
  const isAuthor = isNew || article?.author_id === profile?.id;
  const canEdit = role
    ? isNew
      ? can.writeArticles(role)
      : canEditContent(role, status, isAuthor)
    : false;
  const actions =
    role && !isNew ? availableActions(role, status, isAuthor) : [];
  const canDeleteArticle = Boolean(
    role && article && canDelete(role, status, isAuthor),
  );
  const canAddCorrection = Boolean(
    role && can.addCorrection(role) && status === "published",
  );
  const slugLocked = Boolean(article?.published_at);
  const showCorrections =
    Boolean(article) &&
    (status === "published" || (corrections.data?.length ?? 0) > 0);

  function patch(next: Partial<ArticleValues>) {
    setValues((current) => ({ ...current, ...next }));
    setDirty(true);
    setMessage("");
  }

  function changeTitle(title: string) {
    if (!slugTouched && !slugLocked) patch({ title, slug: slugify(title) });
    else patch({ title });
  }

  function changeSlug(raw: string) {
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
        return;
      }
      if (canEdit)
        setValues((current) => ({ ...current, slug: saved.slug ?? "" }));
      setMessage(
        transition ? `Status is now: ${STATUS_LABEL[saved.status]}.` : "Saved.",
      );
    } catch (caught) {
      setError(errMessage(caught));
    }
  }

  function runAction(action: WorkflowAction, note?: string) {
    void persist({ status: WORKFLOW_TARGET[action], note });
  }

  async function deleteArticle() {
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

  async function uploadCover(file: File) {
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

  async function uploadBodyImage(file: File): Promise<string> {
    if (!profile) throw new Error("Not signed in.");
    return uploadImage(file, profile.id);
  }

  function restoreRevision(revision: Revision) {
    patch({
      title: revision.title,
      excerpt: revision.excerpt,
      body_html: revision.body_html,
    });
    setResetCount((count) => count + 1);
  }

  async function addCorrection(note: string): Promise<boolean> {
    setCorrectionError("");
    try {
      await addCorrectionMutation.mutateAsync(note);
      return true;
    } catch (caught) {
      setCorrectionError(errMessage(caught));
      return false;
    }
  }

  return {
    isNew,
    article,
    status,
    values,
    dirty,
    message,
    error,
    correctionError,
    uploadingCover,
    resetKey: String(resetCount),
    loading: !isNew && articleQuery.isLoading,
    loadFailed: !isNew && Boolean(articleQuery.error),
    notFound:
      !isNew && !articleQuery.isLoading && !articleQuery.error && !article,
    categories: categories.data ?? [],
    revisions: revisions.data ?? [],
    corrections: corrections.data ?? [],
    canEdit,
    actions,
    canDeleteArticle,
    canAddCorrection,
    slugLocked,
    showCorrections,
    saving: save.isPending,
    addingCorrection: addCorrectionMutation.isPending,
    patch,
    changeTitle,
    changeSlug,
    save: () => void persist(),
    runAction,
    deleteArticle: () => void deleteArticle(),
    uploadCover: (file: File) => void uploadCover(file),
    uploadBodyImage,
    restoreRevision,
    addCorrection,
  };
}
