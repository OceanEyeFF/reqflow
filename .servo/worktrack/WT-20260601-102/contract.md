# Worktrack Contract: WT-20260601-102

## Metadata

- worktrack_id: WT-20260601-102
- title: BM25/pg_search readiness 再评估与 lexical engine 抽象设计
- milestone_id: MS-12
- node_type: architecture
- status: active
- branch: worktrack/wt-20260601-102-bm25-readiness-design
- baseline_branch: develop
- baseline_ref: 17c5611
- created_by: harness-kernel
- created_at: 2026-06-01

## Task Goal

Re-evaluate the current `pg_search`/BM25 readiness boundary and introduce a small lexical engine abstraction so retrieval evidence can describe the active lexical engine without hard-coding future runtime claims.

## Scope

### In Scope

- Record current `pg_search` readiness, fallback, and target-runtime requirements for MS-12.
- Keep native PostgreSQL FTS fallback as the active runtime engine.
- Centralize lexical engine names/capability metadata used by retrieval evidence and tests.
- Add focused tests that prove no BM25/`pg_search` behavior is claimed unless readiness explicitly supports it.

### Out of Scope

- Installing `pg_search`, changing PostgreSQL images, or enabling BM25 as default runtime.
- Changing ranking/fusion behavior or replacing native FTS SQL.
- Changing vector retrieval, reranker behavior, provider prompts, schema migrations, or UI.

## Carrier Decision

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- decision_inputs: compact architecture/test/docs slice touching shared retrieval types and docs; low parallel value.
- delegation_attempted: no
- fallback_reason: current-carrier selected by dispatch policy for tight consistency across code evidence and docs.

## Acceptance Criteria

1. Retrieval evidence uses a shared lexical engine descriptor for the active native FTS fallback.
2. Tests prove the active engine is not BM25 and that `pg_search` is not considered enabled without explicit readiness.
3. MS-12 readiness/design doc records current pg_search status, fallback, target runtime requirements, and future abstraction path.
4. `npm run lint`, focused retrieval tests, `npm run test`, `npm run build`, search extension readiness as available, and `git diff --check` pass or have explicit environment evidence.

