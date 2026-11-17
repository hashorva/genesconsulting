import itBlog from "./locales/it/blog.json";
import itCommon from "./locales/it/common.json";
import itErrors from "./locales/it/errors.json";
import itSeo from "./locales/it/seo.json";
import type { Locale } from "./config";

/** Interface strings, bundled at build time. Page content lives in EmDash, not here. */
export const resources = {
	it: {
		common: itCommon,
		blog: itBlog,
		errors: itErrors,
		seo: itSeo,
	},
} satisfies Record<Locale, Record<string, unknown>>;

export const NAMESPACES = ["common", "blog", "errors", "seo"] as const;
export type Namespace = (typeof NAMESPACES)[number];
