# Gate Evidence: WT-20260601-111

## Metadata

- worktrack_id: WT-20260601-111
- milestone_id: MS-13
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- `docs/ms13-bm25-runtime-feasibility.md` compares ParadeDB `pg_search`, Timescale/TigerData `pg_textsearch`, and VectorChord-BM25 and recommends keeping the default MS-13 runtime on `pgvector/pgvector:0.8.2-pg16` plus native FTS fallback.
- `scripts/search-extension-readiness.mjs` now detects BM25 candidate availability for `pg_search`, `pg_textsearch`, `vchord_bm25`, and `pg_tokenizer`.
- `SEARCH_REQUIRE_BM25_EXTENSION=true` was added as a strict readiness mode for future target BM25 images.
- `docs/search-extension-readiness.md` documents BM25 candidate detection and strict mode.

## Validation Evidence

- `npm ci`: pass in WT-111 worktree.
- `npx prisma generate --schema prisma/schema.prisma`: pass; needed after worktree-local `npm ci`.
- `npm run search:extensions` against current compose PostgreSQL on `127.0.0.1:55432`: pass. Evidence: PostgreSQL 16.14, `vector` 0.8.2 available, pgvector readiness pass, native PostgreSQL FTS readiness pass, BM25 extension candidates unavailable, `pg_search` unavailable.
- `SEARCH_REQUIRE_BM25_EXTENSION=true npm run search:extensions` against the same runtime: failed as expected with `SEARCH_REQUIRE_BM25_EXTENSION=true but no BM25 extension candidate is available`.
- `npm run build`: pass.
- `git diff --check`: pass.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-111-bm25-runtime-image`.
- Scope boundary: no DB image switch, no BM25 runtime enablement, no production deployment, no volume migration.
- Sources checked with current web evidence because BM25 extension availability and version compatibility are time-sensitive.
- Current runtime remains native PostgreSQL FTS fallback plus pgvector. The worktrack does not claim BM25 is active.
- Compose validation used `docker compose stop postgres`, not volume deletion.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
