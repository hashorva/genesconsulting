# Genes Consulting logo

The logo is the mark alone. "Genes Consulting" is never part of the artwork: the site sets it as live text beside the mark (header and footer). Regenerate everything with `python3 scripts/logo/build_logo.py` (needs cairosvg and pillow).

There is one version of the logo, transparent, used on light and dark alike (no theme variants).

| File | Use |
| --- | --- |
| `genes-consulting-logo.svg` | The logo (SVG, used on the site and as the favicon) |
| `genes-consulting-logo.png` | 256 px transparent PNG: fallback for browsers without SVG, and the touch icon |
| `genes-consulting-logo.ico` | Favicon for browsers that need ICO (16, 32 and 48 px, transparent) |
| `genes-consulting-touch.png` | 180 px Apple touch icon: the mark on an opaque white tile (iOS fills transparency with black) |
| `genes-consulting-og.png` | 1200x630 link preview image (Open Graph / Twitter card) for WhatsApp, LinkedIn, email and the like |

The preview image and touch icon come from `scripts/og/og-image.html`: rebuild them with `bun scripts/og/build-og-image.ts` (needs Playwright with Chromium). The preview card is the mark, the name, a `yellow-600` rule and the payoff on `sky-950`, with the lucide Waypoints network in `sky-900`; colours and sizes are read from Tailwind's default theme. Everything important stays inside the centre square, because WhatsApp crops thumbnails. `layouts/Base.astro` uses it on every page unless EmDash has an image (the page's SEO panel, or the default SEO image in site settings).

Colors are Tailwind v4 default palette values only: `sky-500` (C arc), `sky-600` (G arc), `yellow-600` (bar and terminal). They keep enough contrast on both white and `sky-950`.

The mark is drawn on a 5x5 grid (1 cell = 100 units), not auto-traced, so the curves are exact: a C arc and a G arc (0.85 cell thick, 0.3 gap), both centred on the bottom-right corner, plus the G's bar and terminal in gold (a quarter disc of radius 2 cells with a 0.85 cell square notch, so the bar line meets the terminal corner on the square's diagonal). The geometry constants are at the top of `scripts/logo/build_logo.py`.

Site wiring: `SiteLogo.astro` renders the mark (SVG with PNG fallback) next to the site title in the header and footer, and `layouts/Base.astro` links the favicon and touch icon to the same files. A logo uploaded in EmDash site settings still replaces the mark in the header.
