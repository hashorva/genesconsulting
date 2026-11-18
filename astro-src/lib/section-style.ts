/**
 * Style presets for page sections ("Sezioni"), behind the `page_composer` flag.
 *
 * Editors pick an Italian word from a list in EmDash (select fields in seed/seed.json);
 * each word maps here to default Tailwind classes or a default shadcn variant only.
 * No free values: anything not in a list falls back to the default look.
 * Mapping table for humans: docs/design/brand-colors.md, "Section presets".
 */
import type { VariantProps } from "class-variance-authority";

import type { buttonVariants } from "@/components/ui/button";

/** Option lists, exactly as stored by EmDash (the select value is the word shown). */
export const OPTIONS = {
	background: ["Nessuno", "Tenue", "Blu"],
	spacing: ["Compatta", "Normale", "Ampia"],
	width: ["Normale", "Stretta"],
	align: ["Sinistra", "Centrato"],
	buttonStyle: ["Principale", "Secondario", "Contorno", "Link"],
	columns: ["Automatiche", "2", "3", "4"],
	cardStyle: ["Schede", "Semplice"],
	illustration: ["Rete", "Immagine", "Nessuna"],
	accent: ["Nessuno", "Oro"],
	imageSide: ["Destra", "Sinistra"],
	icon: [
		"Rete",
		"Documento",
		"Edificio",
		"Persone",
		"Scudo",
		"Grafico",
		"Telefono",
		"Posta",
		"Calendario",
		"Bilancia",
		"Valigetta",
		"Spunta",
		"Stretta di mano",
		"Istituzione",
	],
} as const;

type Option<K extends keyof typeof OPTIONS> = (typeof OPTIONS)[K][number];

/** A stored select value, or the fallback when it is empty or not (any more) in the list. */
export function pick<K extends keyof typeof OPTIONS>(key: K, value: unknown, fallback: Option<K>): Option<K> {
	return (OPTIONS[key] as readonly string[]).includes(value as string) ? (value as Option<K>) : fallback;
}

/**
 * Background band of a section. "Blu" scopes the dark theme to the band (`dark` class),
 * so text, cards and buttons inside it switch to their dark tokens and keep their contrast.
 * In dark mode the page is already sky-950, so the band's top/bottom borders mark it.
 */
const BACKGROUND: Record<Option<"background">, string> = {
	Nessuno: "",
	Tenue: "bg-muted dark:bg-sky-900/50",
	Blu: "dark border-y border-border bg-background text-foreground",
};

const SPACING: Record<Option<"spacing">, { plain: string; band: string }> = {
	Compatta: { plain: "py-4 md:py-6", band: "py-8 md:py-10" },
	Normale: { plain: "py-8 md:py-12", band: "py-12 md:py-16" },
	Ampia: { plain: "py-12 md:py-20", band: "py-16 md:py-24" },
};

const WIDTH: Record<Option<"width">, string> = {
	Normale: "",
	Stretta: "mx-auto max-w-3xl",
};

export interface SectionStyleFields {
	background?: string | null;
	spacing?: string | null;
	width?: string | null;
	anchor_id?: string | null;
}

export interface SectionStyle {
	/** Full-width band (background + vertical spacing). */
	band: string;
	/** Inner wrapper inside the page container (width). */
	inner: string;
	/** Safe id for in-page links, or undefined. */
	id?: string;
}

export function sectionStyle(block: SectionStyleFields, defaults: { background?: Option<"background"> } = {}): SectionStyle {
	const background = pick("background", block.background, defaults.background ?? "Nessuno");
	const spacing = SPACING[pick("spacing", block.spacing, "Normale")];
	return {
		band: [BACKGROUND[background], background === "Nessuno" ? spacing.plain : spacing.band].filter(Boolean).join(" "),
		inner: WIDTH[pick("width", block.width, "Normale")],
		id: anchorId(block.anchor_id),
	};
}

/** "Servizi Fiscali" -> "servizi-fiscali". Only a-z, 0-9 and dashes, so it is safe as an id and in "#…" links. */
export function anchorId(value: string | null | undefined): string | undefined {
	if (!value) return undefined;
	const id = value
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 63);
	return id || undefined;
}

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

const BUTTON: Record<Option<"buttonStyle">, ButtonVariant> = {
	Principale: "default",
	Secondario: "secondary",
	Contorno: "outline",
	Link: "link",
};

export function buttonVariant(style: unknown, fallback: Option<"buttonStyle"> = "Principale"): ButtonVariant {
	return BUTTON[pick("buttonStyle", style, fallback)];
}

export function alignClass(align: unknown): string {
	return pick("align", align, "Sinistra") === "Centrato" ? "mx-auto text-center items-center justify-center" : "";
}

/**
 * Card grid columns. "Automatiche" keeps the rule that avoids an orphan card
 * (4 cards = 2x2 or 1x4); a number fixes the columns on wide screens.
 */
export function gridColumns(columns: unknown, count: number): string {
	switch (pick("columns", columns, "Automatiche")) {
		case "2":
			return "@xl:grid-cols-2";
		case "3":
			return "@xl:grid-cols-2 @4xl:grid-cols-3";
		case "4":
			return "@xl:grid-cols-2 @5xl:grid-cols-4";
		default:
			if (count === 4) return "@xl:grid-cols-2 @5xl:grid-cols-4";
			return count <= 2 ? "@xl:grid-cols-2" : "@xl:grid-cols-2 @4xl:grid-cols-3";
	}
}

/** Block types that exist only with the page_composer flag on. */
export const COMPOSER_TYPES: readonly string[] = ["hero", "media_text", "stats"];

/** Fields added by the page_composer schema to the original block types. */
export const COMPOSER_FIELDS: readonly string[] = [
	"background",
	"spacing",
	"width",
	"anchor_id",
	"columns",
	"card_style",
	"buttons",
	"align",
];

/**
 * Sections as visitors see them while page_composer is off: no composer-only blocks,
 * and no composer fields, so every block renders exactly as before the feature.
 */
export function withoutComposer<T extends { _type: string }>(blocks: readonly T[]): T[] {
	return blocks
		.filter((block) => !COMPOSER_TYPES.includes(block._type))
		.map((block) => {
			const copy: Record<string, unknown> = { ...block };
			for (const field of COMPOSER_FIELDS) delete copy[field];
			// Card icons (card_grid.cards[].icon) are composer-only too.
			if (Array.isArray(copy.cards)) {
				copy.cards = copy.cards.map((card: Record<string, unknown>) => {
					const { icon: _icon, ...rest } = card;
					return rest;
				});
			}
			return copy as T;
		});
}

/** The page's opening block: the first section when it is an Apertura, else null. */
export function leadingHero<T extends { _type: string }>(blocks: readonly T[] | null | undefined): T | null {
	const first = blocks?.[0];
	return first && first._type === "hero" ? first : null;
}
