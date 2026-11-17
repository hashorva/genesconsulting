import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * Stable route keys (translationKey in docs/content/content-map.md, section 9)
 * mapped to per-locale paths. Components link by key, never by hardcoded path,
 * so a future /en/ tree only needs new entries here.
 */
export const ROUTES = {
	"page.home": { it: "/" },
	"page.about": { it: "/chi-siamo/" },
	"page.method": { it: "/metodo/" },
	"page.services": { it: "/servizi/" },
	"service.consulting": { it: "/servizi/consulenza-aziendale/" },
	"service.corporate-filings": { it: "/servizi/amministrativi-societari/" },
	"service.digital-documents": { it: "/servizi/digitali-documentali/" },
	"audience.businesses": { it: "/per-le-imprese/" },
	"audience.firms": { it: "/per-gli-studi-professionali/" },
	"page.collaboration": { it: "/collaborazione-professionale/" },
	"page.updates": { it: "/aggiornamenti/" },
	"page.contact": { it: "/contatti/" },
	"legal.privacy": { it: "/privacy/" },
	"legal.cookies": { it: "/cookie/" },
	"legal.notes": { it: "/note-legali/" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof ROUTES;

export function routePath(key: RouteKey, locale: Locale = DEFAULT_LOCALE): string {
	return ROUTES[key][locale];
}

/** Path of one update (blog post). */
export function postPath(slug: string, locale: Locale = DEFAULT_LOCALE): string {
	return `${routePath("page.updates", locale)}${encodeURIComponent(slug)}/`;
}
