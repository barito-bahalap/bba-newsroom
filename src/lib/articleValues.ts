import { parseTags } from "./format";
import type { Article, ContentType } from "./types";

export interface ArticleValues {
  title: string;
  slug: string;
  excerpt: string;
  body_html: string;
  cover_url: string;
  cover_alt: string;
  cover_credit: string;
  category_id: string;
  tags: string;
  content_type: ContentType;
  sponsor_name: string;
  byline: string;
  seo_title: string;
  seo_description: string;
}

export const emptyValues: ArticleValues = {
  title: "",
  slug: "",
  excerpt: "",
  body_html: "",
  cover_url: "",
  cover_alt: "",
  cover_credit: "",
  category_id: "",
  tags: "",
  content_type: "editorial",
  sponsor_name: "",
  byline: "",
  seo_title: "",
  seo_description: "",
};

export function fromArticle(article: Article): ArticleValues {
  return {
    title: article.title,
    slug: article.slug ?? "",
    excerpt: article.excerpt,
    body_html: article.body_html,
    cover_url: article.cover_url ?? "",
    cover_alt: article.cover_alt ?? "",
    cover_credit: article.cover_credit ?? "",
    category_id: article.category_id ?? "",
    tags: article.tags.join(", "),
    content_type: article.content_type,
    sponsor_name: article.sponsor_name ?? "",
    byline: article.byline ?? "",
    seo_title: article.seo_title ?? "",
    seo_description: article.seo_description ?? "",
  };
}

const orNull = (value: string) => (value.trim() === "" ? null : value.trim());

export function toRow(values: ArticleValues) {
  return {
    title: values.title.trim(),
    slug: orNull(values.slug),
    excerpt: values.excerpt.trim(),
    body_html: values.body_html,
    cover_url: orNull(values.cover_url),
    cover_alt: orNull(values.cover_alt),
    cover_credit: orNull(values.cover_credit),
    category_id: values.category_id || null,
    tags: parseTags(values.tags),
    content_type: values.content_type,
    sponsor_name:
      values.content_type === "partnership"
        ? orNull(values.sponsor_name)
        : null,
    byline: orNull(values.byline),
    seo_title: orNull(values.seo_title),
    seo_description: orNull(values.seo_description),
  };
}
