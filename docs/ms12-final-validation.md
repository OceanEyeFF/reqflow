# MS-12 Final Validation

## Status

- milestone_id: MS-12
- title: AI 需求追问质量升级与 Business Interrogation
- status: ready-for-fdch0-acceptance
- date: 2026-06-01
- develop_head: `600dddf`
- worktracks_completed: 8/8

## Completed Worktracks

| worktrack | commit | evidence |
|---|---:|---|
| WT-20260601-101 检索覆盖诊断与追问 evidence 结构 | `486ff25` | `.servo/worktrack/WT-20260601-101/gate-evidence.md` |
| WT-20260601-114 Build gate font network dependency recovery | `2c642c1` | `.servo/worktrack/WT-20260601-114/gate-evidence.md` |
| WT-20260601-102 BM25/pg_search readiness 与 lexical engine 抽象 | `7d9b680` | `.servo/worktrack/WT-20260601-102/gate-evidence.md` |
| WT-20260601-103 Clarify question schema 升级 | `a723c8a` | `.servo/worktrack/WT-20260601-103/gate-evidence.md` |
| WT-20260601-104 Provider prompt 升级为业务审查模式 | `0ee02bb` | `.servo/worktrack/WT-20260601-104/gate-evidence.md` |
| WT-20260601-105 AI 追问前端分组展示与回答交互改造 | `4965a55` | `.servo/worktrack/WT-20260601-105/gate-evidence.md` |
| WT-20260601-106 耗材标准检验出库 golden case 验收 | `023912f` | `.servo/worktrack/WT-20260601-106/gate-evidence.md` |
| WT-20260601-107 本地 embedding sidecar 真实索引链路试接入 | `600dddf` | `.servo/worktrack/WT-20260601-107/gate-evidence.md` |

## Final Gate Evidence

- `npm run lint`: pass.
- `npm run test`: pass, 33 files / 257 tests.
- `npm run build`: pass on Next.js 16.2.6.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run postgres:readiness`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run search:extensions`: pass.
  - PostgreSQL `16.14`.
  - pgvector `0.8.2`: pass.
  - native PostgreSQL FTS: pass.
  - `pg_search`: unavailable in current image; native PostgreSQL FTS fallback remains required.
- `npm run retrieval:evaluate`: pass, 5 cases validated.
- `npm run clarification:golden`: pass, `cn-consumables-standard-inspection-outbound` with 7 questions.
- `node --check scripts/local-embedding-sidecar-probe.mjs`: pass.
- `npm run embedding:probe`: pass against `http://127.0.0.1:8081/embed`, TEI format, 1024 dimensions, 3 iterations.
- `npm run embedding:indexing-trial`: pass with a real local HTTP sidecar endpoint, temporary PostgreSQL schema, 1024-dimensional pgvector persistence, ready vector lane, and fused hit evidence.
- `git diff --check`: pass.

## Acceptance Criteria Mapping

1. Coverage diagnostics, empty-hit behavior, safe evidence serialization, and provider request shape are covered by WT-101, WT-104, and existing AI route/provider tests.
2. Clarify output schema covers `category`, `priority`, `blocksDraft`, `basis`, `relatedText`, and `expectedAnswerFormat` through WT-103 and WT-104.
3. Frontend grouping and answer preservation are covered by WT-105.
4. The consumables outbound-inspection golden gate rejects generic questions and passed with 7 targeted questions in WT-106.
5. Build, lint, tests, PostgreSQL readiness, search extension readiness, and retrieval evaluation passed.
6. Provider secrets, raw API keys, disabled knowledge content, and unauthorized knowledge-base content are not exposed in search evidence or UI.

## Boundaries Preserved

- MS-12 does not enable BM25/pg_search as runtime behavior.
- MS-12 does not make local embedding sidecar the default production path.
- MS-12 does not introduce external hosted search, third-party vector databases, external rerankers, batch production embedding rebuilds, or provider cost-boundary changes.
- AI draft human confirmation boundary remains unchanged.

## Handback

MS-12 is ready for fdch0 final acceptance decision. Harness must not mark the milestone accepted without that decision.
