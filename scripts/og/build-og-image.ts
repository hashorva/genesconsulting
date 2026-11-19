/**
 * Render the link preview image (Open Graph / Twitter card) and the Apple touch icon.
 *
 * Usage: bun scripts/og/build-og-image.ts
 * Needs: Playwright with Chromium (not a project dependency; any global install works).
 * Output, in public/brand/:
 * - genes-consulting-og.png: 1200x630 preview image, from og-image.html
 * - genes-consulting-touch.png: 180x180 touch icon (the mark on an opaque white tile,
 *   because iOS fills a transparent icon with black)
 *
 * Colors and sizes come from Tailwind's own default theme (tailwindcss/theme.css),
 * turned into plain CSS variables here, so the artwork uses default values only.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// theme.css is an `@theme default { ... }` block that only Tailwind understands:
// keep its variables (everything before the keyframes) as :root custom properties.
const theme = readFileSync(here("../../node_modules/tailwindcss/theme.css"), "utf8");
const vars = theme.slice(theme.indexOf("{") + 1, theme.indexOf("\n  @keyframes"));
const themeCss = `:root {${vars}}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

await page.goto(`file://${here("./og-image.html")}`);
await page.addStyleTag({ content: themeCss });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: here("../../public/brand/genes-consulting-og.png") });

await page.setViewportSize({ width: 180, height: 180 });
await page.evaluate(() => {
	document.querySelectorAll(".net, h1, .rule, p").forEach((el) => el.remove());
	document.body.style.cssText = "width:180px;height:180px;background:var(--color-white);gap:0";
	const mark = document.querySelector<HTMLImageElement>(".mark")!;
	mark.style.cssText = "width:calc(var(--spacing)*30);height:calc(var(--spacing)*30);margin:0";
});
await page.screenshot({ path: here("../../public/brand/genes-consulting-touch.png") });

await browser.close();
