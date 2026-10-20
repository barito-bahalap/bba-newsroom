import type { FormEvent } from "react";
// Style
import "./CategoryForm.css";

interface CategoryFormProps {
  name: string;
  busy: boolean;
  onName: (value: string) => void;
  onSubmit: () => void;
}

export function CategoryForm({
  name,
  busy,
  onName,
  onSubmit,
}: CategoryFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="New category name"
        aria-label="New category name"
        value={name}
        onChange={(event) => onName(event.target.value)}
      />
      <button
        type="submit"
        className="btn btn--primary"
        disabled={busy || name.trim() === ""}
      >
        Add category
      </button>
    </form>
  );
}
