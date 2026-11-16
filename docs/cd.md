# Continuous deployment

Built on [hashorva/cd-kit](https://github.com/hashorva/cd-kit) (pinned `@v0`). GitHub-hosted runners only, because this repo is public.

## Flow

| Event | What runs |
| --- | --- |
| Pull request | CI. If `CD_DEPLOY_ENABLED=true` and the PR is from this repo: a **preview** (new Worker version uploaded, not live). |
| Merge to `main` | CI only. Nothing deploys. |
| Tag `vX.Y.Z` | CI, then **production deploy** of the Worker (the client's preview site). |

Release: create a tag/GitHub release `vX.Y.Z` on `main` (semver: patch = fixes, minor = new components/flags, major = breaking). Rollback: re-run the deploy for an older tag.

## EmDash content safety (hard rules)

- A deploy uploads **code only**. Content lives in EmDash's own storage (D1/R2 bindings on Cloudflare) and is edited and published only inside EmDash.
- Never delete/recreate/rename D1, R2, KV bindings in wrangler config, and never use destructive migrations, seeding that overwrites content, or `--delete`-style syncs in CI.
- Schema changes to EmDash collections are additive and called out in the PR; reset/seed scripts must never run against production.
- Content releases (EmDash) and code releases (tags) are independent: a code release must work with whatever content exists, and flagged-off features must not require new content.

## Feature flags

`flags.json` holds per-environment defaults; a Worker var `FLAG_<NAME>=true|false` overrides without a redeploy. New components ship behind a flag (off in production), are enabled in preview, then switched on, and the flag is removed once stable.

## AI review (advisory, not a required check)

`ai-review.yml` (adapted from finduck) reviews non-draft, non-docs-only PRs with the Claude Code Action. **Sonnet** for ordinary PRs; **Opus** when the PR is labelled `risky`, changes more than 400 lines, or touches workflows, wrangler config, package files, `flags.json`, migrations, or auth/session/middleware code (edit `RISKY_PATHS` in the workflow). It skips without the `CLAUDE_CODE_OAUTH_TOKEN` secret and on forks, and never blocks a merge.

## i18n

Italian only for now (no language switcher), but built i18next-style: no hardcoded UI strings, locale-keyed resources, Italian as default locale at `/`. Languages can be added later without restructuring. Page content stays in EmDash.

## One-time setup (owner)

1. Add secrets `CLOUDFLARE_API_TOKEN` (Workers edit permission) and `CLOUDFLARE_ACCOUNT_ID`, on environments `production` and `preview` (Settings → Environments).
2. Add secret `CLAUDE_CODE_OAUTH_TOKEN` (repository level) to enable AI review.
3. Protect `production` (required reviewer: owner).
4. Branch protection on `main`: require PR and the `cd / ci` check.
5. After the Astro app and `wrangler.jsonc` exist: set repo variable `CD_DEPLOY_ENABLED=true`.
