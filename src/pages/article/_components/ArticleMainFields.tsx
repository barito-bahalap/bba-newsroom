import type { ReactNode } from "react";
// Style
import "./ArticleMainFields.css";
// Components
import { FieldTag } from "@/components";
// Utils
import type { ArticleValues } from "@/lib";

interface ArticleMainFieldsProps {
  values: ArticleValues;
  readOnly: boolean;
  slugLocked: boolean;
  onTitle: (value: string) => void;
  onSlug: (value: string) => void;
  onChange: (patch: Partial<ArticleValues>) => void;
  body: ReactNode;
}

const MEDIA_URL = (
  import.meta.env.VITE_MEDIA_URL as string | undefined
)?.replace(/\/$/, "");

export function ArticleMainFields({
  values,
  readOnly,
  slugLocked,
  onTitle,
  onSlug,
  onChange,
  body,
}: ArticleMainFieldsProps) {
  const publicUrl =
    MEDIA_URL && slugLocked && values.slug
      ? `${MEDIA_URL}/insight/${encodeURIComponent(values.slug)}`
      : null;

  return (
    <div className="article-main">
      <fieldset className="article-main__fields" disabled={readOnly}>
        <FieldTag label="Title">
          <input
            type="text"
            maxLength={200}
            value={values.title}
            onChange={(event) => onTitle(event.target.value)}
          />
        </FieldTag>

        {publicUrl && (
          <a
            className="article-main__link"
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to article (new tab) ↗
          </a>
        )}
        <FieldTag
          label={slugLocked ? "Slug (locked after first publication)" : "Slug"}
        >
          <input
            type="text"
            value={values.slug}
            disabled={slugLocked}
            onChange={(event) => onSlug(event.target.value)}
          />
        </FieldTag>

        <FieldTag label={`Excerpt (${values.excerpt.length}/300)`}>
          <textarea
            rows={3}
            maxLength={300}
            value={values.excerpt}
            onChange={(event) => onChange({ excerpt: event.target.value })}
          />
        </FieldTag>
      </fieldset>
      <FieldTag label="Body" as="div">
        {body}
      </FieldTag>
    </div>
  );
}
