// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

import { DEFAULT_LOCALE, LOCALES } from "./astro-src/i18n/config.ts";

// Source lives in astro-src/ (not the default src/).
// Do not hardcode `siteUrl` here: it would be baked into preview builds.
// The public URL comes from the EMDASH_SITE_URL Worker variable (see wrangler.jsonc).
export default defineConfig({
	srcDir: "./astro-src",
	output: "server",
	adapter: cloudflare(),
	trailingSlash: "always",
	i18n: {
		defaultLocale: DEFAULT_LOCALE,
		locales: [...LOCALES],
		// Italian is served at / without a prefix; future locales get /en/ etc.
		routing: { prefixDefaultLocale: false },
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			// Binding names must never change: they point at the live content (see docs/cd.md).
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
	devToolbar: { enabled: false },
});
