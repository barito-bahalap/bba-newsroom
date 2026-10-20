// Style
import "./ArticleSidebarFields.css";
// Components
import { FieldTag } from "@/components";
// Utils
import type { ArticleValues, Category } from "@/lib";

interface ArticleSidebarFieldsProps {
  values: ArticleValues;
  categories: Category[];
  readOnly: boolean;
  uploadingCover: boolean;
  onChange: (patch: Partial<ArticleValues>) => void;
  onUploadCover: (file: File) => void;
}

export function ArticleSidebarFields({
  values,
  categories,
  readOnly,
  uploadingCover,
  onChange,
  onUploadCover,
}: ArticleSidebarFieldsProps) {
  return (
    <fieldset className="article-side" disabled={readOnly}>
      <FieldTag label="Category">
        <select
          value={values.category_id}
          onChange={(event) => onChange({ category_id: event.target.value })}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FieldTag>

      <FieldTag label="Content type">
        <select
          value={values.content_type}
          onChange={(event) =>
            onChange({
              content_type: event.target.value as ArticleValues["content_type"],
            })
          }
        >
          <option value="editorial">Editorial</option>
          <option value="partnership">Partnership content (labeled)</option>
        </select>
      </FieldTag>

      {values.content_type === "partnership" && (
        <FieldTag label="Partner name (shown in the label)">
          <input
            type="text"
            value={values.sponsor_name}
            onChange={(event) => onChange({ sponsor_name: event.target.value })}
          />
        </FieldTag>
      )}

      <FieldTag label="Byline override (optional)">
        <input
          type="text"
          value={values.byline}
          placeholder="Leave empty to use the author name"
          onChange={(event) => onChange({ byline: event.target.value })}
        />
      </FieldTag>

      <FieldTag label="Tags (comma separated, max 10)">
        <input
          type="text"
          value={values.tags}
          onChange={(event) => onChange({ tags: event.target.value })}
        />
      </FieldTag>

      <FieldTag label="Cover image URL">
        <input
          type="text"
          value={values.cover_url}
          onChange={(event) => onChange({ cover_url: event.target.value })}
        />
      </FieldTag>
      <FieldTag label="Upload cover image">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={uploadingCover}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUploadCover(file);
            event.target.value = "";
          }}
        />
      </FieldTag>
      {values.cover_url && (
        <img
          className="article-side__cover"
          src={values.cover_url}
          alt={values.cover_alt}
        />
      )}
      <FieldTag label="Cover alt text">
        <input
          type="text"
          value={values.cover_alt}
          onChange={(event) => onChange({ cover_alt: event.target.value })}
        />
      </FieldTag>
      <FieldTag label="Cover credit">
        <input
          type="text"
          value={values.cover_credit}
          onChange={(event) => onChange({ cover_credit: event.target.value })}
        />
      </FieldTag>

      <details className="article-side__seo">
        <summary>SEO (optional)</summary>
        <FieldTag label="SEO title">
          <input
            type="text"
            maxLength={70}
            value={values.seo_title}
            onChange={(event) => onChange({ seo_title: event.target.value })}
          />
        </FieldTag>
        <FieldTag label="SEO description">
          <textarea
            rows={3}
            maxLength={160}
            value={values.seo_description}
            onChange={(event) =>
              onChange({ seo_description: event.target.value })
            }
          />
        </FieldTag>
      </details>
    </fieldset>
  );
}
