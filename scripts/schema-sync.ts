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
 * - Never runs in CI. Auth as in scripts/content-load.ts.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { createClient } from "./emdash-client";

interface SeedField {
	slug: string;
	label: string;
	type: string;
	required?: boolean;
	[key: string]: unknown;
}
interface SeedBlockType {
	slug: string;
	label: string;
	description?: string;
	currentVersion: number;
	versions: Array<{ version: number; fields: unknown[] }>;
}
interface Seed {
	blockTypes?: SeedBlockType[];
	collections: Array<{ slug: string; fields: SeedField[] }>;
}

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

// Block types first: a blocks field may only allow types that exist.
const liveTypes = new Set(((await client.blockTypes()) as Array<{ slug: string }>).map((t) => t.slug));
for (const type of seed.blockTypes ?? []) {
	if (liveTypes.has(type.slug)) {
		console.log(`skip     block type ${type.slug} (exists, not touched)`);
		continue;
	}
	const active = type.versions.find((v) => v.version === type.currentVersion);
	if (!active) throw new Error(`seed: block type ${type.slug} has no version ${type.currentVersion}`);
	if (!dryRun) {
		await client.createBlockType({
			slug: type.slug,
			label: type.label,
			description: type.description,
			fields: active.fields as never,
		});
	}
	console.log(`${dryRun ? "would create" : "created"} block type ${type.slug}`);
}

for (const collection of seed.collections) {
	const live = (await client.collection(collection.slug)) as { fields?: Array<{ slug: string }> } | null;
	if (!live) {
		console.log(`skip     collection ${collection.slug} (missing on the site; create it in the admin)`);
		continue;
	}
	const liveFields = new Set((live.fields ?? []).map((f) => f.slug));
	for (const [index, field] of collection.fields.entries()) {
		if (liveFields.has(field.slug)) continue;
		if (field.required) {
			console.log(`refuse   ${collection.slug}.${field.slug} (required: not additive on existing entries)`);
			continue;
		}
		if (!dryRun) {
			const { slug, label, type, ...rest } = field;
			await client.createField(collection.slug, {
				slug,
				label,
				type,
				validation: (rest.validation as never) ?? null,
				searchable: rest.searchable as boolean | undefined,
				sortOrder: index,
			} as never);
		}
		console.log(`${dryRun ? "would add" : "added"} field ${collection.slug}.${field.slug} (${field.type})`);
	}
}
