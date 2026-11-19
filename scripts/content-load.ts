/**
 * Load the starter copy in content/it/pages/*.md into an EmDash site, by hand.
 *
 *   bunx emdash login --url https://genesconsulting.purrfect.workers.dev
 *   bun scripts/content-load.ts --url https://genesconsulting.purrfect.workers.dev
 *
 * Safe by design (docs/cd.md, EmDash content safety):
 * - Never runs in CI. Never overwrites live content or deletes an entry: a page
 *   whose slug already exists is skipped, so edits made in the admin win.
 * - New pages are created as DRAFTS. Visitors see nothing until someone publishes them.
 * - `--publish` (run only after the owner approved the drafts) publishes the pages
 *   listed in content/ that are still the loader's never-published drafts,
 *   replaces the seed's placeholder tagline, and fills the primary/footer menus
 *   (published pages only) when they are empty.
 * - `--layout` adds the sections in content/it/pages/<slug>.layout.json (and that
 *   file's shorter body) to pages the loader published and nobody edited since, as a
 *   DRAFT revision: the live page is unchanged until someone publishes the draft.
 *   `--layout --publish` (after the owner approved those drafts) publishes only the
 *   pages whose pending draft is still exactly what the loader wrote.
 * - `--hero` adds the Apertura that opens <slug>.layout.json as the first section of
 *   pages that are still exactly what the loader published (title, body, the other
 *   sections), as a DRAFT revision. Publish those drafts with `--layout --publish`.
 * - `--dry-run` prints what would happen without writing.
 *
 * Auth: EMDASH_TOKEN, else the credentials saved by `bunx emdash login`.
 * Against a local `bun run dev` (localhost) the dev bypass is used.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { markdownToPortableText } from "emdash/client";

import {
	canAddHeroDraft,
	canAddLayoutDraft,
	hasPlaceholders,
	isLoaderDraft,
	type LayoutBlock,
	parseLayoutFile,
	parsePageFile,
	type PageFile,
	type PageState,
	sameContent,
} from "./content-file";
import { createClient } from "./emdash-client";

const CONTENT_DIR = join(import.meta.dirname, "..", "content", "it", "pages");
const LOCALE = "it";
const TAGLINE = "Consulenza aziendale e servizi integrati per imprese e studi professionali.";
// The seed's placeholder (seed/seed.json). Any other tagline was set by an editor and is kept.
const SEED_TAGLINE = "Meno complessità. Più impresa.";

// Menu items are added in this order, and only if the menu is empty.
const PRIMARY_MENU: Array<[label: string, slug: string]> = [
	["Chi siamo", "chi-siamo"],
	["Servizi", "servizi"],
	["Per le imprese", "per-le-imprese"],
	["Per gli studi", "per-gli-studi-professionali"],
	["Metodo", "metodo"],
];
const FOOTER_MENU: Array<[label: string, slug: string]> = [["Note legali", "note-legali"]];

const { values: args } = parseArgs({
	options: {
		url: { type: "string" },
		publish: { type: "boolean", default: false },
		layout: { type: "boolean", default: false },
		hero: { type: "boolean", default: false },
		"dry-run": { type: "boolean", default: false },
	},
});

if (!args.url) {
	console.error("Missing --url (e.g. --url http://localhost:4321)");
	process.exit(1);
}
const baseUrl = args.url.replace(/\/$/, "");
const dryRun = args["dry-run"];
const client = createClient(baseUrl);

const pages = readdirSync(CONTENT_DIR)
	.filter((name) => name.endsWith(".md"))
	.sort()
	.map((name) => parsePageFile(readFileSync(join(CONTENT_DIR, name), "utf-8"), name));

/** Sections per page slug, from content/it/pages/<slug>.layout.json when present. */
const layouts = new Map<string, LayoutBlock[]>();
for (const page of pages) {
	const name = `${page.slug}.layout.json`;
	const path = join(CONTENT_DIR, name);
	if (existsSync(path)) layouts.set(page.slug, parseLayoutFile(readFileSync(path, "utf-8"), name));
}

/** The layout as EmDash stores it: text blocks' Markdown becomes Portable Text. */
function layoutData(blocks: LayoutBlock[]) {
	return blocks.map((block) =>
		block._type === "text" ? { ...block, content: markdownToPortableText(block.content as string) } : block,
	);
}

const existing = new Map<string, PageState & { id: string }>();
for await (const item of client.listAll("pages", { locale: LOCALE, limit: 100 })) {
	if (!item.slug) continue;
	const { id, status, publishedAt, liveRevisionId, scheduledAt } = item;
	existing.set(item.slug, { id, status, publishedAt, liveRevisionId, scheduledAt, title: item.data?.title });
}

if (args.hero && (args.layout || args.publish)) {
	console.error("--hero only adds drafts. Publish them afterwards with --layout --publish.");
	process.exit(1);
}

if (args.hero) await addHeroDrafts(pages);
else if (args.layout && args.publish) await publishLayouts(pages);
else if (args.layout) await addLayoutDrafts(pages);
else if (args.publish) await publish(pages);
else await createDrafts(pages);

async function createDrafts(files: PageFile[]) {
	for (const page of files) {
		if (existing.has(page.slug)) {
			console.log(`skip     ${page.slug} (already exists, not touched)`);
			continue;
		}
		if (dryRun) {
			console.log(`would create draft ${page.slug}`);
			continue;
		}
		await client.create("pages", {
			slug: page.slug,
			locale: LOCALE,
			data: {
				title: page.title,
				content: page.body,
				...(layouts.has(page.slug) ? { layout: layoutData(layouts.get(page.slug) ?? []) } : {}),
			},
			seo: { title: page.seoTitle, description: page.seoDescription },
		});
		console.log(`draft    ${page.slug}`);
	}
	console.log("\nDrafts are not public. Review them in /_emdash/admin, then run with --publish.");
}

async function publish(files: PageFile[]) {
	for (const page of files) {
		const entry = existing.get(page.slug);
		if (!entry) {
			console.log(`missing  ${page.slug} (run without --publish first)`);
			continue;
		}
		// Only the loader's own, never-published drafts. A page that was ever published
		// (then unpublished), scheduled, or retitled in the admin is left alone.
		if (!isLoaderDraft(entry, page)) {
			console.log(`skip     ${page.slug} (status ${entry.status}, changed in the admin or published before)`);
			continue;
		}
		if (hasPlaceholders(page)) {
			console.log(`skip     ${page.slug} (has [DA COMPLETARE] markers: complete and publish it in the admin)`);
			continue;
		}
		if (!dryRun) await client.publish("pages", entry.id);
		entry.status = "published";
		console.log(`${dryRun ? "would publish" : "published"} ${page.slug}`);
	}

	const settings = (await client.request("GET", "/settings")) as { tagline?: string };
	if (!settings.tagline || settings.tagline === SEED_TAGLINE) {
		if (!dryRun) await client.request("POST", "/settings", { tagline: TAGLINE });
		console.log(`${dryRun ? "would set" : "set"} tagline: ${TAGLINE}`);
	} else if (settings.tagline !== TAGLINE) {
		console.log("skip     tagline (set in the admin, not touched)");
	}

	await fillMenu("primary", PRIMARY_MENU);
	await fillMenu("footer", FOOTER_MENU);
}

async function fillMenu(name: string, items: Array<[string, string]>) {
	const menu = (await client.menu(name)) as { items?: unknown[] };
	if ((menu.items ?? []).length > 0) {
		console.log(`skip     menu ${name} (already has items)`);
		return;
	}
	for (const [index, [label, slug]] of items.entries()) {
		// Link only pages visitors can open (published now or before).
		const entry = existing.get(slug);
		if (entry?.status !== "published") {
			console.log(`skip     menu ${name}: ${label} (page not published)`);
			continue;
		}
		if (!dryRun) {
			await client.request("POST", `/menus/${encodeURIComponent(name)}/items`, {
				type: "page",
				label,
				referenceCollection: "pages",
				referenceId: entry.id,
				sortOrder: index,
			});
		}
		console.log(`${dryRun ? "would add" : "added"} menu ${name}: ${label}`);
	}
}

async function addLayoutDrafts(files: PageFile[]) {
	for (const page of files) {
		const blocks = layouts.get(page.slug);
		if (!blocks) continue;
		const entry = existing.get(page.slug);
		if (!entry) {
			console.log(`missing  ${page.slug} (not on the site)`);
			continue;
		}
		// Fresh read: its _rev makes the write fail (409) if anyone saves in between.
		const item = await client.get("pages", entry.id, { locale: LOCALE });
		const target = { ...item, title: item.data?.title, layout: item.data?.layout };
		if (!canAddLayoutDraft(target, page)) {
			console.log(`skip     ${page.slug} (edited in the admin, has a draft, or already has sections)`);
			continue;
		}
		if (!dryRun) {
			await client.update("pages", entry.id, {
				locale: LOCALE,
				_rev: item._rev,
				data: { content: page.body, layout: layoutData(blocks) },
			});
		}
		console.log(`${dryRun ? "would add" : "added"} sections draft ${page.slug} (${blocks.length} sections)`);
	}
	console.log("\nThe live pages are unchanged. Review the drafts in /_emdash/admin, then run with --layout --publish.");
}

async function publishLayouts(files: PageFile[]) {
	for (const page of files) {
		const blocks = layouts.get(page.slug);
		const entry = existing.get(page.slug);
		if (!blocks || !entry) continue;
		const item = await client.get("pages", entry.id, { locale: LOCALE });
		if (!item.draftRevisionId || item.scheduledAt) {
			console.log(`skip     ${page.slug} (no pending draft, or scheduled)`);
			continue;
		}
		// Publish only if the draft is exactly what the loader wrote: title, body and every
		// section field. Any edit made in the admin since then is left for a person to publish.
		const { draft } = await client.compare("pages", entry.id);
		const same =
			draft?.title === page.title &&
			sameContent(draft?.content, markdownToPortableText(page.body)) &&
			sameContent(draft?.layout, layoutData(blocks));
		if (!same) {
			console.log(`skip     ${page.slug} (draft changed in the admin; publish it there)`);
			continue;
		}
		if (!dryRun) await client.publish("pages", entry.id);
		console.log(`${dryRun ? "would publish" : "published"} ${page.slug}`);
	}
}

async function addHeroDrafts(files: PageFile[]) {
	for (const page of files) {
		const blocks = layouts.get(page.slug);
		if (blocks?.[0]?._type !== "hero") continue;
		const entry = existing.get(page.slug);
		if (!entry) {
			console.log(`missing  ${page.slug} (not on the site)`);
			continue;
		}
		// Fresh, raw read (stored Portable Text, not Markdown): its _rev makes the write
		// fail (409) if anyone saves in between.
		const item = await client.get("pages", entry.id, { locale: LOCALE, raw: true });
		const target = { ...item, title: item.data?.title, content: item.data?.content, layout: item.data?.layout };
		const expected = { content: markdownToPortableText(page.body), layout: layoutData(blocks.slice(1)) };
		if (!canAddHeroDraft(target, page, expected)) {
			console.log(`skip     ${page.slug} (edited in the admin, has a draft, or already has an Apertura)`);
			continue;
		}
		if (!dryRun) {
			await client.update("pages", entry.id, {
				locale: LOCALE,
				_rev: item._rev,
				data: { layout: layoutData(blocks) },
			});
		}
		console.log(`${dryRun ? "would add" : "added"} Apertura draft ${page.slug}`);
	}
	console.log("\nThe live pages are unchanged. Review the drafts in /_emdash/admin, then run with --layout --publish.");
}
