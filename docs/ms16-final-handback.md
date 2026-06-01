# MS-16 Final Handback

## Metadata

- milestone: MS-16
- updated: 2026-06-02
- status: accepted
- final_acceptance_owner: fdch0
- final_acceptance: accepted
- final_acceptance_by: fdch0
- final_acceptance_at: 2026-06-02
- accepted_decision: accept-option-3

## Completed Worktracks

| Worktrack | Result |
| --- | --- |
| WT-20260601-128 | Created runtime path cost/benefit model across keep-current, optional-ParadeDB, and ParadeDB-default paths. |
| WT-20260601-129 | Estimated ParadeDB default migration and rollback cost; recommended fresh pre-production volume if selected and rejected direct volume reuse. |
| WT-20260601-130 | Estimated app retrieval integration impact and product benefit; confirmed BM25 product behavior requires later app adapter and retrieval gates. |
| WT-20260601-131 | Synthesized final ADR and fdch0 decision gate. |

## Recommendation

Recommended decision for fdch0: **accept Option 3 as the intended future
direction, but do not switch default runtime inside MS-16.**

Meaning:

- ParadeDB `pg_search` becomes the recommended future default PostgreSQL runtime
  direction.
- Current default remains PostgreSQL/pgvector plus native FTS fallback until a
  later approved implementation milestone completes.
- Any actual runtime switch, data migration, production deployment, or app
  retrieval implementation remains out of MS-16.

## Accepted Decision

fdch0 accepted Option 3 on 2026-06-02. ParadeDB `pg_search` is now the intended
future default PostgreSQL runtime direction for follow-up implementation
planning.

This acceptance does not perform the switch. The current default remains
PostgreSQL/pgvector plus native FTS fallback until a later approved
implementation milestone or worktracks complete the compose/runtime,
schema/index, app retrieval, validation, runbook, and rollback gates.

## Acceptance Basis

- Cost/benefit model exists: `docs/ms16-runtime-path-cost-benefit-model.md`.
- Migration/rollback cost exists: `docs/ms16-paradedb-default-migration-rollback-cost.md`.
- App retrieval impact exists: `docs/ms16-app-retrieval-integration-impact.md`.
- ADR exists: `docs/ms16-runtime-selection-adr.md`.
- Gate evidence exists for all four MS-16 worktracks.

## fdch0 Decision Choices

1. Accept Option 1: keep current default runtime.
2. Accept Option 2: keep ParadeDB optional/candidate only.
3. Accept Option 3: approve ParadeDB as intended future default and require a
   follow-up implementation milestone before switching. Accepted by fdch0 on
   2026-06-02.
4. Request more evidence before deciding.

## Non-Claims

- No default runtime switch was made.
- No application retrieval implementation was made.
- No Docker volume, upload, model cache, or database state was migrated or
  deleted.
- No production deployment choice was made.
- BM25 is still not active in the default runtime or product path.
