import { describe, expect, it } from "vitest";

import { isEnabled, resolveFlag } from "../astro-src/flags";

const editor = { role: 40 };
const author = { role: 30 };

describe("flag rules", () => {
	it("hides an unreleased feature from visitors", () => {
		expect(resolveFlag("demo", false, {})).toBe(false);
		expect(resolveFlag("demo", false, {}, null)).toBe(false);
	});
	it("shows an unreleased feature to signed-in editors and admins only", () => {
		expect(resolveFlag("demo", false, {}, editor)).toBe(true);
		expect(resolveFlag("demo", false, {}, { role: 50 })).toBe(true);
		expect(resolveFlag("demo", false, {}, author)).toBe(false);
	});
	it("shows a released feature to everyone", () => {
		expect(resolveFlag("demo", true, {})).toBe(true);
		expect(resolveFlag("demo", true, {}, author)).toBe(true);
	});
	it("lets a FLAG_ var override for everyone (false is the kill switch)", () => {
		expect(resolveFlag("demo", false, { FLAG_DEMO: "true" })).toBe(true);
		expect(resolveFlag("demo", true, { FLAG_DEMO: "false" }, editor)).toBe(false);
	});
});

describe("flags.json", () => {
	it("releases page sections to visitors", () => {
		expect(isEnabled("page_blocks", {})).toBe(true);
		expect(isEnabled("page_blocks", { FLAG_PAGE_BLOCKS: "false" }, editor)).toBe(false);
	});
});
