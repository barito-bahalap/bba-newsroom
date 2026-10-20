import { EditorContent } from "@tiptap/react";
// Style
import "./RichTextEditor.css";
// Hooks
import { useRichTextEditor } from "@/hooks";
// Components
import { Notice } from "@/components";
import { RichTextToolbar } from ".";

interface RichTextEditorProps {
  initialHtml: string;
  resetKey: string;
  editable: boolean;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function RichTextEditor(props: RichTextEditorProps) {
  const { editor, uploading, uploadError, setLink, insertImage } =
    useRichTextEditor(props);

  if (!editor) return null;

  return (
    <div className="rt-editor">
      {props.editable && (
        <RichTextToolbar
          editor={editor}
          uploading={uploading}
          onLink={setLink}
          onImage={(file) => void insertImage(file)}
        />
      )}
      {uploading && <p className="muted">Uploading image...</p>}
      {uploadError && <Notice tone="error">{uploadError}</Notice>}
      <EditorContent editor={editor} className="rt-editor__content" />
    </div>
  );
}
