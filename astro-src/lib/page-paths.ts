/**
 * Service pages are served at /servizi/<name>/ but stored as EmDash pages with
 * the slug "servizi-<name>", because page slugs are a single URL segment.
 */
export const SERVICE_PREFIX = "servizi-";

/** "/servizi/consulenza-aziendale/" for the page slug "servizi-consulenza-aziendale". */
export function servicePathFromSlug(slug: string): string {
	return `/servizi/${encodeURIComponent(slug.slice(SERVICE_PREFIX.length))}/`;
}

/** EmDash page slug behind a site path: "/contatti/" -> "contatti", "/servizi/x/" -> "servizi-x". */
export function pageSlugFromPath(path: string): string | null {
	const segments = path.split("/").filter(Boolean);
	if (segments.length === 1) return segments[0];
	if (segments.length === 2 && segments[0] === "servizi") return `${SERVICE_PREFIX}${segments[1]}`;
	return null;
}
