/** Resolved media reference from getSiteSettings() */
export interface MediaReference {
	mediaId: string;
	alt?: string;
	url?: string;
}

export interface SiteIdentitySettings {
	title?: string;
	tagline?: string;
	logo?: MediaReference;
	favicon?: MediaReference;
}

/**
 * Site title, tagline and logo come from EmDash site settings (editable in the admin).
 * The fallbacks are i18n strings, used only before setup is complete.
 */
export function resolveSiteIdentity(
	settings: SiteIdentitySettings | undefined,
	fallback: { title: string; tagline: string },
) {
	return {
		siteTitle: settings?.title || fallback.title,
		siteTagline: settings?.tagline || fallback.tagline,
		siteLogo: settings?.logo?.url ? settings.logo : null,
	};
}
