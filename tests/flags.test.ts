import { describe, expect, it } from "vitest";

import { isEnabled } from "../astro-src/flags";

const editor = { role: 40 };
const author = { role: 30 };

describe("flags", () => {
	it("hides an unreleased feature from visitors", () => {
		expect(isEnabled("page_blocks", {})).toBe(false);
		expect(isEnabled("page_blocks", {}, null)).toBe(false);
	});
	it("shows an unreleased feature to signed-in editors and admins only", () => {
		expect(isEnabled("page_blocks", {}, editor)).toBe(true);
		expect(isEnabled("page_blocks", {}, { role: 50 })).toBe(true);
		expect(isEnabled("page_blocks", {}, author)).toBe(false);
	});
	it("lets a FLAG_ var override for everyone", () => {
		expect(isEnabled("page_blocks", { FLAG_PAGE_BLOCKS: "true" })).toBe(true);
		expect(isEnabled("page_blocks", { FLAG_PAGE_BLOCKS: "false" }, editor)).toBe(false);
	});
});
