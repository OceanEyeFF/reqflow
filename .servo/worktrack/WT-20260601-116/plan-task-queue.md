# Plan Task Queue: WT-20260601-116

## Queue Status

- status: active
- current_next_action: ready for gate closeout

## Tasks

1. Create WT-116 control artifacts.
   - status: completed
   - evidence: `.servo/worktrack/WT-20260601-116/contract.md`, `.servo/worktrack/WT-20260601-116/plan-task-queue.md`.
2. Define the MS-14 BM25 Chinese corpus and expected judgments.
   - status: completed
   - target: `docs/ms14-bm25-benchmark-corpus.json`.
3. Implement a BM25 benchmark result gate.
   - status: completed
   - target: `scripts/bm25-benchmark-gate.mjs`, `package.json`.
4. Add a baseline result fixture and operator documentation.
   - status: completed
   - target: `docs/ms14-bm25-benchmark-baseline-results.json`, `docs/ms14-bm25-benchmark-harness.md`.
5. Run validation and record evidence.
   - status: completed
   - commands: syntax checks, `npm run bm25:evaluate`, existing retrieval gate, `git diff --check`.
