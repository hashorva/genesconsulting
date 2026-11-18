/**
 * Pure planning for scripts/schema-sync.ts: decides what is created, skipped
 * or refused, with no network calls, so the safety rules are unit-tested.
 * The plan only ever adds: new block types, new optional fields on a block type's
 * active version (a compatible change in EmDash, so existing sections stay valid),
 * a missing icon/category, and new optional collection fields. Nothing here can
 * change, rename or delete an existing field, type or entry.
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
	icon?: string;
	category?: string;
	currentVersion: number;
	versions: Array<{ version: number; fields: unknown[] }>;
}
export interface Seed {
	blockTypes?: SeedBlockType[];
	collections: Array<{ slug: string; fields: SeedField[] }>;
}

/** A block type as the site has it: its active version's fields and fingerprint. */
export interface LiveBlockType {
	slug: string;
	fields: Array<{ slug: string; [key: string]: unknown }>;
	fingerprint: string;
	icon?: string | null;
	category?: string | null;
}

/** A collection field as the site has it (a bare slug = exists, details unknown). */
export interface LiveField {
	slug: string;
	type?: string;
	validation?: Record<string, unknown> | null;
}

/**
 * Live state: block types (a bare slug = exists, fields unknown: left alone),
 * and the fields of each existing collection.
 */
export interface LiveSchema {
	blockTypes: Iterable<string | LiveBlockType>;
	collections: Map<string, Iterable<string | LiveField>>;
}

export type PlanCreate =
	| {
			kind: "blockType";
			slug: string;
			label: string;
			description?: string;
			icon?: string;
			category?: string;
			fields: unknown[];
	  }
	| {
			/** Optional fields appended to the active version; live fields are sent back unchanged. */
			kind: "blockTypeFields";
			slug: string;
			expectedFingerprint: string;
			added: string[];
			fields: unknown[];
			icon?: string;
			category?: string;
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
	  }
	| {
			/** New block types appended to an existing blocks field's allowedTypes; the rest of its validation is sent back unchanged. */
			kind: "allowedTypes";
			collection: string;
			slug: string;
			added: string[];
			validation: Record<string, unknown>;
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
	const liveTypes = new Map<string, LiveBlockType | null>();
	for (const type of live.blockTypes) {
		if (typeof type === "string") liveTypes.set(type, null);
		else liveTypes.set(type.slug, type);
	}

	// Block types first: a blocks field may only allow types that exist.
	for (const type of seed.blockTypes ?? []) {
		const active = type.versions.find((v) => v.version === type.currentVersion);
		if (!active) throw new Error(`seed: block type ${type.slug} has no version ${type.currentVersion}`);
		if (!liveTypes.has(type.slug)) {
			plan.create.push({
				kind: "blockType",
				slug: type.slug,
				label: type.label,
				description: type.description,
				icon: type.icon,
				category: type.category,
				fields: active.fields,
			});
			continue;
		}
		const existing = liveTypes.get(type.slug);
		if (!existing) {
			plan.skip.push({ what: `block type ${type.slug}`, reason: "exists, not touched" });
			continue;
		}
		const have = new Set(existing.fields.map((f) => f.slug));
		const missing = (active.fields as SeedField[]).filter((f) => !have.has(f.slug));
		for (const field of missing.filter((f) => f.required)) {
			plan.refuse.push({
				what: `${type.slug}.${field.slug}`,
				reason: "required: would break existing sections",
			});
		}
		const added = missing.filter((f) => !f.required);
		// Repeaters (e.g. card_grid.cards): append missing optional sub-fields, keep the live ones.
		const seedBySlug = new Map((active.fields as SeedField[]).map((f) => [f.slug, f]));
		const addedSub: string[] = [];
		const liveFields = existing.fields.map((field) => {
			const wanted = seedBySlug.get(field.slug);
			if (field.type !== "repeater" || wanted?.type !== "repeater") return field;
			const validation = (field.validation ?? {}) as { subFields?: Array<{ slug: string; required?: boolean }> };
			const liveSub = validation.subFields ?? [];
			const seedSub = ((wanted.validation as typeof validation | undefined)?.subFields ?? []) as typeof liveSub;
			const haveSub = new Set(liveSub.map((f) => f.slug));
			const missingSub = seedSub.filter((f) => !haveSub.has(f.slug));
			for (const sub of missingSub.filter((f) => f.required)) {
				plan.refuse.push({
					what: `${type.slug}.${field.slug}.${sub.slug}`,
					reason: "required: would break existing sections",
				});
			}
			const appended = missingSub.filter((f) => !f.required);
			if (appended.length === 0) return field;
			addedSub.push(...appended.map((f) => `${field.slug}.${f.slug}`));
			return { ...field, validation: { ...validation, subFields: [...liveSub, ...appended] } };
		});
		const icon = !existing.icon && type.icon ? type.icon : undefined;
		const category = !existing.category && type.category ? type.category : undefined;
		if (added.length === 0 && addedSub.length === 0 && !icon && !category) {
			plan.skip.push({ what: `block type ${type.slug}`, reason: "up to date" });
			continue;
		}
		plan.create.push({
			kind: "blockTypeFields",
			slug: type.slug,
			expectedFingerprint: existing.fingerprint,
			added: [...added.map((f) => f.slug), ...addedSub],
			fields: [...liveFields, ...added],
			icon,
			category,
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
		const existing = new Map<string, LiveField>();
		for (const f of liveFields) existing.set(typeof f === "string" ? f : f.slug, typeof f === "string" ? { slug: f } : f);
		for (const [index, field] of collection.fields.entries()) {
			const live = existing.get(field.slug);
			if (live) {
				const wanted = (field.validation as { allowedTypes?: string[] } | undefined)?.allowedTypes;
				if (field.type !== "blocks" || live.type !== "blocks" || !wanted) continue;
				const liveAllowed = live.validation?.allowedTypes;
				if (!Array.isArray(liveAllowed)) {
					// No list on the site: sending one would narrow the field, not extend it.
					plan.skip.push({
						what: `${collection.slug}.${field.slug}`,
						reason: "no allowedTypes list on the site, not touched",
					});
					continue;
				}
				const have = liveAllowed as string[];
				const added = wanted.filter((t) => !have.includes(t));
				if (added.length === 0) continue;
				plan.create.push({
					kind: "allowedTypes",
					collection: collection.slug,
					slug: field.slug,
					added,
					validation: { ...live.validation, allowedTypes: [...have, ...added] },
				});
				continue;
			}
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
