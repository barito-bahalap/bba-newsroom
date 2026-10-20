import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
// Style
import "./RichTextEditor.css";

interface Props {
  initialHtml: string;
  resetKey: string;
  editable: boolean;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function RichTextEditor({
  initialHtml,
  resetKey,
  editable,
  onChange,
  onUploadImage,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      Placeholder.configure({ placeholder: "Write the article here..." }),
    ],
    content: initialHtml,
    editable,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: current }) => {
      onChange(current.isEmpty ? "" : current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(initialHtml, { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, resetKey]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "Link URL (leave empty to remove)",
      previous ?? "https://",
    );
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }

  async function handleFile(file: File | undefined) {
    if (!file || !editor) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      const alt = window.prompt("Image description (alt text)", "") ?? "";
      editor.chain().focus().setImage({ src: url, alt }).run();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const button = (
    label: string,
    active: boolean,
    run: () => void,
    disabled = false,
  ) => (
    <button
      type="button"
      className={active ? "active" : ""}
      disabled={disabled}
      onClick={run}
    >
      {label}
    </button>
  );

  return (
    <div>
      {editable && (
        <div className="editor-toolbar">
          {button("Bold", editor.isActive("bold"), () =>
            editor.chain().focus().toggleBold().run(),
          )}
          {button("Italic", editor.isActive("italic"), () =>
            editor.chain().focus().toggleItalic().run(),
          )}
          {button("H2", editor.isActive("heading", { level: 2 }), () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
          )}
          {button("H3", editor.isActive("heading", { level: 3 }), () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
          )}
          {button("Bullets", editor.isActive("bulletList"), () =>
            editor.chain().focus().toggleBulletList().run(),
          )}
          {button("Numbers", editor.isActive("orderedList"), () =>
            editor.chain().focus().toggleOrderedList().run(),
          )}
          {button("Quote", editor.isActive("blockquote"), () =>
            editor.chain().focus().toggleBlockquote().run(),
          )}
          {button("Link", editor.isActive("link"), setLink)}
          {button("Image", false, () => fileInput.current?.click(), uploading)}
          {button("Line", false, () =>
            editor.chain().focus().setHorizontalRule().run(),
          )}
          {button(
            "Undo",
            false,
            () => editor.chain().focus().undo().run(),
            !editor.can().undo(),
          )}
          {button(
            "Redo",
            false,
            () => editor.chain().focus().redo().run(),
            !editor.can().redo(),
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
        </div>
      )}
      {uploading && <p className="muted">Uploading image...</p>}
      {uploadError && <p className="error">{uploadError}</p>}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
