# Plan Task Queue: WT-20260601-115

## Queue Status

- status: active
- current_next_action: document BM25 candidate matrix

## Tasks

1. Create WT-115 control artifacts.
   - status: completed
   - evidence: `.servo/worktrack/WT-20260601-115/contract.md`, `.servo/worktrack/WT-20260601-115/plan-task-queue.md`.
2. Verify candidate plugin and tokenizer facts.
   - status: completed
   - evidence: upstream docs and repositories cited in `docs/ms14-bm25-candidate-matrix.md`.
3. Define evaluation plan and gates.
   - status: completed
   - evidence: `docs/ms14-bm25-candidate-matrix.md`.
4. Run validation and record evidence.
   - status: completed
   - commands: `git diff --check`; policy/stale-claim scans.
