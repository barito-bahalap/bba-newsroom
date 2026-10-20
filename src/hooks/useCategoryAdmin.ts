import { useState } from "react";
// Hooks
import { useCategories, useCategoryMutations } from ".";
// Utils
import { errMessage, slugify, type Category } from "@/lib";

export function useCategoryAdmin() {
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

  async function add() {
    const clean = name.trim();
    if (!clean) return;
    await run(async () => {
      await create.mutateAsync({ name: clean, slug: slugify(clean) });
      setName("");
    });
  }

  async function renameCategory(id: string, next: string) {
    await run(() => rename.mutateAsync({ id, name: next }));
  }

  async function removeCategory(category: Category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    await run(() => remove.mutateAsync(category.id));
  }

  return {
    categories,
    name,
    error,
    adding: create.isPending,
    setName,
    add,
    renameCategory,
    removeCategory,
  };
}
