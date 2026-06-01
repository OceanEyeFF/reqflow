# Plan Task Queue: WT-20260601-125

## Queue Status

- status: active
- current_next_action: implement candidate-runtime pg_search benchmark script

## Tasks

1. Create WT-125 control artifacts.
   - status: completed
   - evidence: `.servo/worktrack/WT-20260601-125/contract.md`, `.servo/worktrack/WT-20260601-125/plan-task-queue.md`.
2. Review existing MS-14 ParadeDB PoC and BM25 gate reuse boundaries.
   - status: completed
   - evidence: local review plus explorer sidecar.
3. Add candidate-compose pg_search benchmark script and npm entry.
   - status: completed
   - target: candidate DB at `127.0.0.1:55437`, isolated benchmark schema, MS-15 result JSON.
4. Add MS-15 tokenizer/benchmark interpretation doc.
   - status: completed
   - target: `docs/ms15-paradedb-pg-search-tokenizer-benchmark.md`.
5. Run candidate runtime benchmark and BM25 result gate.
   - status: completed
   - commands: candidate compose start if needed, `npm run paradedb:candidate-benchmark`, `npm run bm25:evaluate -- docs/ms14-bm25-benchmark-corpus.json docs/ms15-paradedb-candidate-benchmark-results.json`.
6. Run regression and policy checks.
   - status: completed
   - commands: `npm run lint`, `npm run test`, `npm run build`, `git diff --check`, targeted non-claim/destructive scan.
7. Stop candidate services and record gate evidence.
   - status: completed
   - command: `docker compose -f docker-compose.paradedb.yml stop web postgres`.
