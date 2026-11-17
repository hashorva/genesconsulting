# Genes Consulting

Public showcase website for Genes Consulting (Astro + EmDash on a Cloudflare Worker). See `AGENTS.md` for contributor/agent rules and `docs/cd.md` for deployment.

## Develop

```bash
bun install
cp .dev.vars.example .dev.vars   # optional locally
bun run dev                      # http://localhost:4321, admin at /_emdash/admin
bun run test && bun run typecheck && bun run build
```

Deployment setup for the owner (Cloudflare token, GitHub secrets, first release): `docs/cloudflare-setup.md`.
