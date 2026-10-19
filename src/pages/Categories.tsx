import { useState, type FormEvent } from "react";
import { useCategories, useCategoryMutations } from "@/hooks/useCategories";
import { errMessage, slugify } from "@/lib/format";
import type { Category } from "@/lib/types";

function CategoryRow({
  category,
  onRename,
  onDelete,
}: {
  category: Category;
  onRename: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [name, setName] = useState(category.name);
  return (
    <tr>
      <td>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </td>
      <td>
        <code>{category.slug}</code>
      </td>
      <td className="row">
        <button
          type="button"
          disabled={name.trim() === "" || name.trim() === category.name}
          onClick={() => void onRename(name.trim())}
        >
          Rename
        </button>
        <button type="button" onClick={() => void onDelete()}>
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function Categories() {
  const categories = useCategories();
  const { create, rename, remove } = useCategoryMutations();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function run(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
    } catch (caught) {
      setError(errMessage(caught));
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    await run(async () => {
      await create.mutateAsync({ name: clean, slug: slugify(clean) });
      setName("");
    });
  }

  return (
    <div>
      <h1>Categories</h1>
      <p className="muted">
        The slug is generated once and cannot be changed, because it appears in
        public URLs.
      </p>

      <form className="row" onSubmit={(event) => void handleCreate(event)}>
        <input
          type="text"
          placeholder="New category name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" disabled={create.isPending || name.trim() === ""}>
          Add category
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {categories.isLoading && <p className="muted">Loading...</p>}

      {categories.data && categories.data.length === 0 && (
        <p className="muted">
          No categories yet. Articles need a category before they can be
          published.
        </p>
      )}

      {categories.data && categories.data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.data.map((category) => (
              <CategoryRow
                key={`${category.id}:${category.name}`}
                category={category}
                onRename={(next) =>
                  run(() => rename.mutateAsync({ id: category.id, name: next }))
                }
                onDelete={async () => {
                  if (window.confirm(`Delete category "${category.name}"?`)) {
                    await run(() => remove.mutateAsync(category.id));
                  }
                }}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
