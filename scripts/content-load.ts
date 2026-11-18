/**
 * Load the starter copy in content/it/pages/*.md into an EmDash site, by hand.
 *
 *   bunx emdash login --url https://genesconsulting.purrfect.workers.dev
 *   bun scripts/content-load.ts --url https://genesconsulting.purrfect.workers.dev
 *
 * Safe by design (docs/cd.md, EmDash content safety):
 * - Never runs in CI. Never updates, overwrites or deletes an existing entry:
 *   a page whose slug already exists is skipped, so edits made in the admin win.
 * - New pages are created as DRAFTS. Visitors see nothing until someone publishes them.
 * - `--publish` (run only after the owner approved the drafts) publishes the pages
 *   listed in content/ that are still the loader's never-published drafts,
 *   replaces the seed's placeholder tagline, and fills the primary/footer menus
 *   (published pages only) when they are empty.
 * - `--dry-run` prints what would happen without writing.
 *
 * Auth: EMDASH_TOKEN, else the credentials saved by `bunx emdash login`.
 * Against a local `bun run dev` (localhost) the dev bypass is used.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { EmDashClient } from "emdash/client";

import { isLoaderDraft, parsePageFile, type PageFile, type PageState } from "./content-file";

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

const existing = new Map<string, PageState & { id: string }>();
for await (const item of client.listAll("pages", { locale: LOCALE, limit: 100 })) {
	if (!item.slug) continue;
	const { id, status, publishedAt, liveRevisionId, scheduledAt } = item;
	existing.set(item.slug, { id, status, publishedAt, liveRevisionId, scheduledAt, title: item.data?.title });
}

if (args.publish) await publish(pages);
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
			data: { title: page.title, content: page.body },
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

function createClient(url: string): EmDashClient {
	const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url);
	let token = process.env.EMDASH_TOKEN;
	if (!token && !isLocal) {
		const store = join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "emdash", "auth.json");
		const saved = existsSync(store) ? JSON.parse(readFileSync(store, "utf-8"))[new URL(url).origin] : undefined;
		token = saved?.accessToken;
		if (!token) {
			console.error(`Not logged in. Run: bunx emdash login --url ${url}`);
			process.exit(1);
		}
	}
	return new EmDashClient({ baseUrl: url, token, devBypass: !token && isLocal });
}
