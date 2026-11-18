/**
 * Look of the redesign (flag `design_refresh`, on top of `page_composer`).
 *
 * Pure helpers only (no Astro, no env), so they are unit tested.
 * Every class is a Tailwind default (HARD RULE, AGENTS.md); the mapping table
 * for humans is in docs/design/brand-colors.md, "Redesign (design_refresh)".
 */
import { anchorId, OPTIONS, pick } from "./section-style";

type Background = (typeof OPTIONS.background)[number];
type Spacing = (typeof OPTIONS.spacing)[number];

/**
 * Bands of the redesign. "Blu" scopes the dark theme to the band (like page_composer),
 * on a deep sky-950 that is the same in light and dark mode, like the deck.
 */
const BAND: Record<Background, string> = {
	Nessuno: "bg-background",
	Tenue: "bg-sky-50 dark:bg-sky-900/40",
	// The gradient keeps the band visible in dark mode too, where the page is sky-950 as well.
	Blu: "dark relative isolate overflow-hidden bg-linear-to-b from-sky-900 to-sky-950 text-foreground",
};

const SPACE: Record<Spacing, string> = {
	Compatta: "py-10 md:py-14",
	Normale: "py-16 md:py-24",
	Ampia: "py-20 md:py-32",
};

interface BandBlock {
	_type: string;
	background?: string | null;
	spacing?: string | null;
	cards?: readonly { link_url?: string | null }[] | null;
}

/**
 * The band a section gets. An editor's choice always wins; a section left empty gets
 * the page rhythm: the closing call to action and the steps sit on the dark brand band,
 * a grid of three or more linked cards on the soft tint, everything else on the page colour.
 */
export function refreshBackground(block: BandBlock): Background {
	if (block.background) return pick("background", block.background, "Nessuno");
	if (block._type === "cta" || block._type === "steps") return "Blu";
	// Linked cards (services) on the tint; cards without links render as open features on the page colour.
	if (block._type === "card_grid" && (block.cards?.length ?? 0) >= 3 && block.cards!.some((card) => card.link_url)) return "Tenue";
	return "Nessuno";
}

export function refreshBand(block: BandBlock): { band: string; background: Background } {
	const background = refreshBackground(block);
	const spacing = pick("spacing", block.spacing, block._type === "cta" ? "Ampia" : "Normale");
	return { band: `${BAND[background]} ${SPACE[spacing]}`, background };
}

/** Stagger for items revealed together: default animation delays, capped so long lists do not drag. */
const DELAYS = ["delay-0", "delay-75", "delay-150", "delay-200", "delay-300"] as const;
export function revealDelay(index: number): string {
	return DELAYS[Math.min(Math.max(index, 0), DELAYS.length - 1)];
}

/** "01", "02"... for section and card numbers. */
export function ordinal(index: number): string {
	return String(index + 1).padStart(2, "0");
}

/**
 * The deck sets its claim on two lines, one sentence each ("Meno complessità. / Più impresa.").
 * Splits a heading after its first full stop when there is a second sentence; otherwise one line.
 */
export function splitClaim(heading: string): [string, string?] {
	const match = heading.trim().match(/^(.+?[.!?])\s+(\S.*)$/s);
	return match ? [match[1], match[2]] : [heading.trim()];
}

type TextBlock = { _type?: string; style?: string; listItem?: string; markDefs?: unknown[]; children?: { text?: string; marks?: string[] }[] };

/**
 * A page's opening sentence as the header's lead: when the body starts with a plain
 * paragraph (no link, no list, no heading), it moves up into the title band.
 * Anything richer stays in the body, so no formatting or link is ever lost.
 * A body that is only that sentence moves up whole, so no near-empty body is left behind.
 */
export function splitLead(content: readonly unknown[] | null | undefined): { lead: string | null; rest: unknown[] } {
	const blocks = [...(content ?? [])];
	const first = blocks[0] as TextBlock | undefined;
	const plain =
		first?._type === "block" &&
		(first.style ?? "normal") === "normal" &&
		!first.listItem &&
		(first.markDefs?.length ?? 0) === 0 &&
		(first.children ?? []).every((child) => (child.marks?.length ?? 0) === 0);
	const text = plain ? (first!.children ?? []).map((child) => child.text ?? "").join("").trim() : "";
	return text ? { lead: text, rest: blocks.slice(1) } : { lead: null, rest: blocks };
}

type HeadingBlock = { _type?: string; style?: string; children?: { text?: string }[]; anchor?: string };

/**
 * Gives every h2 of a page body a unique id, for the "In questa pagina" list. The id comes
 * from the heading text, with -2, -3… when two headings (or a section's anchor_id, passed
 * in `reserved`) share it. Returns a copy of the content with each id as the h2's `anchor`.
 */
export function headingAnchors(
	content: readonly unknown[],
	reserved: readonly (string | null | undefined)[] = [],
): { content: unknown[]; headings: { text: string; id: string }[] } {
	const used = new Set(reserved.map((value) => anchorId(value)).filter((id): id is string => Boolean(id)));
	const headings: { text: string; id: string }[] = [];
	const out = content.map((item) => {
		const block = item as HeadingBlock;
		if (block?._type !== "block" || block.style !== "h2") return item;
		const text = (block.children ?? []).map((child) => child.text ?? "").join("");
		const base = anchorId(text);
		if (!base) return item;
		let id = base;
		for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
		used.add(id);
		headings.push({ text, id });
		return { ...block, anchor: id };
	});
	return { content: out, headings };
}
