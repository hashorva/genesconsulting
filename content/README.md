# Starter content

Italian copy for the site, written from `docs/requirements/initial` and mapped in `docs/content/content-map.md`. **EmDash is the source of truth once loaded**: edit pages in `/_emdash/admin`, not here. These files only seed pages that do not exist yet.

One file per EmDash page (`pages/<slug>.md`): frontmatter (`slug`, `title`, `seoTitle`, `seoDescription`) and a Markdown body. The title is the page's H1, so bodies start at `##`. Service pages use the slug `servizi-<area>` and are served at `/servizi/<area>/`.

Load by hand (never from CI):

```sh
bun install
bunx emdash login --url https://genesconsulting.purrfect.workers.dev
bun scripts/content-load.ts --url https://genesconsulting.purrfect.workers.dev            # creates missing pages as drafts
bun scripts/content-load.ts --url https://genesconsulting.purrfect.workers.dev --publish  # after approval: publish, tagline, menus
```

Add `--dry-run` to see what would happen. The loader never overwrites live content or deletes an entry.

## Sections (Sezioni)

`pages/<slug>.layout.json` holds a page's sections (card grid, steps, FAQ, CTA, text) as EmDash stores them; in a `text` block, `content` is Markdown. Pages with sections have a shorter Markdown body, since the sections carry the rest. New pages get their sections when created. For pages already live:

```sh
bun scripts/content-load.ts --url https://genesconsulting.purrfect.workers.dev --layout            # adds sections as a DRAFT revision (live page unchanged)
bun scripts/content-load.ts --url https://genesconsulting.purrfect.workers.dev --layout --publish  # after approval
```

`--layout` only touches pages published by the loader and not edited since. `--layout --publish` publishes only drafts still exactly as the loader wrote them (title, body and every section field).

Pages with sections depend on them for most of their copy. Rolling back to a tag before v0.1.0 (when sections were released) would hide it, so restore the pages' previous revisions in the admin first.

## Not written yet (needs the client)

- `/privacy/` and `/cookie/`: no legal text in the source.
- REA number, share capital and PEC for `/note-legali/` (mandatory on Italian company sites).
- LinkedIn URL, opening hours, area served, founding year and team for Chi siamo.
- Blog posts: the starter topics in the content map need facts checked by Genes.
