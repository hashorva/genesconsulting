/**
 * An editor-supplied URL, or null when it is not safe to put in an href.
 * Allowed: site paths ("/…"), anchors ("#…"), http:, https:, mailto:, tel:.
 * Anything else (javascript:, data:, vbscript:, relative "foo") is rejected,
 * so a link saved in EmDash can never run script on the site's origin.
 */
const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

export function safeHref(url: string | null | undefined): string | null {
	if (!url) return null;
	const trimmed = url.trim();
	// Browsers drop tabs/newlines inside URLs ("java\tscript:"), so refuse any control character.
	if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) return null;
	if (trimmed.startsWith("#")) return trimmed;
	if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) return trimmed;
	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		return null;
	}
	return SAFE_SCHEMES.has(parsed.protocol) ? trimmed : null;
}
