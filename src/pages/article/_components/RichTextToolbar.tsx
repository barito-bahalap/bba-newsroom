import { useRef } from "react";
import type { Editor } from "@tiptap/react";
// Style
import "./RichTextToolbar.css";

interface RichTextToolbarProps {
  editor: Editor;
  uploading: boolean;
  onLink: () => void;
  onImage: (file: File) => void;
}

interface ToolbarButton {
  label: string;
  active: boolean;
  disabled?: boolean;
  run: () => void;
}

function ImageButton({
  disabled,
  onImage,
}: {
  disabled: boolean;
  onImage: (file: File) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        className="btn btn--sm rt-toolbar__btn"
        disabled={disabled}
        onClick={() => fileInput.current?.click()}
      >
        Image
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImage(file);
          event.target.value = "";
        }}
      />
    </>
  );
}

export function RichTextToolbar({
  editor,
  uploading,
  onLink,
  onImage,
}: RichTextToolbarProps) {
  const chain = () => editor.chain().focus();

  const before: ToolbarButton[] = [
    {
      label: "Bold",
      active: editor.isActive("bold"),
      run: () => chain().toggleBold().run(),
    },
    {
      label: "Italic",
      active: editor.isActive("italic"),
      run: () => chain().toggleItalic().run(),
    },
    {
      label: "H2",
      active: editor.isActive("heading", { level: 2 }),
      run: () => chain().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      active: editor.isActive("heading", { level: 3 }),
      run: () => chain().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bullets",
      active: editor.isActive("bulletList"),
      run: () => chain().toggleBulletList().run(),
    },
    {
      label: "Numbers",
      active: editor.isActive("orderedList"),
      run: () => chain().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      active: editor.isActive("blockquote"),
      run: () => chain().toggleBlockquote().run(),
    },
    { label: "Link", active: editor.isActive("link"), run: onLink },
  ];

  const after: ToolbarButton[] = [
    {
      label: "Line",
      active: false,
      run: () => chain().setHorizontalRule().run(),
    },
    {
      label: "Undo",
      active: false,
      disabled: !editor.can().undo(),
      run: () => chain().undo().run(),
    },
    {
      label: "Redo",
      active: false,
      disabled: !editor.can().redo(),
      run: () => chain().redo().run(),
    },
  ];

  const renderButton = (button: ToolbarButton) => (
    <button
      key={button.label}
      type="button"
      className={`btn btn--sm rt-toolbar__btn${button.active ? " rt-toolbar__btn--active" : ""}`}
      disabled={button.disabled}
      onClick={button.run}
    >
      {button.label}
    </button>
  );

  return (
    <div className="rt-toolbar">
      {before.map(renderButton)}
      <ImageButton disabled={uploading} onImage={onImage} />
      {after.map(renderButton)}
    </div>
  );
}
