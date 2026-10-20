import { useState } from "react";
// Style
import "./CategoryRow.css";
// Utils
import type { Category } from "@/lib";

interface CategoryRowProps {
  category: Category;
  onRename: (id: string, name: string) => void;
  onDelete: (category: Category) => void;
}

export function CategoryRow({
  category,
  onRename,
  onDelete,
}: CategoryRowProps) {
  const [name, setName] = useState(category.name);
  const unchanged = name.trim() === "" || name.trim() === category.name;

  return (
    <tr>
      <td>
        <input
          type="text"
          aria-label={`Name of ${category.name}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </td>
      <td>
        <code>{category.slug}</code>
      </td>
      <td>
        <div className="cluster">
          <button
            type="button"
            className="btn btn--sm"
            disabled={unchanged}
            onClick={() => onRename(category.id, name.trim())}
          >
            Rename
          </button>
          <button
            type="button"
            className="btn btn--sm btn--danger"
            onClick={() => onDelete(category)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
