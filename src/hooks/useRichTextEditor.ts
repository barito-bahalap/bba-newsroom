import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

interface Options {
  initialHtml: string;
  resetKey: string;
  editable: boolean;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function useRichTextEditor({
  initialHtml,
  resetKey,
  editable,
  onChange,
  onUploadImage,
}: Options) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
      onChangeRef.current(current.isEmpty ? "" : current.getHTML());
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

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const insertImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploadError("");
      setUploading(true);
      try {
        const src = await onUploadImage(file);
        const alt = window.prompt("Image description (alt text)", "") ?? "";
        editor.chain().focus().setImage({ src, alt }).run();
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [editor, onUploadImage],
  );

  return { editor, uploading, uploadError, setLink, insertImage };
}
