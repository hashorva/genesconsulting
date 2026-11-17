import flags from "../flags.json";

type Env = "production" | "preview";
type FlagName = keyof typeof flags.flags;

/**
 * Feature flags (see docs/cd.md). Default per environment from flags.json;
 * a Worker var FLAG_<NAME>=true|false overrides at runtime without a redeploy.
 * ENVIRONMENT is set per environment in wrangler.jsonc.
 */
export function isEnabled(name: FlagName, env: Record<string, unknown> = {}): boolean {
	const override = env[`FLAG_${name.toUpperCase()}`];
	if (override === "true" || override === true) return true;
	if (override === "false" || override === false) return false;
	// Anything other than an explicit "preview" counts as production (flags off), so a
	// missing variable can never switch an unfinished feature on in production.
	const target: Env = env.ENVIRONMENT === "preview" ? "preview" : "production";
	return flags.flags[name][target];
}
