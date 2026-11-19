import { describe, expect, it } from "vitest";

import { safeHref } from "../astro-src/lib/safe-href";

describe("safeHref", () => {
	it.each([
		"/contatti/",
		"/servizi/finanza/#faq",
		"#sezione",
		"https://example.com/a?b=c",
		"http://example.com",
		"mailto:info@example.com",
		"tel:+390000000",
	])("keeps %s", (url) => {
		expect(safeHref(url)).toBe(url);
	});

	it("trims surrounding spaces", () => {
		expect(safeHref("  /contatti/ ")).toBe("/contatti/");
	});

	it.each([
		"javascript:alert(1)",
		"JavaScript:alert(1)",
		" javascript:alert(1)",
		"java\tscript:alert(1)",
		"java\nscript:alert(1)",
		"data:text/html,<script>alert(1)</script>",
		"vbscript:msgbox(1)",
		"//evil.example/",
		"/\\evil.example/",
		"contatti",
		"",
		"   ",
		null,
		undefined,
	])("rejects %j", (url) => {
		expect(safeHref(url)).toBeNull();
	});
});
