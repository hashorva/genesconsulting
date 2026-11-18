# Genes Consulting logo

The logo is the mark alone. "Genes Consulting" is never part of the artwork: the site sets it as live text beside the mark (header and footer). Regenerate everything with `python3 scripts/logo/build_logo.py` (needs cairosvg and pillow).

| File | Use |
| --- | --- |
| `mark-light.svg` / `mark-dark.svg` | The mark for a light or a dark background (SVG, used on the site) |
| `mark-light.png` / `mark-dark.png` | 256 px PNG fallbacks, transparent (the site serves them through `<picture>` for browsers without SVG) |
| `../favicon.svg` | Favicon: the mark alone, transparent; uses the dark colours when the browser tab is dark |
| `../favicon.ico`, `../apple-touch-icon.png`, `../icon-192.png`, `../icon-512.png` | Transparent raster icons (light colours) |

Colors are Tailwind v4 default palette values only: `sky-400`, `sky-500`, `sky-600`, `sky-900`, `sky-950`, `yellow-600` (gold accent), `slate-300`, `slate-600`, `white`. The light variant uses one step darker blues so the arcs keep contrast on white.

The mark is drawn on a 5x5 grid (1 cell = 100 units), not auto-traced, so the curves are exact: a C arc and a G arc (0.85 cell thick, 0.3 gap), both centred on the bottom-right corner, plus the G's bar and terminal in gold (a quarter disc of radius 2 cells with a 0.85 cell square notch, so the bar line meets the terminal corner on the square's diagonal). The geometry constants are at the top of `scripts/logo/build_logo.py`.

Site wiring: `SiteLogo.astro` renders the mark (SVG with PNG fallback, light/dark swap with `dark:`) next to the site title in the header and footer, and `layouts/Base.astro` links the favicons. A logo uploaded in EmDash site settings still replaces the mark in the header.
