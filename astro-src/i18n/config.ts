/**
 * Locale configuration: the single list of supported locales.
 *
 * Italian only for now. Adding a locale = add it here, add
 * `locales/<code>/*.json`, and translate the EmDash content. The language
 * switcher and hreflang tags render only when LOCALES has more than one entry.
 */
export const DEFAULT_LOCALE = "it" as const;
export const LOCALES = ["it"] as const;

export type Locale = (typeof LOCALES)[number];

/** BCP 47 tags used for <html lang>, Intl formatting and og:locale. */
export const LOCALE_META: Record<Locale, { htmlLang: string; intl: string; og: string }> = {
	it: { htmlLang: "it", intl: "it-IT", og: "it_IT" },
};

export function isLocale(value: string | undefined): value is Locale {
	return !!value && (LOCALES as readonly string[]).includes(value);
}

export const HAS_MULTIPLE_LOCALES = LOCALES.length > 1;
