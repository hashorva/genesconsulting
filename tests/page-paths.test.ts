import { describe, expect, it } from "vitest";

import { ROUTES } from "../astro-src/i18n/routes";
import { pageSlugFromPath, servicePathFromSlug } from "../astro-src/lib/page-paths";

describe("page paths", () => {
	it("maps single-segment paths to their page slug", () => {
		expect(pageSlugFromPath("/contatti/")).toBe("contatti");
		expect(pageSlugFromPath("/servizi/")).toBe("servizi");
	});

	it("maps service paths to servizi-<name> slugs and back", () => {
		expect(pageSlugFromPath("/servizi/consulenza-aziendale/")).toBe("servizi-consulenza-aziendale");
		expect(servicePathFromSlug("servizi-consulenza-aziendale")).toBe("/servizi/consulenza-aziendale/");
	});

	it("has no page slug for the home or deeper paths", () => {
		expect(pageSlugFromPath("/")).toBeNull();
		expect(pageSlugFromPath("/aggiornamenti/categoria/x/")).toBeNull();
	});

	it("resolves every service route", () => {
		for (const key of ["service.consulting", "service.corporate-filings", "service.digital-documents"] as const) {
			const slug = pageSlugFromPath(ROUTES[key].it);
			expect(slug?.startsWith("servizi-")).toBe(true);
			expect(servicePathFromSlug(slug!)).toBe(ROUTES[key].it);
		}
	});
});
