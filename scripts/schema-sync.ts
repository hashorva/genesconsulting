/**
 * Bring an EmDash site's schema up to seed/seed.json, by hand, additively.
 *
 *   bunx emdash login --url https://genesconsulting.purrfect.workers.dev
 *   bun scripts/schema-sync.ts --url https://genesconsulting.purrfect.workers.dev --dry-run
 *   bun scripts/schema-sync.ts --url https://genesconsulting.purrfect.workers.dev
 *
 * The seed is only applied when a site is first set up, so later additions
 * (new block types, new optional fields) reach a running site through this.
 * - Creates block types and collection fields that are missing, and appends
 *   missing optional fields (plus a missing icon/category) to an existing block
 *   type's active version. EmDash accepts that only as a compatible change, with a
 *   fingerprint check, so existing sections stay valid. Nothing else: never changes,
 *   renames or deletes a type, field, collection or any content.
 * - Refuses a missing field that is required (not additive on existing entries).
 * - `--presentation` also brings what editors see in line with the seed: block type
 *   label, description, icon and group in the "Add block" picker, and each field's
 *   label, order and default value. Only those: types, "required", validation and
 *   select options stay as they are, so EmDash makes it a compatible change in place
 *   (fingerprint check) and stored sections stay valid.
 * - The decisions live in scripts/schema-plan.ts (tested in tests/schema-sync.test.ts).
 * - Never runs in CI. Auth as in scripts/content-load.ts.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { createClient } from "./emdash-client";
import { type LiveBlockType, type LiveField, planPresentation, planSync, type Seed } from "./schema-plan";

const { values: args } = parseArgs({
	options: {
		url: { type: "string" },
		seed: { type: "string", default: join(import.meta.dirname, "..", "seed", "seed.json") },
		"dry-run": { type: "boolean", default: false },
		presentation: { type: "boolean", default: false },
	},
});
if (!args.url) {
	console.error("Missing --url (e.g. --url http://localhost:4321)");
	process.exit(1);
}
const dryRun = args["dry-run"];
const client = createClient(args.url.replace(/\/$/, ""));
const seed = JSON.parse(readFileSync(args.seed, "utf-8")) as Seed;

async function readBlockTypes(): Promise<LiveBlockType[]> {
	return (await client.blockTypes()).map((type) => {
		const active = type.versions.find((v) => v.version === type.currentVersion);
		if (!active) throw new Error(`site: block type ${type.slug} has no active version`);
		return {
			slug: type.slug,
			fields: active.fields as LiveBlockType["fields"],
			fingerprint: active.fingerprint,
			label: type.label,
			description: type.description,
			icon: type.icon,
			category: type.category,
		};
	});
}
const liveTypes = await readBlockTypes();
const liveCollections = new Map<string, LiveField[]>();
for (const collection of seed.collections) {
	const live = (await client.collection(collection.slug)) as { fields?: Array<{ slug: string }> } | null;
	if (live) {
		liveCollections.set(
			collection.slug,
			(live.fields ?? []).map((f) => ({ slug: f.slug, type: f.type, validation: f.validation as LiveField["validation"] })),
		);
	}
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
				icon: item.icon,
				category: item.category,
				fields: item.fields as never,
			});
		}
		console.log(`${dryRun ? "would create" : "created"} block type ${item.slug}`);
	} else if (item.kind === "blockTypeFields") {
		if (!dryRun) {
			// Never `breaking: true`: EmDash refuses anything that is not a compatible change.
			await client.updateBlockType(item.slug, {
				expectedFingerprint: item.expectedFingerprint,
				fields: item.fields as never,
				...(item.icon ? { icon: item.icon } : {}),
				...(item.category ? { category: item.category } : {}),
			});
		}
		const what = [
			item.added.length > 0 ? `fields ${item.added.join(", ")}` : "",
			item.icon ? "icon" : "",
			item.category ? "category" : "",
		].filter(Boolean);
		console.log(`${dryRun ? "would add" : "added"} ${what.join(" + ")} to block type ${item.slug}`);
	} else if (item.kind === "allowedTypes") {
		if (!dryRun) {
			// The client has no updateField; this is the same PUT the admin's field editor sends.
			// Only allowedTypes grows: EmDash keeps blocks of every type already stored.
			const path = `/schema/collections/${encodeURIComponent(item.collection)}/fields/${encodeURIComponent(item.slug)}`;
			await (client as unknown as { request(method: string, path: string, body: unknown): Promise<unknown> }).request(
				"PUT",
				path,
				{ validation: item.validation },
			);
		}
		console.log(`${dryRun ? "would allow" : "allowed"} ${item.added.join(", ")} in ${item.collection}.${item.slug}`);
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

if (args.presentation) {
	// Read again: the additions above changed fields and fingerprints. In a dry run
	// they were not made, so types still missing fields are reported, not planned.
	const presentation = planPresentation(seed, dryRun ? liveTypes : await readBlockTypes());
	for (const note of presentation.skip) console.log(`skip     ${note.what} (${note.reason})`);
	for (const item of presentation.update) {
		if (!dryRun) {
			// Never `breaking: true`: EmDash refuses anything that is not a compatible change.
			await client.updateBlockType(item.slug, {
				expectedFingerprint: item.expectedFingerprint,
				label: item.label,
				description: item.description,
				icon: item.icon,
				category: item.category,
				fields: item.fields as never,
			});
		}
		console.log(`${dryRun ? "would update" : "updated"} ${item.changed.join(", ")} of block type ${item.slug}`);
	}
}
