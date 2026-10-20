import type { ReactNode } from "react";
// Style
import "./ArticleForm.css";
// Utils
import type { ArticleValues } from "@/lib";

interface Props {
  values: ArticleValues;
  readOnly: boolean;
  slugLocked: boolean;
  uploadingCover: boolean;
  onChange: (patch: Partial<ArticleValues>) => void;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onUploadCover: (file: File) => void;
  body: ReactNode;
}

export function ArticleForm({
  values,
  categories,
  readOnly,
  slugLocked,
  uploadingCover,
  onChange,
  onTitleChange,
  onSlugChange,
  onUploadCover,
  body,
}: Props) {
  return (
    <div className="grid2">
      <div>
        <fieldset disabled={readOnly}>
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={values.title}
              maxLength={200}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Slug {slugLocked && "(locked after first publication)"}</span>
            <input
              type="text"
              value={values.slug}
              disabled={slugLocked}
              onChange={(event) => onSlugChange(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Excerpt ({values.excerpt.length}/300)</span>
            <textarea
              rows={3}
              maxLength={300}
              value={values.excerpt}
              onChange={(event) => onChange({ excerpt: event.target.value })}
            />
          </label>
        </fieldset>
        <div className="field">
          <span className="label">Body</span>
          {body}
        </div>
      </div>

      <fieldset disabled={readOnly} className="side">
        <label className="field">
          <span>Category</span>
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
        </label>

        <label className="field">
          <span>Content type</span>
          <select
            value={values.content_type}
            onChange={(event) =>
              onChange({
                content_type: event.target
                  .value as ArticleValues["content_type"],
              })
            }
          >
            <option value="editorial">Editorial</option>
            <option value="partnership">Partnership content (labeled)</option>
          </select>
        </label>

        {values.content_type === "partnership" && (
          <label className="field">
            <span>Partner name (shown in the label)</span>
            <input
              type="text"
              value={values.sponsor_name}
              onChange={(event) =>
                onChange({ sponsor_name: event.target.value })
              }
            />
          </label>
        )}

        <label className="field">
          <span>Byline override (optional)</span>
          <input
            type="text"
            value={values.byline}
            placeholder="Leave empty to use the author name"
            onChange={(event) => onChange({ byline: event.target.value })}
          />
        </label>

        <label className="field">
          <span>Tags (comma separated, max 10)</span>
          <input
            type="text"
            value={values.tags}
            onChange={(event) => onChange({ tags: event.target.value })}
          />
        </label>

        <label className="field">
          <span>Cover image URL</span>
          <input
            type="text"
            value={values.cover_url}
            onChange={(event) => onChange({ cover_url: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Upload cover image</span>
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
        </label>
        {values.cover_url && (
          <img
            className="cover-preview"
            src={values.cover_url}
            alt={values.cover_alt}
          />
        )}
        <label className="field">
          <span>Cover alt text</span>
          <input
            type="text"
            value={values.cover_alt}
            onChange={(event) => onChange({ cover_alt: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Cover credit</span>
          <input
            type="text"
            value={values.cover_credit}
            onChange={(event) => onChange({ cover_credit: event.target.value })}
          />
        </label>

        <details>
          <summary>SEO (optional)</summary>
          <label className="field">
            <span>SEO title</span>
            <input
              type="text"
              maxLength={70}
              value={values.seo_title}
              onChange={(event) => onChange({ seo_title: event.target.value })}
            />
          </label>
          <label className="field">
            <span>SEO description</span>
            <textarea
              rows={3}
              maxLength={160}
              value={values.seo_description}
              onChange={(event) =>
                onChange({ seo_description: event.target.value })
              }
            />
          </label>
        </details>
      </fieldset>
    </div>
  );
}
