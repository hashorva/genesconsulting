import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CARD_ICONS, cardIcon } from "../astro-src/components/blocks/icons";
import {
	anchorId,
	buttonVariant,
	COMPOSER_FIELDS,
	COMPOSER_TYPES,
	gridColumns,
	leadingHero,
	OPTIONS,
	pick,
	sectionStyle,
	withoutComposer,
} from "../astro-src/lib/section-style";

const seed = JSON.parse(readFileSync(join(import.meta.dirname, "..", "seed", "seed.json"), "utf-8"));
type Field = { slug: string; type: string; validation?: { options?: string[]; subFields?: Field[] }; options?: string[] };
const blockFields = new Map<string, Field[]>(
	seed.blockTypes.map((t: { slug: string; versions: Array<{ fields: Field[] }> }) => [t.slug, t.versions.at(-1)!.fields]),
);

describe("seed select options", () => {
	const keyFor: Record<string, keyof typeof OPTIONS> = {
		background: "background",
		spacing: "spacing",
		width: "width",
		align: "align",
		columns: "columns",
		card_style: "cardStyle",
		illustration: "illustration",
		accent: "accent",
		image_side: "imageSide",
	};

	it("match the presets the components know, so every choice maps to a class", () => {
		for (const [type, fields] of blockFields) {
			for (const field of fields) {
				if (field.type !== "select") continue;
				const key = keyFor[field.slug];
				expect(key, `${type}.${field.slug} has no preset list`).toBeDefined();
				expect(field.validation?.options, `${type}.${field.slug}`).toEqual([...OPTIONS[key!]]);
			}
			const buttons = fields.find((f) => f.slug === "buttons");
			const style = buttons?.validation?.subFields?.find((f) => f.slug === "style");
			if (buttons) expect(style?.options).toEqual([...OPTIONS.buttonStyle]);
			const cards = fields.find((f) => f.slug === "cards");
			const icon = cards?.validation?.subFields?.find((f) => f.slug === "icon");
			if (cards) expect(icon?.options).toEqual([...OPTIONS.icon]);
		}
	});

	it("are all optional, so existing sections stay valid", () => {
		for (const fields of blockFields.values()) {
			for (const field of fields) if (COMPOSER_FIELDS.includes(field.slug)) expect(field).not.toHaveProperty("required", true);
		}
	});
});

describe("presets", () => {
	it("fall back to the default for an empty or unknown value", () => {
		expect(pick("background", null, "Nessuno")).toBe("Nessuno");
		expect(pick("background", "bg-[#ff0000]", "Nessuno")).toBe("Nessuno");
		expect(pick("background", "Blu", "Nessuno")).toBe("Blu");
	});

	it("map the background and spacing to a band", () => {
		expect(sectionStyle({})).toEqual({ band: "py-8 md:py-12", inner: "", id: undefined });
		expect(sectionStyle({ background: "Tenue", spacing: "Ampia", width: "Stretta" })).toEqual({
			band: "bg-muted dark:bg-sky-900/50 py-16 md:py-24",
			inner: "mx-auto max-w-3xl",
			id: undefined,
		});
		// "Blu" scopes the dark theme, so everything inside keeps its contrast.
		expect(sectionStyle({ background: "Blu" }).band).toMatch(/^dark /);
		expect(sectionStyle({}, { background: "Blu" }).band).toMatch(/^dark /);
	});

	it("never emit an arbitrary Tailwind value", () => {
		const all = [
			...OPTIONS.background.map((b) => sectionStyle({ background: b }).band),
			...OPTIONS.spacing.map((s) => sectionStyle({ spacing: s, background: "Tenue" }).band),
			...OPTIONS.width.map((w) => sectionStyle({ width: w }).inner),
			...OPTIONS.columns.map((c) => gridColumns(c, 3)),
		].join(" ");
		expect(all).not.toMatch(/\[|#|rgb|oklch/);
	});

	it("map button styles to default shadcn variants", () => {
		expect(OPTIONS.buttonStyle.map((s) => buttonVariant(s))).toEqual(["default", "secondary", "outline", "link"]);
		expect(buttonVariant(undefined, "Contorno")).toBe("outline");
	});

	it("keep the automatic columns rule and let editors fix them", () => {
		expect(gridColumns(null, 4)).toBe("@xl:grid-cols-2 @5xl:grid-cols-4");
		expect(gridColumns("Automatiche", 2)).toBe("@xl:grid-cols-2");
		expect(gridColumns("3", 4)).toBe("@xl:grid-cols-2 @4xl:grid-cols-3");
	});

	it("turn an anchor into a safe id", () => {
		expect(anchorId("Servizi Fiscali")).toBe("servizi-fiscali");
		expect(anchorId("#contatti")).toBe("contatti");
		expect(anchorId("Perché noi")).toBe("perche-noi");
		expect(anchorId('"><script>')).toBe("script");
		expect(anchorId("   ")).toBeUndefined();
	});
});

describe("withoutComposer", () => {
	it("drops composer-only blocks and fields, leaving the original block as it was", () => {
		const blocks = [
			{ _type: "hero", _key: "a", heading: "Ciao" },
			{ _type: "cta", _key: "b", heading: "Parliamone", button_url: "/contatti/", background: "Blu", buttons: [], align: "Centrato" },
		];
		expect(withoutComposer(blocks)).toEqual([{ _type: "cta", _key: "b", heading: "Parliamone", button_url: "/contatti/" }]);
		expect(blocks[1]).toHaveProperty("background", "Blu");
		expect(COMPOSER_TYPES).toEqual(["hero", "media_text", "stats"]);
	});
});

describe("leadingHero", () => {
	it("is the first section only when it is an Apertura", () => {
		expect(leadingHero([{ _type: "hero" }, { _type: "cta" }])).toEqual({ _type: "hero" });
		expect(leadingHero([{ _type: "cta" }, { _type: "hero" }])).toBeNull();
		expect(leadingHero(undefined)).toBeNull();
	});
});

describe("card icons", () => {
	it("cover every icon option with a lucide icon, and nothing else", () => {
		expect(Object.keys(CARD_ICONS)).toEqual([...OPTIONS.icon]);
		expect(cardIcon("Rete")).toBe(CARD_ICONS.Rete);
		expect(cardIcon("constructor")).toBeNull();
		expect(cardIcon(null)).toBeNull();
	});

	it("are dropped with the other composer fields while the flag is off", () => {
		const [grid] = withoutComposer([{ _type: "card_grid", cards: [{ title: "A", icon: "Rete" }] }]);
		expect(grid).toEqual({ _type: "card_grid", cards: [{ title: "A" }] });
		expect(withoutComposer([{ _type: "stats" }, { _type: "media_text" }])).toEqual([]);
	});
});
