#!/usr/bin/env bash
# Apply pending EmDash core migrations to a remote D1 database, from CI.
#
# Usage: scripts/emdash-migrate.sh <d1-database-name>
# Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment.
#
# Why: the Worker otherwise migrates inside the first request after a deploy.
# On Workers that request can be cut off (CPU/time limits, a cancelled deploy),
# which leaves the migration lock held and every page answering 503
# "Database migrations are required". Running `emdash migrate` from CI right
# after each deploy applies migrations outside a request, and takes over a
# lock that has clearly been abandoned.
#
# Migrations are EmDash's own additive core migrations; this never touches content.
set -euo pipefail

DB="${1:?usage: emdash-migrate.sh <d1-database-name>}"
# A lock older than this cannot belong to a migration that is still running.
STALE_LOCK_SECONDS="${STALE_LOCK_SECONDS:-600}"

migrate() { bunx emdash migrate --from-config --d1 "$DB" "$@"; }

status_json="$(migrate --status --json)"
fingerprint="$(jq -r '.target.fingerprint' <<<"$status_json")"
pending="$(jq -r '.pending | length' <<<"$status_json")"
unknown="$(jq -r '.unknownApplied | length' <<<"$status_json")"
lock_id="$(jq -r '.lock.id // empty' <<<"$status_json")"
lock_since="$(jq -r '.lock.heldSince // empty' <<<"$status_json")"

echo "D1 $DB: $pending pending, $unknown unknown applied, lock ${lock_id:-none} ${lock_since}"

if [[ "$unknown" != "0" ]]; then
	echo "::error::$DB has migrations this build does not know (newer EmDash ran against it). Not touching it."
	exit 1
fi

if [[ -n "$lock_id" ]]; then
	age=$(( $(date -u +%s) - $(date -u -d "$lock_since" +%s) ))
	if (( age < STALE_LOCK_SECONDS )); then
		echo "::error::Migration lock $lock_id on $DB is only ${age}s old; another migration may be running. Re-run this job later."
		exit 1
	fi
	echo "::warning::Taking over abandoned migration lock $lock_id on $DB (held ${age}s)."
	migrate --take-over-lock "$lock_id" --expected-target-fingerprint "$fingerprint"
elif [[ "$pending" != "0" ]]; then
	migrate --expected-target-fingerprint "$fingerprint"
else
	echo "Nothing to migrate."
fi

migrate --check
