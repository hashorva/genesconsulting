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
	label?: string;
	description?: string | null;
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

/**
 * Presentation of an existing block type, as the editor sees it: the type's label,
 * description, icon and category (the "Add block" picker), and each field's label,
 * order and default value (pre-filled on new blocks). EmDash treats all of these as
 * compatible changes made in place, so stored sections stay valid. Field types,
 * "required", validation and select options always stay as they are on the site.
 */
export interface PresentationUpdate {
	slug: string;
	expectedFingerprint: string;
	label: string;
	description: string | null;
	icon: string | null;
	category: string | null;
	fields: Array<Record<string, unknown>>;
	changed: string[];
}

type AnyField = { slug: string; type?: unknown; label?: unknown; defaultValue?: unknown; validation?: unknown; [key: string]: unknown };

/** The seed's default only if the site would accept it (a select default must be one of the live options). */
function validDefault(live: AnyField, seed: AnyField): unknown {
	if (seed.defaultValue === undefined) return undefined;
	if (live.type !== "select") return seed.defaultValue;
	const options = (live.validation as { options?: unknown } | null | undefined)?.options;
	return Array.isArray(options) && options.includes(seed.defaultValue) ? seed.defaultValue : undefined;
}

/** Live fields in the seed's order with the seed's labels and defaults; fields only on the site keep their place at the end. */
function presentFields<T extends AnyField>(live: readonly T[], seed: readonly AnyField[], withDefaults: boolean): T[] {
	const liveBySlug = new Map(live.map((f) => [f.slug, f]));
	const out: T[] = [];
	for (const wanted of seed) {
		const have = liveBySlug.get(wanted.slug);
		if (!have) continue;
		const { defaultValue: _old, ...rest } = have;
		const next: AnyField = { ...rest, slug: have.slug, label: wanted.label ?? have.label };
		if (withDefaults) {
			const value = validDefault(have, wanted);
			if (value !== undefined) next.defaultValue = value;
		} else if (have.defaultValue !== undefined) {
			next.defaultValue = have.defaultValue;
		}
		if (have.type === "repeater" && wanted.type === "repeater") {
			const validation = (have.validation ?? {}) as { subFields?: AnyField[] };
			const seedSub = ((wanted.validation as typeof validation | undefined)?.subFields ?? []) as AnyField[];
			// Sub-fields have no default in EmDash: only their labels and order change.
			next.validation = { ...validation, subFields: presentFields(validation.subFields ?? [], seedSub, false) };
		}
		out.push(next as T);
	}
	const placed = new Set(seed.map((f) => f.slug));
	return [...out, ...live.filter((f) => !placed.has(f.slug))];
}

export function planPresentation(
	seed: Seed,
	live: Iterable<LiveBlockType>,
): { update: PresentationUpdate[]; skip: PlanNote[] } {
	const result: { update: PresentationUpdate[]; skip: PlanNote[] } = { update: [], skip: [] };
	const liveBySlug = new Map([...live].map((t) => [t.slug, t]));
	for (const type of seed.blockTypes ?? []) {
		const existing = liveBySlug.get(type.slug);
		if (!existing) continue;
		const active = type.versions.find((v) => v.version === type.currentVersion);
		const seedFields = (active?.fields ?? []) as AnyField[];
		const have = new Set(existing.fields.map((f) => f.slug));
		const missing = seedFields.filter((f) => !have.has(f.slug));
		if (missing.length > 0) {
			result.skip.push({
				what: `presentation of ${type.slug}`,
				reason: `fields ${missing.map((f) => f.slug).join(", ")} not on the site yet`,
			});
			continue;
		}
		const fields = presentFields(existing.fields as AnyField[], seedFields, true);
		const next = {
			label: type.label,
			description: type.description ?? null,
			icon: type.icon ?? null,
			category: type.category ?? null,
		};
		const changed: string[] = [];
		if (next.label !== (existing.label ?? type.label)) changed.push("label");
		if (next.description !== (existing.description ?? null)) changed.push("description");
		if (next.icon !== (existing.icon ?? null)) changed.push("icon");
		if (next.category !== (existing.category ?? null)) changed.push("category");
		if (stable(fields) !== stable(existing.fields)) changed.push("fields");
		if (changed.length === 0) {
			result.skip.push({ what: `presentation of ${type.slug}`, reason: "up to date" });
			continue;
		}
		result.update.push({ slug: type.slug, expectedFingerprint: existing.fingerprint, ...next, fields, changed });
	}
	return result;
}

/** JSON with object keys sorted (array order kept), so key order alone is not a change. */
function stable(value: unknown): string {
	return JSON.stringify(value, (_key, v) =>
		v && typeof v === "object" && !Array.isArray(v)
			? Object.fromEntries(Object.keys(v).sort().map((k) => [k, (v as Record<string, unknown>)[k]]))
			: v,
	);
}
