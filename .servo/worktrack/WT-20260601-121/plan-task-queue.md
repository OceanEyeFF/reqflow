# Plan Task Queue: WT-20260601-121

## Queue Status

- status: active
- current_next_action: produce BM25/native/hybrid accuracy and performance comparison

## Tasks

1. Create WT-121 control artifacts.
   - status: completed
   - evidence: `.servo/worktrack/WT-20260601-121/contract.md`, `.servo/worktrack/WT-20260601-121/plan-task-queue.md`.
2. Derive comparable metrics from MS-14 result files.
   - status: completed
   - sources: WT-116 corpus, native fixture results, ParadeDB results, VectorChord results.
3. Produce accuracy/performance comparison report.
   - status: completed
   - target: `docs/ms14-bm25-accuracy-performance-comparison.md`.
4. Run validation and record gate evidence.
   - status: completed
   - commands: benchmark gates, retrieval gate, `git diff --check`, policy scan.
