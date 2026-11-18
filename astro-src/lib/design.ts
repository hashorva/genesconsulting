import { isEnabled } from "@/flags";

/**
 * The redesign (flag design_refresh) builds on the page composer's sections, so it is on
 * only where page_composer is on too. Release page_composer first.
 */
export function isRefresh(env: object, user?: { role?: number } | null): boolean {
	return isEnabled("page_composer", env, user) && isEnabled("design_refresh", env, user);
}
