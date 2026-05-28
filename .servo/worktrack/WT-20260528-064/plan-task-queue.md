# Plan / Task Queue: WT-20260528-064

## Metadata

- worktrack_id: WT-20260528-064
- status: completed
- updated: 2026-05-28

## Queue

| id | status | task | acceptance_slice |
|----|--------|------|------------------|
| Q1 | done | Add knowledge-base lifecycle helpers and admin PATCH route | Admin can edit name/description/enabled while slug remains immutable and default base is protected |
| Q2 | done | Harden upload and cleanup/delete server-side protections | Disabled bases cannot receive uploads or source cleanup |
| Q3 | done | Update admin knowledge-base UI lifecycle controls | UI exposes edit/disable/restore and blocks disabled-base unsafe actions |
| Q4 | done | Add focused tests | Lifecycle, upload rejection, and cleanup rejection are covered |
| Q5 | done | Run validation and record gate evidence | lint/test/build pass or blockers are recorded |

## Dispatch Package

- selected_next_action: N/A
- node_type: feature
- dispatch_mode: auto
- shared_fact_pack:
  - `.servo/milestone/MS-20260528-003.md#Confirmed Requirement Decisions`
  - `.servo/worktrack/WT-20260528-064/contract.md#Acceptance Criteria`
  - `src/lib/knowledge/bases.ts`
  - `src/app/api/admin/knowledge/bases/route.ts`
- context_budget:
  - must_read: contract, existing knowledge-base lib, admin base route, admin UI, cleanup routes
  - may_read: tests and parser/retrieval code touched by lifecycle behavior
  - do_not_read: unrelated ticket/auth modules except shared test helpers
