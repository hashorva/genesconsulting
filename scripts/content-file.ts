/** One starter page in content/<locale>/pages/*.md: a small frontmatter block, then Markdown. */
export interface PageFile {
	slug: string;
	title: string;
	seoTitle: string;
	seoDescription: string;
	/** Markdown; the EmDash client converts it to Portable Text. */
	body: string;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const REQUIRED = ["slug", "title", "seoTitle", "seoDescription"] as const;

export function parsePageFile(source: string, name = "page"): PageFile {
	const match = FRONTMATTER.exec(source.replace(/\r\n/g, "\n"));
	if (!match) throw new Error(`${name}: missing frontmatter`);
	const meta: Record<string, string> = {};
	for (const line of match[1].split("\n")) {
		const colon = line.indexOf(":");
		if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
	}
	for (const key of REQUIRED) if (!meta[key]) throw new Error(`${name}: missing "${key}"`);
	return {
		slug: meta.slug,
		title: meta.title,
		seoTitle: meta.seoTitle,
		seoDescription: meta.seoDescription,
		body: match[2].trim(),
	};
}

/** The fields of an EmDash content item that decide whether the loader may publish it. */
/**
 * Pages whose starter text still has "[DA COMPLETARE ...]" or "[DA VERIFICARE ...]" markers
 * (the privacy and cookie policy drafts) need the client's data first: the loader creates
 * them as drafts but never publishes them. A person completes and publishes them in the admin.
 */
export function hasPlaceholders(file: Pick<PageFile, "body">): boolean {
	return /\[DA (COMPLETARE|VERIFICARE)\b/.test(file.body);
}

export interface PageState {
	status: string;
	publishedAt: string | null;
	liveRevisionId: string | null;
	scheduledAt: string | null;
	title?: unknown;
}

/**
 * True only for a draft that looks like the loader's own: never published (an
 * unpublished page keeps publishedAt), not scheduled, and still carrying the title
 * from content/. Anything else was touched in the admin and is left alone.
 */
export function isLoaderDraft(entry: PageState, file: Pick<PageFile, "title">): boolean {
	return (
		entry.status === "draft" &&
		!entry.publishedAt &&
		!entry.liveRevisionId &&
		!entry.scheduledAt &&
		entry.title === file.title
	);
}

/** Section ("Sezioni") block types the pages `layout` field allows (seed/seed.json). */
export const LAYOUT_TYPES = ["hero", "card_grid", "steps", "faq", "media_text", "stats", "cta", "text"] as const;

export interface LayoutBlock {
	_type: (typeof LAYOUT_TYPES)[number];
	_version: number;
	_key: string;
	[field: string]: unknown;
}

/**
 * Parse content/<locale>/pages/<slug>.layout.json: the page's sections, as EmDash
 * stores them. In a "text" block, `content` is Markdown; the loader converts it.
 */
export function parseLayoutFile(source: string, name = "layout"): LayoutBlock[] {
	const blocks = JSON.parse(source) as unknown;
	if (!Array.isArray(blocks)) throw new Error(`${name}: expected an array of blocks`);
	const keys = new Set<string>();
	for (const [index, block] of blocks.entries()) {
		const where = `${name}[${index}]`;
		if (!block || typeof block !== "object") throw new Error(`${where}: not an object`);
		const { _type, _version, _key } = block as Record<string, unknown>;
		if (!LAYOUT_TYPES.includes(_type as LayoutBlock["_type"])) throw new Error(`${where}: unknown _type ${String(_type)}`);
		if (typeof _version !== "number") throw new Error(`${where}: missing _version`);
		if (typeof _key !== "string" || !_key) throw new Error(`${where}: missing _key`);
		if (keys.has(_key)) throw new Error(`${where}: duplicate _key ${_key}`);
		keys.add(_key);
		if (_type === "text" && typeof (block as Record<string, unknown>).content !== "string") {
			throw new Error(`${where}: text block content must be Markdown`);
		}
		if (_type === "hero" && typeof (block as Record<string, unknown>).heading !== "string") {
			throw new Error(`${where}: hero block needs a heading`);
		}
	}
	return blocks as LayoutBlock[];
}

/** The fields of a published page that decide whether the loader may add a layout draft. */
export interface LayoutTarget {
	status: string;
	publishedAt: string | null;
	updatedAt: string;
	draftRevisionId: string | null;
	scheduledAt: string | null;
	title?: unknown;
	layout?: unknown;
}

/**
 * True only for a page the loader published and nobody has edited since: published,
 * no pending draft, not scheduled, never updated after publishing, no sections yet,
 * and still the title from content/. The loader then writes a DRAFT revision; the
 * live page stays as it is until someone publishes the draft.
 */
export function canAddLayoutDraft(entry: LayoutTarget, file: Pick<PageFile, "title">): boolean {
	return (
		entry.status === "published" &&
		!!entry.publishedAt &&
		entry.updatedAt === entry.publishedAt &&
		!entry.draftRevisionId &&
		!entry.scheduledAt &&
		entry.title === file.title &&
		(!Array.isArray(entry.layout) || entry.layout.length === 0)
	);
}

/** The live state of a published page that decides whether the loader may add an Apertura draft. */
export interface HeroTarget {
	status: string;
	publishedAt: string | null;
	draftRevisionId: string | null;
	scheduledAt: string | null;
	title?: unknown;
	content?: unknown;
	layout?: unknown;
}

/**
 * True only for a published page that still is exactly what the loader published:
 * no pending draft, not scheduled, the title from content/, the body (`content`) and
 * the sections of the layout file without its leading Apertura. The loader then adds
 * the Apertura as a DRAFT revision; a page edited in the admin is left alone.
 * `expected` is in stored form (Portable Text), see the loader's layoutData.
 */
export function canAddHeroDraft(
	entry: HeroTarget,
	file: Pick<PageFile, "title">,
	expected: { content: unknown; layout: unknown },
): boolean {
	return (
		entry.status === "published" &&
		!!entry.publishedAt &&
		!entry.draftRevisionId &&
		!entry.scheduledAt &&
		entry.title === file.title &&
		sameContent(entry.content, expected.content) &&
		sameContent(entry.layout, expected.layout)
	);
}

/**
 * A stable form of stored content for comparison: Portable Text keys are random,
 * so blocks and spans lose their _key and mark references become markDef positions.
 * Section blocks keep their _key (it comes from the layout file). Null and missing
 * fields count as the same; object key order does not matter.
 */
export function canonicalContent(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(canonicalContent);
	if (!value || typeof value !== "object") return value;
	const obj = value as Record<string, unknown>;
	if (obj._type === "block" && Array.isArray(obj.children)) {
		const defs = Array.isArray(obj.markDefs) ? (obj.markDefs as Array<Record<string, unknown>>) : [];
		const ref = new Map(defs.map((def, index) => [def._key, `#${index}`]));
		const { _key, markDefs, children, ...rest } = obj;
		return sortedFields({
			...rest,
			markDefs: defs.map(({ _key: _, ...def }) => sortedFields(def)),
			children: (children as Array<Record<string, unknown>>).map(({ _key: _, marks, ...span }) =>
				sortedFields({ ...span, marks: Array.isArray(marks) ? marks.map((mark) => ref.get(mark) ?? mark) : marks }),
			),
		});
	}
	return sortedFields(obj);
}

function sortedFields(obj: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const key of Object.keys(obj).sort()) {
		const v = obj[key];
		if (v === null || v === undefined) continue;
		out[key] = Array.isArray(v) || (v && typeof v === "object") ? canonicalContent(v) : v;
	}
	return out;
}

/** True when stored content equals what the loader would write (see canonicalContent). */
export function sameContent(stored: unknown, expected: unknown): boolean {
	return JSON.stringify(canonicalContent(stored)) === JSON.stringify(canonicalContent(expected));
}
