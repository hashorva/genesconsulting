import flags from "../flags.json";

export type FlagName = keyof typeof flags.flags;

interface FlagEntry {
	public: boolean;
	description?: string;
}
// Typed view, so this still compiles when flags.json has no flags.
const registry: Record<string, FlagEntry> = flags.flags;

/** EmDash role levels: Editor is 40, Admin 50. Editors and above see unreleased features. */
const STAFF_MIN_ROLE = 40;

/**
 * Feature flags (see docs/cd.md). There is one environment: production.
 *
 * 1. Worker var FLAG_<NAME>=true|false: overrides for everyone (false is the kill switch).
 * 2. flags.json `public: true`: on for everyone (released).
 * 3. Otherwise on only for a signed-in EmDash editor or admin (`Astro.locals.user`),
 *    so unfinished components can be checked on the live site without visitors seeing them.
 *    EmDash marks responses for signed-in users as uncacheable, so they never leak via cache.
 */
export function isEnabled(
	name: FlagName,
	env: object = {},
	user?: { role?: number } | null,
): boolean {
	return resolveFlag(name, registry[name]?.public ?? false, env, user);
}

/** The resolution rules above, for any flag state (tested without editing flags.json). */
export function resolveFlag(
	name: string,
	isPublic: boolean,
	env: object = {},
	user?: { role?: number } | null,
): boolean {
	// `object` so the typed Worker `env` from "cloudflare:workers" can be passed as is.
	const override = (env as Record<string, unknown>)[`FLAG_${name.toUpperCase()}`];
	if (override === "true" || override === true) return true;
	if (override === "false" || override === false) return false;
	if (isPublic) return true;
	return (user?.role ?? 0) >= STAFF_MIN_ROLE;
}
