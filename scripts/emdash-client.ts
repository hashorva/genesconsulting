import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { EmDashClient } from "emdash/client";

/**
 * EmDash API client for the hand-run scripts. Auth: EMDASH_TOKEN, else the
 * credentials saved by `bunx emdash login --url <site>`; localhost uses the dev bypass.
 */
export function createClient(url: string): EmDashClient {
	const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url);
	let token = process.env.EMDASH_TOKEN;
	if (!token && !isLocal) {
		const store = join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "emdash", "auth.json");
		const saved = existsSync(store) ? JSON.parse(readFileSync(store, "utf-8"))[new URL(url).origin] : undefined;
		token = saved?.accessToken;
		if (!token) {
			console.error(`Not logged in. Run: bunx emdash login --url ${url}`);
			process.exit(1);
		}
	}
	return new EmDashClient({ baseUrl: url, token, devBypass: !token && isLocal });
}
