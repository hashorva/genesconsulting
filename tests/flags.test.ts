import { describe, expect, it } from "vitest";

import { isEnabled } from "../astro-src/flags";

const editor = { role: 40 };
const author = { role: 30 };

describe("flags", () => {
	it("hides an unreleased feature from visitors", () => {
		expect(isEnabled("example_new_component", {})).toBe(false);
		expect(isEnabled("example_new_component", {}, null)).toBe(false);
	});
	it("shows an unreleased feature to signed-in editors and admins only", () => {
		expect(isEnabled("example_new_component", {}, editor)).toBe(true);
		expect(isEnabled("example_new_component", {}, { role: 50 })).toBe(true);
		expect(isEnabled("example_new_component", {}, author)).toBe(false);
	});
	it("lets a FLAG_ var override for everyone", () => {
		expect(isEnabled("example_new_component", { FLAG_EXAMPLE_NEW_COMPONENT: "true" })).toBe(true);
		expect(isEnabled("example_new_component", { FLAG_EXAMPLE_NEW_COMPONENT: "false" }, editor)).toBe(false);
	});
});
