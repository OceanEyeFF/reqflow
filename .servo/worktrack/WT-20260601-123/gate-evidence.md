# Gate Evidence: WT-20260601-123

## Metadata

- worktrack_id: WT-20260601-123
- milestone_id: MS-15
- status: in validation
- updated: 2026-06-01

## Implementation Evidence

- Added `docker-compose.paradedb.yml` as a standalone ParadeDB candidate compose path.
- Added `docs/ms15-paradedb-runtime-design.md` documenting image identity, pinning caveat, operator commands, safety boundaries, and WT-124 handoff.
- Did not modify `docker-compose.runtime.yml`.
- Did not start containers, run migrations, seed, or benchmark.
- Explorer sidecar performed read-only runtime/compose inventory and reported no file changes.

## Image Identity Evidence

- `docker buildx imagetools inspect paradedb/paradedb:latest` observed index digest `sha256:c3efc689b6ebd2fb396d7f50d68735b2dcff3e03f3bf51a926258d942201da2d`.
- linux/amd64 manifest digest: `sha256:dab9ab4a3d7a17c0348d9d5c48231c7a11a91879c4cb45b8de994558dd60f13e`.
- linux/arm64 manifest digest: `sha256:3ac93ed9c455bbab6790e4f12ffaa0805907303c9dc208832609359d53803a51`.
- Candidate compose defaults to the index digest and `PARADEDB_PLATFORM=linux/amd64`, both operator-overridable.

## Validation Evidence

- `docker compose -f docker-compose.paradedb.yml config`: pass.
  - Resolved `postgres` image to `paradedb/paradedb@sha256:c3efc689b6ebd2fb396d7f50d68735b2dcff3e03f3bf51a926258d942201da2d`.
  - Resolved `postgres` host port to `55437`.
  - Resolved `web` host port to `3307`.
  - Resolved candidate volumes to project-scoped `reqflow-paradedb-postgres-data` and `reqflow-paradedb-uploads`.
- `git diff --check`: pass.
- Policy/non-claim scan: pass; matches are explicit no-enable/no-default-runtime-switch/no-destructive-command boundaries.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-123-paradedb-runtime-design`.
- Candidate volumes are separate: `reqflow-paradedb-postgres-data` and `reqflow-paradedb-uploads`.
- MS-13 default volumes are not referenced by the candidate compose.
- Default runtime remains `docker-compose.runtime.yml` with `pgvector/pgvector:0.8.2-pg16`.
- BM25 remains candidate evidence only; WT-123 does not enable ParadeDB as the default runtime.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
