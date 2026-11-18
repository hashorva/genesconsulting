/**
 * Light/dark theme. Default "system" follows the visitor's OS setting live;
 * "light" or "dark" is an explicit choice stored in localStorage.
 * The same logic runs inline in <head> (Base.astro) to avoid a flash.
 */
export const THEME_STORAGE_KEY = "theme";
export const THEMES = ["light", "system", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(value: unknown): value is Theme {
	return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

export function readTheme(): Theme {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return isTheme(stored) ? stored : "system";
	} catch {
		return "system";
	}
}

export function applyTheme(theme: Theme) {
	const dark =
		theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
	document.documentElement.classList.toggle("dark", dark);
	// Native controls and scrollbars follow the chosen theme, not only the OS.
	document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function saveTheme(theme: Theme) {
	try {
		if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
		else localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		/* storage unavailable: the choice lasts for this page only */
	}
	applyTheme(theme);
}
