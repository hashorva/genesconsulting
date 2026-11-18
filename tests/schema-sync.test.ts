import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { planSync, type Seed } from "../scripts/schema-plan";

const seed: Seed = {
	blockTypes: [
		{ slug: "cta", label: "CTA", currentVersion: 1, versions: [{ version: 1, fields: [{ slug: "heading" }] }] },
		{ slug: "faq", label: "FAQ", currentVersion: 2, versions: [{ version: 1, fields: [] }, { version: 2, fields: [{ slug: "items" }] }] },
	],
	collections: [
		{
			slug: "pages",
			fields: [
				{ slug: "title", label: "Title", type: "string", required: true },
				{ slug: "layout", label: "Sezioni", type: "blocks", validation: { maxItems: 30 } },
				{ slug: "summary", label: "Summary", type: "string", required: true },
			],
		},
		{ slug: "events", label: "Events", fields: [{ slug: "when", label: "When", type: "date" }] } as Seed["collections"][number],
	],
};

describe("planSync", () => {
	it("skips existing block types and creates missing ones from the current version", () => {
		const plan = planSync(seed, { blockTypes: ["cta"], collections: new Map() });
		expect(plan.skip).toContainEqual({ what: "block type cta", reason: "exists, not touched" });
		const created = plan.create.filter((c) => c.kind === "blockType");
		expect(created).toEqual([{ kind: "blockType", slug: "faq", label: "FAQ", description: undefined, fields: [{ slug: "items" }] }]);
	});

	it("creates a missing optional field with its validation and position", () => {
		const plan = planSync(seed, { blockTypes: [], collections: new Map([["pages", ["title", "summary"]]]) });
		expect(plan.create).toContainEqual({
			kind: "field",
			collection: "pages",
			slug: "layout",
			label: "Sezioni",
			type: "blocks",
			validation: { maxItems: 30 },
			searchable: undefined,
			sortOrder: 1,
		});
	});

	it("refuses a missing required field and leaves existing fields alone", () => {
		const plan = planSync(seed, { blockTypes: [], collections: new Map([["pages", ["title", "layout"]]]) });
		expect(plan.refuse).toEqual([{ what: "pages.summary", reason: "required: not additive on existing entries" }]);
		expect(plan.create.filter((c) => c.kind === "field")).toEqual([]);
	});

	it("skips a collection missing on the site instead of creating it", () => {
		const plan = planSync(seed, { blockTypes: [], collections: new Map([["pages", ["title", "layout", "summary"]]]) });
		expect(plan.skip).toContainEqual({ what: "collection events", reason: "missing on the site; create it in the admin" });
		expect(plan.create.some((c) => c.kind === "field" && c.collection === "events")).toBe(false);
	});

	it("plans nothing when the site already matches", () => {
		const plan = planSync(seed, {
			blockTypes: ["cta", "faq"],
			collections: new Map([
				["pages", ["title", "layout", "summary"]],
				["events", ["when"]],
			]),
		});
		expect(plan.create).toEqual([]);
		expect(plan.refuse).toEqual([]);
	});

	it("orders block types before fields so a blocks field never references a missing type", () => {
		const plan = planSync(seed, { blockTypes: [], collections: new Map([["pages", ["title", "summary"]]]) });
		const kinds = plan.create.map((c) => c.kind);
		expect(kinds.lastIndexOf("blockType")).toBeLessThan(kinds.indexOf("field"));
	});

	it("throws when a seed block type lacks its current version", () => {
		const bad: Seed = { blockTypes: [{ slug: "x", label: "X", currentVersion: 3, versions: [] }], collections: [] };
		expect(() => planSync(bad, { blockTypes: [], collections: new Map() })).toThrow(/no version 3/);
	});

	it("accepts the real seed and only plans creations", () => {
		const real = JSON.parse(readFileSync(join(import.meta.dirname, "..", "seed", "seed.json"), "utf-8")) as Seed;
		const plan = planSync(real, { blockTypes: [], collections: new Map([["pages", []]]) });
		for (const item of plan.create) expect(["blockType", "field"]).toContain(item.kind);
		expect(plan.create.some((c) => c.kind === "field" && c.slug === "layout")).toBe(true);
	});
});
