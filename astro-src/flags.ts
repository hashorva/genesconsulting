import flags from "../flags.json";

export type FlagName = keyof typeof flags.flags;

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
	env: Record<string, unknown> = {},
	user?: { role?: number } | null,
): boolean {
	const override = env[`FLAG_${name.toUpperCase()}`];
	if (override === "true" || override === true) return true;
	if (override === "false" || override === false) return false;
	if (flags.flags[name].public) return true;
	return (user?.role ?? 0) >= STAFF_MIN_ROLE;
}
