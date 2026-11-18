import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { parsePageFile } from "../scripts/content-file";

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
