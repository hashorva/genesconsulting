/**
 * Pure planning for scripts/schema-sync.ts: decides what is created, skipped
 * or refused, with no network calls, so the safety rules are unit-tested.
 * The plan only ever contains creations: nothing here can change or delete.
 */
export interface SeedField {
	slug: string;
	label: string;
	type: string;
	required?: boolean;
	[key: string]: unknown;
}
export interface SeedBlockType {
	slug: string;
	label: string;
	description?: string;
	currentVersion: number;
	versions: Array<{ version: number; fields: unknown[] }>;
}
export interface Seed {
	blockTypes?: SeedBlockType[];
	collections: Array<{ slug: string; fields: SeedField[] }>;
}

/** Live state: block type slugs, and field slugs per existing collection. */
export interface LiveSchema {
	blockTypes: Iterable<string>;
	collections: Map<string, Iterable<string>>;
}

export type PlanCreate =
	| {
			kind: "blockType";
			slug: string;
			label: string;
			description?: string;
			fields: unknown[];
	  }
	| {
			kind: "field";
			collection: string;
			slug: string;
			label: string;
			type: string;
			validation: unknown;
			searchable?: boolean;
			sortOrder: number;
	  };

export interface PlanNote {
	what: string;
	reason: string;
}

export interface SyncPlan {
	create: PlanCreate[];
	skip: PlanNote[];
	refuse: PlanNote[];
}

export function planSync(seed: Seed, live: LiveSchema): SyncPlan {
	const plan: SyncPlan = { create: [], skip: [], refuse: [] };
	const liveTypes = new Set(live.blockTypes);

	// Block types first: a blocks field may only allow types that exist.
	for (const type of seed.blockTypes ?? []) {
		if (liveTypes.has(type.slug)) {
			plan.skip.push({ what: `block type ${type.slug}`, reason: "exists, not touched" });
			continue;
		}
		const active = type.versions.find((v) => v.version === type.currentVersion);
		if (!active) throw new Error(`seed: block type ${type.slug} has no version ${type.currentVersion}`);
		plan.create.push({
			kind: "blockType",
			slug: type.slug,
			label: type.label,
			description: type.description,
			fields: active.fields,
		});
	}

	for (const collection of seed.collections) {
		const liveFields = live.collections.get(collection.slug);
		if (!liveFields) {
			plan.skip.push({
				what: `collection ${collection.slug}`,
				reason: "missing on the site; create it in the admin",
			});
			continue;
		}
		const existing = new Set(liveFields);
		for (const [index, field] of collection.fields.entries()) {
			if (existing.has(field.slug)) continue;
			if (field.required) {
				plan.refuse.push({
					what: `${collection.slug}.${field.slug}`,
					reason: "required: not additive on existing entries",
				});
				continue;
			}
			plan.create.push({
				kind: "field",
				collection: collection.slug,
				slug: field.slug,
				label: field.label,
				type: field.type,
				validation: field.validation ?? null,
				searchable: field.searchable as boolean | undefined,
				sortOrder: index,
			});
		}
	}
	return plan;
}
