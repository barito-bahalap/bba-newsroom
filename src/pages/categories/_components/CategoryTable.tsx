import type { Category } from "@/lib";
// Style
import "./CategoryTable.css";
// Components
import { CategoryRow } from "./CategoryRow";

interface CategoryTableProps {
  categories: Category[];
  onRename: (id: string, name: string) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTable({
  categories,
  onRename,
  onDelete,
}: CategoryTableProps) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <CategoryRow
              key={`${category.id}:${category.name}`}
              category={category}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
