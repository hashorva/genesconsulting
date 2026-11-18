# Genes Consulting logo

The logo is the mark alone. "Genes Consulting" is never part of the artwork: the site sets it as live text beside the mark (header and footer). Regenerate everything with `python3 scripts/logo/build_logo.py` (needs cairosvg and pillow).

There is one version of the logo, transparent, used on light and dark alike (no theme variants).

| File | Use |
| --- | --- |
| `logo.svg` | The logo (SVG, used on the site) |
| `logo.png` | 256 px transparent PNG fallback (served through `<picture>` for browsers without SVG) |
| `../favicon.svg`, `../favicon.ico`, `../apple-touch-icon.png`, `../icon-192.png`, `../icon-512.png` | Favicon and app icons: the same logo, transparent |

Colors are Tailwind v4 default palette values only: `sky-500` (C arc), `sky-600` (G arc), `yellow-600` (bar and terminal). They keep enough contrast on both white and `sky-950`.

The mark is drawn on a 5x5 grid (1 cell = 100 units), not auto-traced, so the curves are exact: a C arc and a G arc (0.85 cell thick, 0.3 gap), both centred on the bottom-right corner, plus the G's bar and terminal in gold (a quarter disc of radius 2 cells with a 0.85 cell square notch, so the bar line meets the terminal corner on the square's diagonal). The geometry constants are at the top of `scripts/logo/build_logo.py`.

Site wiring: `SiteLogo.astro` renders the mark (SVG with PNG fallback) next to the site title in the header and footer, and `layouts/Base.astro` links the favicons. A logo uploaded in EmDash site settings still replaces the mark in the header.
