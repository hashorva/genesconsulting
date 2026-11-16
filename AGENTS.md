# Agent rules — Genes Consulting

Public showcase site: Astro + EmDash (content/copy/blog) + Tailwind v4 + shadcn/ui, on a Cloudflare Worker. Content source: `docs/requirements/initial`. CD details: `docs/cd.md`.

## Git and PR flow
- Never push to `main`. One branch per agent/task (`claude/<topic>`), one PR per task, opened as **draft**, small and focused.
- A PR needs green `cd / ci` and a human review/merge. Agents never merge or tag releases unless the owner asks.
- Never rewrite history on shared branches; never skip tests or disable checks to get green.

## Code vs content
- Code goes through PRs and tags. Content/copy lives in EmDash; do not hardcode page copy in components, and never touch production content from CI or scripts.
- New components/behaviour ship behind a flag in `flags.json` (off in production). See `docs/cd.md` for the EmDash safety rules.
- UI: shadcn/ui components, Tailwind v4, Noto fonts, preset `b2DcSAJ7K` with the Genes Consulting brand colors (from the PDFs/docs), mobile-first, automatic light/dark.
- Runners: GitHub-hosted only (public repo). Never add self-hosted/Mac mini runners.
- Secrets never in the repo; ask the owner to add them in GitHub settings.

## Choose the model by task size
- **Haiku**: tiny edits (a button color, copy typo, class tweak, rename).
- **Sonnet**: normal work (a component, a page, a workflow change, tests).
- **Opus / Fable**: heavy work (architecture, EmDash schema design, SEO/AI-SEO content map, copy improvement, tricky debugging).
- AI review runs on every non-draft PR (Sonnet by default, Opus for risky paths or the `risky` label); address its findings before asking for merge.
- UI strings go through an i18n layer (i18next style), Italian default and only language for now; no hardcoded strings in components.
- Parallel agents only on independent files/areas, each with its own branch and PR.
