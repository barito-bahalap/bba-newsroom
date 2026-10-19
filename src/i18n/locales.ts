export const LOCALES = {
  id: { htmlLang: "id", label: "Bahasa Indonesia", short: "ID", enabled: true },
  en: { htmlLang: "en", label: "English", short: "EN", enabled: true },
} as const;

export type LocaleCode = keyof typeof LOCALES;

export const DEFAULT_LOCALE = "id" satisfies LocaleCode;

const isLocaleCode = (value: string): value is LocaleCode =>
  Object.prototype.hasOwnProperty.call(LOCALES, value);

export const ENABLED_LOCALES = (Object.keys(LOCALES) as LocaleCode[]).filter(
  (code) => LOCALES[code].enabled,
);

export const isEnabledLocale = (value: unknown): value is LocaleCode =>
  typeof value === "string" && isLocaleCode(value) && LOCALES[value].enabled;

export const localePrefix = (locale: LocaleCode): string =>
  locale === DEFAULT_LOCALE ? "" : `/${locale}`;

export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (match && isLocaleCode(match[1])) return match[2] ?? "/";
  return pathname;
}

export function localizeHref(href: string, locale: LocaleCode): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const path = href === "/" ? "" : href;
  return `${localePrefix(locale)}${path}` || "/";
}
