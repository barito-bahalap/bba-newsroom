import { useParams } from "react-router-dom";
// Style
import "./ArticleEditorPage.css";
// Hooks
import { useArticleEditor } from "@/hooks";
// Components
import { Notice, PageHeader, StatusBadge } from "@/components";
import { LoadingSpinner } from "@/components";
import { ArticleMainFields, ArticleMeta, CorrectionPanel } from "./_components";
import { ArticleSidebarFields, RevisionList } from "./_components";
import { RichTextEditor, WorkflowBar } from "./_components";

function ArticleEditor({ id }: { id: string | undefined }) {
  const editor = useArticleEditor(id);

  if (editor.loading) return <LoadingSpinner />;
  if (editor.loadFailed)
    return <Notice tone="error">Could not load this article.</Notice>;
  if (editor.notFound) {
    return <Notice>Article not found, or you do not have access to it.</Notice>;
  }

  return (
    <div className="article-editor-page">
      <PageHeader
        title={
          editor.isNew ? "New article" : editor.values.title || "(untitled)"
        }
      >
        <StatusBadge status={editor.status} />
      </PageHeader>

      <ArticleMeta
        article={editor.article}
        canEdit={editor.canEdit || editor.isNew}
      />

      <div className="article-editor-page__actions">
        {editor.canEdit && (
          <button
            type="button"
            className="btn btn--primary"
            disabled={editor.saving || (!editor.isNew && !editor.dirty)}
            onClick={editor.save}
          >
            {editor.isNew ? "Save draft" : "Save changes"}
          </button>
        )}
        <WorkflowBar
          actions={editor.actions}
          busy={editor.saving}
          onAction={editor.runAction}
        />
        {editor.canDeleteArticle && (
          <button
            type="button"
            className="btn btn--danger"
            onClick={editor.deleteArticle}
          >
            Delete
          </button>
        )}
      </div>

      {editor.dirty && <p className="muted">You have unsaved changes.</p>}
      {editor.message && <Notice tone="success">{editor.message}</Notice>}
      {editor.error && <Notice tone="error">{editor.error}</Notice>}

      <div className="article-editor-page__grid">
        <ArticleMainFields
          values={editor.values}
          readOnly={!editor.canEdit}
          slugLocked={editor.slugLocked}
          onTitle={editor.changeTitle}
          onSlug={editor.changeSlug}
          onChange={editor.patch}
          body={
            <RichTextEditor
              initialHtml={editor.values.body_html}
              resetKey={editor.resetKey}
              editable={editor.canEdit}
              onChange={(html) => editor.patch({ body_html: html })}
              onUploadImage={editor.uploadBodyImage}
            />
          }
        />
        <ArticleSidebarFields
          values={editor.values}
          categories={editor.categories}
          readOnly={!editor.canEdit}
          uploadingCover={editor.uploadingCover}
          onChange={editor.patch}
          onUploadCover={editor.uploadCover}
        />
      </div>

      {editor.article && (
        <details className="article-editor-page__revisions">
          <summary>Revisions ({editor.revisions.length})</summary>
          <RevisionList
            revisions={editor.revisions}
            canRestore={editor.canEdit}
            onRestore={editor.restoreRevision}
          />
        </details>
      )}

      {editor.showCorrections && (
        <CorrectionPanel
          corrections={editor.corrections}
          canAdd={editor.canAddCorrection}
          busy={editor.addingCorrection}
          error={editor.correctionError}
          onAdd={editor.addCorrection}
        />
      )}
    </div>
  );
}

export default function ArticleEditorPage() {
  const { id } = useParams();
  return <ArticleEditor key={id ?? "new"} id={id} />;
}
