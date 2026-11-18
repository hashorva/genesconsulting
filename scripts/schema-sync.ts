/**
 * Bring an EmDash site's schema up to seed/seed.json, by hand, additively.
 *
 *   bunx emdash login --url https://genesconsulting.purrfect.workers.dev
 *   bun scripts/schema-sync.ts --url https://genesconsulting.purrfect.workers.dev --dry-run
 *   bun scripts/schema-sync.ts --url https://genesconsulting.purrfect.workers.dev
 *
 * The seed is only applied when a site is first set up, so later additions
 * (new block types, new optional fields) reach a running site through this.
 * - Creates block types and collection fields that are missing. Nothing else:
 *   never changes, renames or deletes a type, field, collection or any content.
 * - Refuses a missing field that is required (not additive on existing entries).
 * - The decisions live in scripts/schema-plan.ts (tested in tests/schema-sync.test.ts).
 * - Never runs in CI. Auth as in scripts/content-load.ts.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { createClient } from "./emdash-client";
import { planSync, type Seed } from "./schema-plan";

const { values: args } = parseArgs({
	options: {
		url: { type: "string" },
		seed: { type: "string", default: join(import.meta.dirname, "..", "seed", "seed.json") },
		"dry-run": { type: "boolean", default: false },
	},
});
if (!args.url) {
	console.error("Missing --url (e.g. --url http://localhost:4321)");
	process.exit(1);
}
const dryRun = args["dry-run"];
const client = createClient(args.url.replace(/\/$/, ""));
const seed = JSON.parse(readFileSync(args.seed, "utf-8")) as Seed;

const liveTypes = ((await client.blockTypes()) as Array<{ slug: string }>).map((t) => t.slug);
const liveCollections = new Map<string, string[]>();
for (const collection of seed.collections) {
	const live = (await client.collection(collection.slug)) as { fields?: Array<{ slug: string }> } | null;
	if (live) liveCollections.set(collection.slug, (live.fields ?? []).map((f) => f.slug));
}

const plan = planSync(seed, { blockTypes: liveTypes, collections: liveCollections });
for (const note of plan.skip) console.log(`skip     ${note.what} (${note.reason})`);
for (const note of plan.refuse) console.log(`refuse   ${note.what} (${note.reason})`);

// Plan order is kept: block types are created before fields that allow them.
for (const item of plan.create) {
	if (item.kind === "blockType") {
		if (!dryRun) {
			await client.createBlockType({
				slug: item.slug,
				label: item.label,
				description: item.description,
				fields: item.fields as never,
			});
		}
		console.log(`${dryRun ? "would create" : "created"} block type ${item.slug}`);
	} else {
		if (!dryRun) {
			await client.createField(item.collection, {
				slug: item.slug,
				label: item.label,
				type: item.type,
				validation: item.validation as never,
				searchable: item.searchable,
				sortOrder: item.sortOrder,
			} as never);
		}
		console.log(`${dryRun ? "would add" : "added"} field ${item.collection}.${item.slug} (${item.type})`);
	}
}
