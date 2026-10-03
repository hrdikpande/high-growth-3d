export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABEL: Record<Locale, string> = { en: "English", hi: "हिन्दी" };
export const LOCALE_SHORT: Record<Locale, string> = { en: "EN", hi: "हिं" };

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** "/honeys" -> "/hi/honeys/" ; hash links keep their hash. */
export function href(lang: Locale, path = "/"): string {
  const [pathname, hash] = path.split("#");
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  const url = clean ? `/${lang}/${clean}/` : `/${lang}/`;
  return hash ? `${url}#${hash}` : url;
}

/** Same page in the other language. */
export function switchHref(current: string, to: Locale): string {
  const parts = current.split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts.shift();
  return href(to, parts.join("/"));
}

export function staticLangPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}
