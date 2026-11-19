import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { markdownToPortableText } from "emdash/client";

import {
	blockDefaults,
	canAddHeroDraft,
	canAddLayoutDraft,
	isLoaderDraft,
	parseLayoutFile,
	parsePageFile,
	sameContent,
	withoutFilledDefaults,
} from "../scripts/content-file";
import { safeHref } from "../astro-src/lib/safe-href";

const dir = join(import.meta.dirname, "..", "content", "it", "pages");
const files = readdirSync(dir).filter((name) => name.endsWith(".md"));

describe("starter content", () => {
	it("parses every page file", () => {
		expect(files.length).toBeGreaterThan(0);
		for (const name of files) {
			const page = parsePageFile(readFileSync(join(dir, name), "utf-8"), name);
			expect(`${page.slug}.md`).toBe(name);
			expect(page.seoDescription.length).toBeLessThanOrEqual(500);
			// One H1 per page: it comes from the title, so the body starts at H2.
			expect(page.body).not.toMatch(/^# /m);
		}
	});

	it("rejects a file without frontmatter", () => {
		expect(() => parsePageFile("# no frontmatter")).toThrow(/frontmatter/);
	});
});

describe("isLoaderDraft", () => {
	const file = { title: "Parliamone." };
	const draft = { status: "draft", publishedAt: null, liveRevisionId: null, scheduledAt: null, title: "Parliamone." };

	it("accepts a never-published draft with the file's title", () => {
		expect(isLoaderDraft(draft, file)).toBe(true);
	});

	it("rejects pages that were published, unpublished, scheduled or retitled", () => {
		expect(isLoaderDraft({ ...draft, status: "published", liveRevisionId: "r1" }, file)).toBe(false);
		expect(isLoaderDraft({ ...draft, publishedAt: "2026-11-18T10:00:00Z" }, file)).toBe(false);
		expect(isLoaderDraft({ ...draft, status: "scheduled", scheduledAt: "2026-12-01T09:00:00Z" }, file)).toBe(false);
		expect(isLoaderDraft({ ...draft, title: "Contatti" }, file)).toBe(false);
	});
});

describe("starter sections", () => {
	const layoutFiles = readdirSync(dir).filter((name) => name.endsWith(".layout.json"));

	it("parses every layout file, next to its page file, with safe links", () => {
		expect(layoutFiles.length).toBeGreaterThan(0);
		for (const name of layoutFiles) {
			expect(files).toContain(name.replace(".layout.json", ".md"));
			const blocks = parseLayoutFile(readFileSync(join(dir, name), "utf-8"), name);
			for (const block of blocks) {
				const cards = (block.cards as Array<{ title: string; link_url?: string; link_label?: string }>) ?? [];
				for (const card of cards) {
					expect(card.title).toBeTruthy();
					if (card.link_url) expect(safeHref(card.link_url)).toBe(card.link_url);
					// Link text must say where it goes (no "Area 01" style labels).
					if (card.link_label) expect(card.link_label).not.toMatch(/^Area \d/);
				}
				if (block._type === "cta" && block.button_url) expect(safeHref(block.button_url as string)).toBe(block.button_url);
				const buttons = (block.buttons as Array<{ link_label: string; link_url: string }>) ?? [];
				for (const button of buttons) {
					expect(button.link_label).toBeTruthy();
					expect(safeHref(button.link_url)).toBe(button.link_url);
				}
			}
		}
	});

	it("opens every page with an Apertura whose heading is the page title", () => {
		for (const name of layoutFiles) {
			const [first, ...rest] = parseLayoutFile(readFileSync(join(dir, name), "utf-8"), name);
			const page = parsePageFile(readFileSync(join(dir, name.replace(".layout.json", ".md")), "utf-8"), name);
			expect(first._type).toBe("hero");
			expect(first.heading).toBe(page.title);
			expect(rest.some((block) => block._type === "hero")).toBe(false);
		}
	});

	it("rejects unknown types, missing or duplicate keys, and non-Markdown text", () => {
		const ok = { _type: "cta", _version: 1, _key: "a", heading: "Parliamone." };
		expect(parseLayoutFile(JSON.stringify([ok]))).toHaveLength(1);
		expect(() => parseLayoutFile("{}")).toThrow(/array/);
		expect(() => parseLayoutFile(JSON.stringify([{ ...ok, _type: "banner" }]))).toThrow(/unknown _type/);
		expect(() => parseLayoutFile(JSON.stringify([{ _type: "hero", _version: 1, _key: "h" }]))).toThrow(/heading/);
		expect(() => parseLayoutFile(JSON.stringify([{ ...ok, _key: "" }]))).toThrow(/_key/);
		expect(() => parseLayoutFile(JSON.stringify([ok, ok]))).toThrow(/duplicate/);
		expect(() => parseLayoutFile(JSON.stringify([{ _type: "text", _version: 1, _key: "t", content: [] }]))).toThrow(/Markdown/);
	});
});

describe("canAddLayoutDraft", () => {
	const file = { title: "Metodo" };
	const page = {
		status: "published",
		publishedAt: "2026-11-18T12:00:00.000Z",
		updatedAt: "2026-11-18T12:00:00.000Z",
		draftRevisionId: null,
		scheduledAt: null,
		title: "Metodo",
		layout: undefined,
	};

	it("accepts a published page nobody edited since, with no sections", () => {
		expect(canAddLayoutDraft(page, file)).toBe(true);
		expect(canAddLayoutDraft({ ...page, layout: [] }, file)).toBe(true);
	});

	it("rejects drafts, pending edits, later updates, schedules, retitles and existing sections", () => {
		expect(canAddLayoutDraft({ ...page, status: "draft", publishedAt: null }, file)).toBe(false);
		expect(canAddLayoutDraft({ ...page, draftRevisionId: "rev1" }, file)).toBe(false);
		expect(canAddLayoutDraft({ ...page, updatedAt: "2026-11-18T13:00:00.000Z" }, file)).toBe(false);
		expect(canAddLayoutDraft({ ...page, scheduledAt: "2026-12-01T09:00:00Z" }, file)).toBe(false);
		expect(canAddLayoutDraft({ ...page, title: "Il nostro metodo" }, file)).toBe(false);
		expect(canAddLayoutDraft({ ...page, layout: [{ _type: "cta" }] }, file)).toBe(false);
	});
});

describe("canAddHeroDraft", () => {
	const file = { title: "Metodo" };
	const sections = [{ _type: "cta", _version: 1, _key: "c", heading: "Parliamone." }];
	const expected = { content: markdownToPortableText("Testo."), layout: sections };
	const page = {
		status: "published",
		publishedAt: "2026-11-18T12:00:00.000Z",
		draftRevisionId: null,
		scheduledAt: null,
		title: "Metodo",
		content: markdownToPortableText("Testo."),
		layout: sections,
	};

	it("accepts a published page that is still exactly what the loader published", () => {
		expect(canAddHeroDraft(page, file, expected)).toBe(true);
	});

	it("rejects drafts, pending edits, schedules, retitles, edited body or sections, and an existing Apertura", () => {
		expect(canAddHeroDraft({ ...page, status: "draft", publishedAt: null }, file, expected)).toBe(false);
		expect(canAddHeroDraft({ ...page, draftRevisionId: "rev1" }, file, expected)).toBe(false);
		expect(canAddHeroDraft({ ...page, scheduledAt: "2026-12-01T09:00:00Z" }, file, expected)).toBe(false);
		expect(canAddHeroDraft({ ...page, title: "Il nostro metodo" }, file, expected)).toBe(false);
		expect(canAddHeroDraft({ ...page, content: markdownToPortableText("Altro.") }, file, expected)).toBe(false);
		expect(canAddHeroDraft({ ...page, layout: [{ ...sections[0], heading: "Scrivici." }] }, file, expected)).toBe(false);
		const hero = { _type: "hero", _version: 1, _key: "h", heading: "Metodo" };
		expect(canAddHeroDraft({ ...page, layout: [hero, ...sections] }, file, expected)).toBe(false);
	});
});

describe("sameContent", () => {
	const md = "Testo con [un link](/contatti/) e **grassetto**.";
	const layout = [{ _type: "cta", _version: 1, _key: "c", heading: "Parliamone.", button_url: "/contatti/" }];

	it("ignores random Portable Text keys, key order and null fields", () => {
		expect(sameContent(markdownToPortableText(md), markdownToPortableText(md))).toBe(true);
		expect(sameContent([{ button_url: "/contatti/", heading: "Parliamone.", _key: "c", _version: 1, _type: "cta", text: null }], layout)).toBe(true);
	});

	it("detects any edited text, link, field or section key", () => {
		expect(sameContent(markdownToPortableText(md.replace("/contatti/", "/chi-siamo/")), markdownToPortableText(md))).toBe(false);
		expect(sameContent(markdownToPortableText(md.replace("Testo", "Testi")), markdownToPortableText(md))).toBe(false);
		expect(sameContent([{ ...layout[0], heading: "Scrivici." }], layout)).toBe(false);
		expect(sameContent([{ ...layout[0], _key: "d" }], layout)).toBe(false);
		expect(sameContent([...layout, ...layout], layout)).toBe(false);
		expect(sameContent(undefined, layout)).toBe(false);
	});
});

describe("withoutFilledDefaults", () => {
	const defaults = blockDefaults(JSON.parse(readFileSync(join(import.meta.dirname, "..", "seed", "seed.json"), "utf-8")));
	const hero = { _type: "hero" as const, _version: 1, _key: "home-hero", heading: "Meno complessità. Più impresa.", illustration: "Rete" };

	it("ignores the defaults the admin fills in on opening a draft", () => {
		expect(defaults.hero).toMatchObject({ background: "Blu", align: "Sinistra", accent: "Nessuno" });
		const opened = [{ ...hero, background: "Blu", spacing: defaults.hero.spacing, align: "Sinistra", accent: "Nessuno" }];
		expect(sameContent(withoutFilledDefaults(opened, [hero], defaults), [hero])).toBe(true);
	});

	it("still sees a real edit, a value the file set, and unknown sections", () => {
		expect(sameContent(withoutFilledDefaults([{ ...hero, background: "Tenue" }], [hero], defaults), [hero])).toBe(false);
		const fileSet = { ...hero, illustration: "Nessuna" };
		expect(sameContent(withoutFilledDefaults([{ ...fileSet, illustration: "Rete" }], [fileSet], defaults), [fileSet])).toBe(false);
		const other = [{ ...hero, _key: "added", background: "Blu" }];
		expect(withoutFilledDefaults(other, [hero], defaults)).toEqual(other);
	});
});
