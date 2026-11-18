import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { planPresentation, planSync, type Seed } from "../scripts/schema-plan";

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

	describe("existing block types", () => {
		const typed: Seed = {
			blockTypes: [
				{
					slug: "cta",
					label: "CTA",
					icon: "megaphone",
					category: "Chiusura",
					currentVersion: 1,
					versions: [
						{
							version: 1,
							fields: [
								{ slug: "heading", label: "Titolo", type: "string", required: true },
								{ slug: "background", label: "Sfondo", type: "select", validation: { options: ["Nessuno", "Blu"] } },
								{ slug: "code", label: "Codice", type: "string", required: true },
							],
						},
					],
				},
			],
			collections: [],
		};
		const liveHeading = { slug: "heading", label: "Heading (edited on the site)", type: "string", required: true };

		it("appends missing optional fields and keeps the live fields exactly as they are", () => {
			const plan = planSync(typed, {
				blockTypes: [{ slug: "cta", fields: [liveHeading], fingerprint: "fp1", icon: null, category: null }],
				collections: new Map(),
			});
			expect(plan.create).toEqual([
				{
					kind: "blockTypeFields",
					slug: "cta",
					expectedFingerprint: "fp1",
					added: ["background"],
					fields: [liveHeading, typed.blockTypes![0]!.versions[0]!.fields[1]],
					icon: "megaphone",
					category: "Chiusura",
				},
			]);
		});

		it("refuses a missing required field on a block type", () => {
			const plan = planSync(typed, {
				blockTypes: [{ slug: "cta", fields: [liveHeading], fingerprint: "fp1" }],
				collections: new Map(),
			});
			expect(plan.refuse).toEqual([{ what: "cta.code", reason: "required: would break existing sections" }]);
		});

		it("never overwrites an icon or category set on the site", () => {
			const plan = planSync(typed, {
				blockTypes: [
					{
						slug: "cta",
						fields: [liveHeading, { slug: "background" }, { slug: "code" }],
						fingerprint: "fp2",
						icon: "star",
						category: "Altro",
					},
				],
				collections: new Map(),
			});
			expect(plan.create).toEqual([]);
			expect(plan.skip).toContainEqual({ what: "block type cta", reason: "up to date" });
		});
	});

	it("brings the real live types (seed as first released) up to the seed without required fields", () => {
		const real = JSON.parse(readFileSync(join(import.meta.dirname, "..", "seed", "seed.json"), "utf-8")) as Seed;
		const firstRelease: Record<string, string[]> = {
			card_grid: ["heading", "intro", "cards"],
			steps: ["heading", "intro", "steps"],
			faq: ["heading", "items"],
			cta: ["heading", "text", "button_label", "button_url"],
			text: ["content"],
		};
		const plan = planSync(real, {
			blockTypes: Object.entries(firstRelease).map(([slug, fields]) => ({
				slug,
				fields: fields.map((f) => ({ slug: f })),
				fingerprint: `fp-${slug}`,
			})),
			collections: new Map([["pages", ["title", "content", "layout"]]]),
		});
		expect(plan.refuse).toEqual([]);
		expect(plan.create.filter((c) => c.kind === "blockType").map((c) => c.slug)).toContain("hero");
		const amended = plan.create.filter((c) => c.kind === "blockTypeFields");
		expect(amended.map((c) => c.slug).sort()).toEqual(Object.keys(firstRelease).sort());
		for (const item of amended) expect(item.added).toContain("background");
	});

	it("appends new block types to an existing blocks field and keeps the rest of its validation", () => {
		const blocksSeed: Seed = {
			collections: [
				{
					slug: "pages",
					fields: [
						{ slug: "layout", label: "Sezioni", type: "blocks", validation: { allowedTypes: ["hero", "cta", "faq"], maxItems: 30 } },
					],
				},
			],
		};
		const plan = planSync(blocksSeed, {
			blockTypes: [],
			collections: new Map([
				["pages", [{ slug: "layout", type: "blocks", validation: { allowedTypes: ["cta", "faq"], maxItems: 30, retiredTypes: ["old"] } }]],
			]),
		});
		expect(plan.create).toEqual([
			{
				kind: "allowedTypes",
				collection: "pages",
				slug: "layout",
				added: ["hero"],
				validation: { allowedTypes: ["cta", "faq", "hero"], maxItems: 30, retiredTypes: ["old"] },
			},
		]);
		const same = planSync(blocksSeed, {
			blockTypes: [],
			collections: new Map([["pages", [{ slug: "layout", type: "blocks", validation: { allowedTypes: ["hero", "cta", "faq"] } }]]]),
		});
		expect(same.create).toEqual([]);
	});

	it("leaves a live blocks field without an allowedTypes list alone instead of narrowing it", () => {
		const blocksSeed: Seed = {
			collections: [
				{ slug: "pages", fields: [{ slug: "layout", label: "Sezioni", type: "blocks", validation: { allowedTypes: ["hero", "cta"] } }] },
			],
		};
		for (const validation of [null, undefined, { maxItems: 30 }]) {
			const plan = planSync(blocksSeed, {
				blockTypes: [],
				collections: new Map([["pages", [{ slug: "layout", type: "blocks", validation }]]]),
			});
			expect(plan.create).toEqual([]);
			expect(plan.skip).toContainEqual({ what: "pages.layout", reason: "no allowedTypes list on the site, not touched" });
		}
	});

	it("appends a missing optional sub-field to a live repeater and keeps its live sub-fields", () => {
		const repeaterSeed: Seed = {
			blockTypes: [
				{
					slug: "card_grid",
					label: "Griglia",
					currentVersion: 1,
					versions: [
						{
							version: 1,
							fields: [
								{
									slug: "cards",
									label: "Schede",
									type: "repeater",
									validation: {
										maxItems: 12,
										subFields: [
											{ slug: "title", label: "Titolo", type: "string", required: true },
											{ slug: "icon", label: "Icona", type: "select", options: ["Rete"] },
											{ slug: "code", label: "Codice", type: "string", required: true },
										],
									},
								},
							],
						},
					],
				},
			],
			collections: [],
		};
		const liveCards = {
			slug: "cards",
			label: "Schede",
			type: "repeater",
			validation: { maxItems: 12, subFields: [{ slug: "title", label: "Titolo (sito)", type: "string", required: true }] },
		};
		const plan = planSync(repeaterSeed, {
			blockTypes: [{ slug: "card_grid", fields: [liveCards], fingerprint: "fp", icon: "x", category: "y" }],
			collections: new Map(),
		});
		expect(plan.refuse).toEqual([{ what: "card_grid.cards.code", reason: "required: would break existing sections" }]);
		expect(plan.create).toEqual([
			{
				kind: "blockTypeFields",
				slug: "card_grid",
				expectedFingerprint: "fp",
				added: ["cards.icon"],
				fields: [
					{
						...liveCards,
						validation: {
							maxItems: 12,
							subFields: [
								{ slug: "title", label: "Titolo (sito)", type: "string", required: true },
								{ slug: "icon", label: "Icona", type: "select", options: ["Rete"] },
							],
						},
					},
				],
				icon: undefined,
				category: undefined,
			},
		]);
	});
});

describe("planPresentation", () => {
	const seedTypes: Seed = {
		collections: [],
		blockTypes: [
			{
				slug: "cta",
				label: "Invito",
				description: "Riquadro finale.",
				icon: "megaphone",
				category: "Chiusura",
				currentVersion: 1,
				versions: [
					{
						version: 1,
						fields: [
							{ slug: "heading", label: "Titolo", type: "string", required: true },
							{ slug: "background", label: "Sfondo", type: "select", defaultValue: "Nessuno" },
							{ slug: "spacing", label: "Spazio", type: "select", defaultValue: "Inventato" },
							{
								slug: "buttons",
								label: "Pulsanti",
								type: "repeater",
								validation: { subFields: [{ slug: "link_label", label: "Testo" }, { slug: "link_url", label: "Link" }] },
							},
						],
					},
				],
			},
		],
	};
	const live = {
		slug: "cta",
		fingerprint: "fp1",
		label: "CTA",
		description: null,
		icon: "megaphone",
		category: null,
		fields: [
			{ slug: "background", label: "Background", type: "select", validation: { options: ["Nessuno", "Blu"] } },
			{ slug: "heading", label: "Heading", type: "string", required: false },
			{ slug: "spacing", label: "Spacing", type: "select", validation: { options: ["Normale"] }, defaultValue: "Normale" },
			{
				slug: "buttons",
				label: "Buttons",
				type: "repeater",
				validation: { maxItems: 3, subFields: [{ slug: "link_url", type: "url", label: "URL" }, { slug: "link_label", type: "string", label: "Label" }] },
			},
			{ slug: "legacy", label: "Legacy", type: "string" },
		],
	};

	it("changes only labels, order, defaults and the picker fields, keeping types, required and validation", () => {
		const { update } = planPresentation(seedTypes, [live]);
		expect(update).toHaveLength(1);
		const [cta] = update;
		expect(cta).toMatchObject({ slug: "cta", expectedFingerprint: "fp1", label: "Invito", description: "Riquadro finale.", category: "Chiusura" });
		expect(cta.changed).toEqual(["label", "description", "category", "fields"]);
		expect(cta.fields.map((f) => f.slug)).toEqual(["heading", "background", "spacing", "buttons", "legacy"]);
		// required stays as on the site, never tightened.
		expect(cta.fields[0]).toEqual({ slug: "heading", label: "Titolo", type: "string", required: false });
		expect(cta.fields[1]).toMatchObject({ label: "Sfondo", defaultValue: "Nessuno", validation: { options: ["Nessuno", "Blu"] } });
		// A default the site's options don't have is not sent (the live one is dropped too: the seed decides).
		expect(cta.fields[2]).not.toHaveProperty("defaultValue");
		expect(cta.fields[3].validation).toEqual({
			maxItems: 3,
			subFields: [
				{ slug: "link_label", type: "string", label: "Testo" },
				{ slug: "link_url", type: "url", label: "Link" },
			],
		});
		expect(cta.fields[4]).toEqual(live.fields[4]);
	});

	it("is up to date after applying, and waits for fields the site does not have yet", () => {
		const [cta] = planPresentation(seedTypes, [live]).update;
		const applied = { ...live, ...cta, fields: cta.fields as typeof live.fields };
		expect(planPresentation(seedTypes, [applied]).update).toEqual([]);
		const older = { ...live, fields: live.fields.filter((f) => f.slug !== "buttons") };
		const plan = planPresentation(seedTypes, [older]);
		expect(plan.update).toEqual([]);
		expect(plan.skip).toContainEqual({ what: "presentation of cta", reason: "fields buttons not on the site yet" });
	});
});
