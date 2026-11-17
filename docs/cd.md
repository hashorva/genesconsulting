# Continuous deployment

Built on [hashorva/cd-kit](https://github.com/hashorva/cd-kit) (pinned `@v0`). GitHub-hosted runners only, because this repo is public.

## Flow

| Event | What runs |
| --- | --- |
| Pull request | CI. If `CD_DEPLOY_ENABLED=true` and the PR is from this repo: a **preview** deploy to a separate preview Worker with its own D1/R2/KV (own data) and preview flags **on**. |
| Merge to `main` | CI, then **automatic production deploy**. No manual approval. New features ship hidden (flag off in production). |
| Release (tag `vX.Y.Z`) | Marks the release; pushing an older tag re-deploys it (**rollback**). |

### Ship hidden, then release
1. A feature PR adds code behind a flag in `flags.json` (`production: false`, `preview: true`). Reviewers see it on the PR preview.
2. Merge: it goes live in production but visitors cannot see it. Test it there with the flag override (below).
3. **Release** = a small PR that sets `production: true` for that flag; merging deploys it and a `vX.Y.Z` tag is cut on that commit. Everyone sees it.
4. Later, delete the flag from code and `flags.json`.

Semver: patch = fixes, minor = newly released features, major = breaking.

Previews have their own D1/R2/KV (`env.preview` in `wrangler.jsonc`), so PR code never runs migrations against, or edits, production content. Preview data is throwaway test content; real content is edited only on production's admin.

## EmDash content safety (hard rules)

- A deploy uploads **code only**. Content lives in EmDash's own storage (D1/R2 bindings on Cloudflare) and is edited and published only inside EmDash.
- Never delete/recreate/rename D1, R2, KV bindings in wrangler config, and never use destructive migrations, seeding that overwrites content, or `--delete`-style syncs in CI.
- Schema changes to EmDash collections are additive and called out in the PR; reset/seed scripts must never run against production.
- Content releases (EmDash) and code releases (tags) are independent: a code release must work with whatever content exists, and flagged-off features must not require new content.

## Feature flags

`flags.json` holds per-environment defaults (`production`, `preview`); git history is the audit trail. Resolution order at runtime: Worker var `FLAG_<NAME>=true|false` (override) > `flags.json` default for the current environment (`ENVIRONMENT` var, `preview` or `production`).

How to toggle:
- **Release for everyone:** PR changing `production` to `true` in `flags.json`, merge (auto-deploys).
- **Instant kill switch / staged test:** set the `FLAG_<NAME>` var in the Cloudflare dashboard (Workers → genesconsulting → Settings → Variables) with no redeploy. `wrangler.jsonc` must set `keep_vars: true` so deploys never wipe dashboard overrides. Fold the final value back into `flags.json` afterwards.
- Flags only gate code. They never create, change or delete EmDash content; a flagged-off feature must not require content that does not exist yet.

## AI review (advisory, not a required check)

`ai-review.yml` (adapted from finduck) reviews non-draft, non-docs-only PRs with the Claude Code Action. **Sonnet** for ordinary PRs; **Opus** when the PR is labelled `risky`, changes more than 400 lines, or touches workflows, wrangler config, package files, `flags.json`, migrations, or auth/session/middleware code (edit `RISKY_PATHS` in the workflow). It skips without the `CLAUDE_CODE_OAUTH_TOKEN` secret and on forks, and never blocks a merge.

## i18n

Italian only for now (no language switcher), but built i18next-style: no hardcoded UI strings, locale-keyed resources, Italian as default locale at `/`. Languages can be added later without restructuring. Page content stays in EmDash.

## One-time setup (owner)

Step by step, with exact token permissions: [`docs/cloudflare-setup.md`](cloudflare-setup.md). In short: API token + account ID as secrets on the `production` and `preview` environments (no required reviewers), `main` protected with the `gate` check, repository variable `CD_DEPLOY_ENABLED=true`, then finish the EmDash admin setup right after the first deploy and set `EMDASH_ENCRYPTION_KEY` as a Worker secret. AI review needs the repository secret `CLAUDE_CODE_OAUTH_TOKEN`.

`wrangler.jsonc` already has `env.preview` with its own D1/R2/KV, `ENVIRONMENT` set per environment, and `keep_vars: true`.
