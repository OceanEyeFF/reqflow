# MS-11 Chinese Business E2E Validation

## Metadata

- worktrack_id: WT-20260529-091
- milestone_id: MS-11
- status: validated
- updated: 2026-05-31

## Scenario

中文业务问题：

> 项目经理需要用中文查看审批流程状态，并把结果带入需求工单。

选定知识库范围：

- `kb-approval`

预期端到端路径：

1. 管理员在 `/admin/knowledge` 上传并解析审批流程文档。
2. 管理员使用检索调试面板查询 `项目经理查看审批流程状态`。
3. Debug evidence 展示 lexical hits、vector lane、fusion hits、context window 和 citation groups。
4. 普通用户在 `/tickets/ai-discussion` 选择审批知识库，回答语言选择中文。
5. `POST /api/ai/draft` 生成中文草稿，返回 citation provenance 和 safe search evidence。
6. 用户接受草稿后只写入 `sessionStorage` staging，并跳转 `/tickets/new?from=ai-draft`。
7. 现有工单表单展示预填内容；最终创建仍需用户人工提交。

## Automated Evidence Mapping

| Lane | Evidence | Coverage |
|---|---|---|
| AI draft Chinese request | `src/app/api/ai/draft/route.test.ts` | selected `knowledgeBaseIds`, `answerLanguage: zh`, Chinese requirement, provider receives capped knowledge only |
| Citation provenance | `src/app/api/ai/draft/route.test.ts` | source id/title/path/section/snippet/freshness preserved in result citations |
| Safe search evidence | `src/app/api/ai/draft/route.test.ts` | filters, lexical/fusion/context-window evidence returned without provider secrets |
| Admin debug inspection | `src/app/api/admin/knowledge/search/route.test.ts` | admin-only route, Chinese query, citation groups, lexical/fusion/context evidence |
| Manual confirmation boundary | `src/lib/ai/draft-handoff.test.ts` | accepting a draft stages data only; no ticket API call or direct ticket mutation |
| Retrieval quality guard | `npm run retrieval:evaluate` | validates corpus coverage for lexical fallback, selected scope, semantic, forbidden source, and citation traceability |

## Manual Local Checklist

This checklist is intentionally operator-run because the repo does not currently include a Playwright/browser E2E harness.

1. Start app with local PostgreSQL `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public`.
2. Sign in as an admin user.
3. Open `/admin/knowledge`.
4. Confirm an enabled knowledge base is selected for upload.
5. Upload or reuse a document containing approval-process Chinese text.
6. Run parse for the latest version if needed.
7. Use the debug query `项目经理查看审批流程状态`.
8. Verify debug panel shows:
   - lexical returned count greater than zero when matching text exists;
   - vector lane status displayed as ready or failed with reason;
   - fusion hit list;
   - context included count;
   - citation group path and section.
9. Open `/tickets/ai-discussion`.
10. Select the same knowledge base and set answer language to `中文`.
11. Submit `项目经理需要用中文查看审批流程状态，并把结果带入需求工单。`.
12. Verify generated citations include source title, source id, path, section, snippet, and freshness when present.
13. Verify retrieval evidence panel shows query, scope, lexical/vector/fusion/context metrics.
14. Accept one draft.
15. Verify navigation goes to `/tickets/new?from=ai-draft`.
16. Verify the form is prefilled but no ticket is created until the user submits the form.

## Verdict

- black_box: pass by automated route/handoff coverage plus local operator checklist.
- white_box: pass; selected knowledge-base scope, citation provenance, safe evidence, and manual staging boundary are test-covered.
- anti_cheat: pass; provider receives only knowledge citations and the debug surface does not expose provider secret payloads.
- residual_risk: no browser automation harness exists, so UI click-through remains a manual checklist item.

