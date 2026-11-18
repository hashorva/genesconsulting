/** One starter page in content/<locale>/pages/*.md: a small frontmatter block, then Markdown. */
export interface PageFile {
	slug: string;
	title: string;
	seoTitle: string;
	seoDescription: string;
	/** Markdown; the EmDash client converts it to Portable Text. */
	body: string;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const REQUIRED = ["slug", "title", "seoTitle", "seoDescription"] as const;

export function parsePageFile(source: string, name = "page"): PageFile {
	const match = FRONTMATTER.exec(source.replace(/\r\n/g, "\n"));
	if (!match) throw new Error(`${name}: missing frontmatter`);
	const meta: Record<string, string> = {};
	for (const line of match[1].split("\n")) {
		const colon = line.indexOf(":");
		if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
	}
	for (const key of REQUIRED) if (!meta[key]) throw new Error(`${name}: missing "${key}"`);
	return {
		slug: meta.slug,
		title: meta.title,
		seoTitle: meta.seoTitle,
		seoDescription: meta.seoDescription,
		body: match[2].trim(),
	};
}
