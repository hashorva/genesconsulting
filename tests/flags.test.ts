import { describe, expect, it } from "vitest";

import { isEnabled } from "../astro-src/flags";

describe("flags", () => {
	it("uses the per-environment default", () => {
		expect(isEnabled("example_new_component", { CD_ENV: "production" })).toBe(false);
		expect(isEnabled("example_new_component", { CD_ENV: "preview" })).toBe(true);
	});
	it("treats a missing environment as production (flag off)", () => {
		expect(isEnabled("example_new_component", {})).toBe(false);
	});
	it("lets a FLAG_ var override", () => {
		expect(isEnabled("example_new_component", { CD_ENV: "production", FLAG_EXAMPLE_NEW_COMPONENT: "true" })).toBe(true);
		expect(isEnabled("example_new_component", { CD_ENV: "preview", FLAG_EXAMPLE_NEW_COMPONENT: "false" })).toBe(false);
	});
});
