import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, LOCALES } from "../astro-src/i18n/config";
import { formatDate, resolveLocale, useTranslations } from "../astro-src/i18n";
import { resources } from "../astro-src/i18n/resources";
import { postPath, routePath, ROUTES } from "../astro-src/i18n/routes";

function keys(obj: Record<string, unknown>, prefix = ""): string[] {
	return Object.entries(obj).flatMap(([k, v]) =>
		v && typeof v === "object" ? keys(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
	);
}

describe("i18n", () => {
	it("defaults to Italian", () => {
		expect(DEFAULT_LOCALE).toBe("it");
		expect(resolveLocale(undefined)).toBe("it");
		expect(resolveLocale("xx")).toBe("it");
	});

	it("translates with namespaces and interpolation", () => {
		const t = useTranslations("it");
		expect(t("nav.cta")).toBe("Parliamone");
		expect(t("blog:title")).toBe("Aggiornamenti");
		expect(t("footer.copyright", { year: 2026, name: "Genes" })).toBe("© 2026 Genes");
	});

	it("formats dates in Italian", () => {
		expect(formatDate(new Date(Date.UTC(2026, 10, 16, 12)), "it")).toBe("16 novembre 2026");
	});

	it("has the same keys in every locale", () => {
		const reference = Object.fromEntries(
			Object.entries(resources[DEFAULT_LOCALE]).map(([ns, v]) => [ns, keys(v)]),
		);
		for (const locale of LOCALES) {
			for (const [ns, v] of Object.entries(resources[locale])) {
				expect(keys(v), `${locale}/${ns}`).toEqual(reference[ns]);
			}
		}
	});

	it("has an Italian path for every route, with no prefix", () => {
		for (const [key, paths] of Object.entries(ROUTES)) {
			expect(paths.it, key).toMatch(/^\/([a-z0-9-]+\/)*$/);
		}
		expect(routePath("page.updates")).toBe("/aggiornamenti/");
		expect(postPath("visura camerale")).toBe("/aggiornamenti/visura%20camerale/");
	});
});
