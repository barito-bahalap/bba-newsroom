import { localizeHref, type LocaleCode } from "./locales";

const LOCALIZED_KEYS = new Set(["href", "path"]);

export function localizeContent<T>(value: T, locale: LocaleCode): T {
  if (Array.isArray(value)) {
    return value.map((item) => localizeContent(item, locale)) as T;
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        typeof entry === "string" && LOCALIZED_KEYS.has(key)
          ? localizeHref(entry, locale)
          : localizeContent(entry, locale),
      ]),
    ) as T;
  }
  return value;
}
