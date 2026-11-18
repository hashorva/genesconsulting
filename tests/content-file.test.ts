import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { canAddLayoutDraft, isLoaderDraft, parseLayoutFile, parsePageFile } from "../scripts/content-file";
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
			}
		}
	});

	it("rejects unknown types, missing or duplicate keys, and non-Markdown text", () => {
		const ok = { _type: "cta", _version: 1, _key: "a", heading: "Parliamone." };
		expect(parseLayoutFile(JSON.stringify([ok]))).toHaveLength(1);
		expect(() => parseLayoutFile("{}")).toThrow(/array/);
		expect(() => parseLayoutFile(JSON.stringify([{ ...ok, _type: "hero" }]))).toThrow(/unknown _type/);
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
