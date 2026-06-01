# Plan Task Queue: WT-20260601-126

## Queue Status

- status: active
- current_next_action: synthesize same-corpus comparison artifact

## Tasks

1. Create WT-126 control artifacts.
   - status: completed
   - evidence: `.servo/worktrack/WT-20260601-126/contract.md`, `.servo/worktrack/WT-20260601-126/plan-task-queue.md`.
2. Derive same-corpus lexical metrics and hybrid invariant summary.
   - status: completed
   - target: `scripts/ms15-paradedb-hybrid-comparison.mjs`, `docs/ms15-paradedb-hybrid-comparison-results.json`.
3. Write comparison report.
   - status: completed
   - target: `docs/ms15-paradedb-hybrid-comparison.md`.
4. Run evidence gates.
   - status: completed
   - commands: BM25 baseline gate, BM25 ParadeDB gate, retrieval MS-10 gate.
5. Run regression and policy checks.
   - status: completed
   - commands: `npm run lint`, `npm run test`, `npm run build`, `git diff --check`, targeted policy scan.
6. Record gate evidence.
   - status: completed
   - target: `.servo/worktrack/WT-20260601-126/gate-evidence.md`.
