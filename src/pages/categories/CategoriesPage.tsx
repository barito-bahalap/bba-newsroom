import { Notice, PageHeader } from "@/components";
// Style
import "./CategoriesPage.css";
// Hooks
import { useCategoryAdmin } from "@/hooks";
// Components
import { CategoryForm, CategoryTable } from "./_components";

export default function CategoriesPage() {
  const admin = useCategoryAdmin();
  const { categories } = admin;

  return (
    <div className="categories-page">
      <PageHeader title="Categories" />
      <p className="muted">
        The slug is generated once and cannot be changed, because it appears in
        public URLs.
      </p>

      <CategoryForm
        name={admin.name}
        busy={admin.adding}
        onName={admin.setName}
        onSubmit={() => void admin.add()}
      />

      {admin.error && <Notice tone="error">{admin.error}</Notice>}
      {categories.isLoading && <p className="muted">Loading...</p>}
      {categories.data && categories.data.length === 0 && (
        <p className="muted">
          No categories yet. Articles need a category before they can be
          published.
        </p>
      )}
      {categories.data && categories.data.length > 0 && (
        <CategoryTable
          categories={categories.data}
          onRename={(id, name) => void admin.renameCategory(id, name)}
          onDelete={(category) => void admin.removeCategory(category)}
        />
      )}
    </div>
  );
}
