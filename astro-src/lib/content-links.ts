import { getEmDashEntry, getMenuWithCacheHint, type CacheHint, type MenuItem } from "emdash";

import type { Locale } from "@/i18n";
import { routePath, type RouteKey } from "@/i18n/routes";
import { pageSlugFromPath } from "@/lib/page-paths";

/**
 * Links are only rendered when the content behind them exists, so a deploy
 * never shows navigation to pages that 404 (docs/cd.md: code must work with
 * whatever content exists).
 */

interface AstroLike {
	cache?: { enabled?: boolean; set: (hint: CacheHint) => void };
}

/** Items of an EmDash menu (edited in the admin). Empty if the menu is missing. */
export async function menuItems(Astro: AstroLike, name: string, locale: Locale): Promise<MenuItem[]> {
	const { data, cacheHint } = await getMenuWithCacheHint(name, { locale });
	if (Astro.cache?.enabled) Astro.cache.set(cacheHint);
	return data?.items ?? [];
}

/** Path of a page route, or null when its EmDash page is not published yet. */
export async function pageLink(Astro: AstroLike, key: RouteKey, locale: Locale): Promise<string | null> {
	const path = routePath(key, locale);
	const slug = pageSlugFromPath(path);
	if (!slug) return null;
	const { entry, cacheHint } = await getEmDashEntry("pages", slug, { locale });
	if (!entry) return null;
	if (Astro.cache?.enabled) Astro.cache.set(cacheHint);
	return path;
}
