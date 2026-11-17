import i18next, { type TFunction } from "i18next";

import { DEFAULT_LOCALE, LOCALE_META, isLocale, type Locale } from "./config";
import { NAMESPACES, resources } from "./resources";

/**
 * One i18next instance, initialised synchronously with bundled resources
 * (no backend, no network). Safe on Cloudflare Workers.
 */
const instance = i18next.createInstance();
void instance.init({
	resources,
	lng: DEFAULT_LOCALE,
	fallbackLng: DEFAULT_LOCALE,
	supportedLngs: Object.keys(resources),
	ns: [...NAMESPACES],
	defaultNS: "common",
	interpolation: { escapeValue: false }, // Astro escapes output already.
	initAsync: false,
	returnNull: false,
});

/** Resolve a locale from Astro.currentLocale, falling back to the default. */
export function resolveLocale(value: string | undefined): Locale {
	return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Get a translator bound to a locale.
 * Usage in .astro: `const t = useTranslations(Astro.currentLocale);` then `t("nav.about")`
 * or `t("blog:title")`.
 */
export function useTranslations(locale?: string): TFunction {
	return instance.getFixedT(resolveLocale(locale));
}

/** Locale-aware date formatting (never hardcode date strings). */
export function formatDate(date: Date, locale?: string, options?: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat(LOCALE_META[resolveLocale(locale)].intl, {
		day: "numeric",
		month: "long",
		year: "numeric",
		...options,
	}).format(date);
}

export { DEFAULT_LOCALE, LOCALES, LOCALE_META, HAS_MULTIPLE_LOCALES } from "./config";
export type { Locale } from "./config";
