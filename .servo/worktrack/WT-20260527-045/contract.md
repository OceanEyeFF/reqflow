# Worktrack Contract: WT-20260527-045

## Metadata

- worktrack_id: WT-20260527-045
- title: 管理员 AI Provider 配置
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: feature
- status: planned
- created_at: 2026-05-27
- updated: 2026-05-27

## Intake Summary

- original_request: 增加一个 worktrack：让管理员可以配置后端的 OpenAI 格式的 API 端点、API key，并支持 localhost 部署的 LMStudio 或 Ollama 这种不用 API key 的情形。
- append_mode: append-feature
- append_classification: new worktrack
- classification_confidence: high
- recommended_milestone: MS-20260527-001
- suggested_node_type: feature
- approval_required: false; programmer explicitly requested adding this worktrack.

## Baseline

- baseline_branch: develop
- baseline_ref: TBD at initialization
- work_branch: worktrack/wt-20260527-045-ai-provider-admin-config
- worktree_path: .worktrees/wt-20260527-045-ai-provider-admin-config

## Scope

### Goal

Allow administrators to manage the backend AI provider configuration used by AI draft generation, while preserving server-side secret boundaries and supporting OpenAI-compatible local providers without API keys.

### In Scope

- Admin-only AI Provider configuration model/API/UI.
- OpenAI-compatible API base URL/endpoint configuration.
- Model name configuration.
- API key configuration with masked readback and server-side-only usage.
- Explicit no-key/local mode for localhost LMStudio/Ollama-compatible deployments.
- Enable/disable provider state and active-provider selection.
- Test-connection action that runs only server-side and does not leak secrets.
- Integration path for the existing AI draft provider adapter to use the configured endpoint/model/key strategy.
- Validation for unsafe or ambiguous endpoint/key combinations.

### Out of Scope

- Client-side direct AI provider calls.
- Returning plaintext API keys through API responses.
- Production secret-manager integration unless separately approved.
- Multi-tenant/provider billing, token ledger, cost dashboard, or audit trail beyond minimal operator-facing status.
- PostgreSQL/pgvector, vector search, embeddings, or semantic retrieval.
- Knowledge upload/import implementation except for interface compatibility with MS7 knowledge worktracks.

## Acceptance Criteria

- Admin can create/update/view masked AI Provider settings.
- Non-admin users cannot view or mutate AI Provider settings.
- API key can be required for cloud endpoints but optional for explicit localhost/no-key mode.
- LMStudio/Ollama localhost endpoints can be configured without API key.
- Server-side AI draft generation uses configured OpenAI-compatible endpoint/model/key mode.
- API responses never return plaintext API keys.
- Invalid configurations produce operator-safe errors.
- `npm run lint`, `npm run test`, and `npm run build` pass.

## Verification Requirements

- Admin/non-admin route tests.
- Secret masking tests.
- No-key localhost configuration tests.
- Provider adapter tests for OpenAI-compatible endpoint/model/key behavior.
- Targeted search for client-side key exposure and `NEXT_PUBLIC` misuse.
- `npm run lint`
- `npm run test`
- `npm run build`

## Notes

- This worktrack is planned under MS7 and should not start until MS6 is accepted or the programmer explicitly unlocks MS7 execution.
