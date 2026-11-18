import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { isLoaderDraft, parsePageFile } from "../scripts/content-file";

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
