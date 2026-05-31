# AI Knowledge Citation Strategy

## Historical Scope Notice

This document is the MS6 minimal static-corpus citation strategy. It should not be read as the current full knowledge retrieval implementation.

Current citation truth is now produced by PostgreSQL-backed hybrid retrieval, Context Window Builder output, and citation groups with source/path/section/snippet provenance. Use `docs/operator-hybrid-search-ai-draft.md`, `docs/hybrid-search-architecture.md`, and the MS-10/MS-11 validation records for current behavior.

This document defines the MS6 minimal built-in knowledge corpus and citation strategy for the Deepseek-backed AI requirement discussion MVP.

It is a design contract for WT-20260526-033 through WT-20260526-036. It does not implement retrieval, indexing, provider calls, UI, uploads, or schema changes.

## Scope Boundary

MS6 uses a small source-controlled whitelist of repo-stable documents. The goal is not broad knowledge search; the goal is inspectable context that can help Deepseek draft better requirements while preserving manual confirmation and secret boundaries.

MS6 excludes:

- administrator knowledge-base upload;
- docs-style zip import;
- document parsing and chunking pipelines;
- source/version database records;
- embeddings, semantic search, PostgreSQL, pgvector, or vector databases;
- background indexing;
- sending uploaded files, attachment binaries, `.env` values, cookies, or local runtime artifacts to the provider.

Those capabilities remain MS7 or later scope.

## Minimal Corpus

The MS6 corpus should be a static whitelist. The first implementation should not scan arbitrary repo files.

| sourceId | title | path | Primary use | Freshness hint |
|----------|-------|------|-------------|----------------|
| `rf-ai-mvp-boundary` | AI MVP technical boundary | `docs/ai-mvp-technical-brief.md` | Deepseek boundary, manual confirmation, knowledge source boundary, privacy/persistence/testing boundaries | Canonical MS6 provider and scope brief |
| `rf-ai-discussion-flow` | AI requirement discussion product flow | `docs/ai-discussion-product-flow.md` | Discussion state machine, draft schema, ticket-form handoff, failure states | Canonical MS6 product-flow contract |
| `rf-ticket-domain-schema` | Ticket domain schema | `prisma/schema.prisma` | Ticket, member, comment, attachment, notification, and log data boundaries | Use selected model snippets only |
| `rf-ticket-types` | Ticket constants and labels | `src/types/index.ts` | Valid status, priority, type, member role, and log action values | Use enum/label snippets only |
| `rf-ticket-create-api` | Ticket creation API | `src/app/api/tickets/route.ts` | Create payload, validation, defaults, log and notification side effects | Use POST/create sections only |
| `rf-ticket-create-ui` | Ticket creation UI | `src/app/(dashboard)/tickets/new/page.tsx` | Existing form fields, submit path, and draft handoff target | Use form-state and submit snippets only |
| `rf-api-test-boundary` | API route testing guide | `docs/api-route-testing.md` | Test expectations for future AI route work | Use for implementation/testing suggestions |
| `rf-project-baseline` | ReqFlow product baseline | `README.md` | Project positioning, core capabilities, tech stack, and current operational notes | Exclude test account password table |

The implementation may hard-code this whitelist in a small server-side module during WT-033. It should not require a database migration.

## Explicit Exclusions

Do not include these in MS6 provider context:

- `.env` files or environment variable values.
- Cookies, tokens, local logs, local backups, browser/session artifacts, screenshots, generated caches, or runtime database files.
- `.agents/`, `.claude/`, `.harness/`, `.mavis/`, `.local-backup/`, `.worktrees/`, or other untracked governance/tool directories.
- `docs/phase6-8-plan.md`, unless a later documentation sync promotes it as current truth.
- `docs/handoff.md`, `docs/ms5-final-review.md`, and `docs/ms5-rigorous-code-review.md` by default; they are useful for human review but can mix phase history, acceptance records, and stale state into draft generation.
- Test account passwords from `README.md` or `docs/handoff.md`.
- Machine-specific absolute paths from docs.
- Full migration SQL files, full Prisma schema, or seed content unless a later worktrack explicitly needs a tiny model snippet.
- Full ticket history, attachment binaries, or unrelated comments.
- Administrator-uploaded documents or docs zip imports before MS7.

When a whitelisted document contains excluded material, the context assembler must skip the excluded line or section.

## Citation Shape

The internal citation contract should be provider-neutral:

```ts
type KnowledgeCitation = {
  sourceId: string;
  sourceTitle: string;
  path: string;
  section?: string;
  snippet: string;
  freshness: string;
};
```

The draft contract from `docs/ai-discussion-product-flow.md` can expose a smaller UI-facing form:

```ts
type DraftCitation = {
  sourceId: string;
  sourceTitle: string;
  snippet: string;
};
```

The API adapter should keep `path`, `section`, and `freshness` server-side or in a debugging-safe response field only if the UI needs to render source details.

## Snippet Rules

Selection:

- Prefer sections that match the user's requirement vocabulary or the current draft field being generated.
- Always include `rf-ai-mvp-boundary` and `rf-ai-discussion-flow` for AI workflow questions.
- Include `rf-ticket-domain-schema`, `rf-ticket-types`, `rf-ticket-create-api`, or `rf-ticket-create-ui` when mapping a draft into current ticket behavior.
- Include `rf-project-baseline` for product/module context.
- Include `rf-api-test-boundary` only when the draft touches API validation or testing concerns.

Limits:

- Maximum selected sources per request: 5.
- Maximum snippets per source: 2.
- Target snippet length: 240 to 600 characters.
- Maximum total knowledge context: 4,000 characters before provider formatting.
- Preserve short headings with snippets when available.
- Truncate at paragraph or bullet boundaries where possible.

Ordering:

1. User discussion text and answers.
2. Product-flow and AI-boundary snippets.
3. Domain/product snippets.
4. Safety/testing/deployment snippets.

The implementation should not send whole files by default.

## Redaction And Filtering

Before provider calls, the context assembler must remove or replace:

- passwords and test login rows;
- `AUTH_SECRET`, `DATABASE_URL`, `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`, and similar env values;
- Windows or local absolute paths;
- cookie/token/session references;
- raw `.env` examples that include values;
- local backup and runtime artifact paths when they are not needed for the requirement.

If a document line is only useful because it contains a secret or credential example, do not include it.

## Empty-Context Fallback

The draft API must still work when no safe snippet is selected.

Required behavior:

- Return an empty citation list.
- Generate clarification questions or a draft from the user's own discussion text.
- Include a UI-safe message equivalent to: "No project knowledge snippets were used for this draft."
- Do not fabricate citations.
- Do not block the user from continuing to manual confirmation.

The provider prompt should explicitly say that missing citations are acceptable and that the model must not invent source names.

## Provider Prompt Boundary

WT-033 should format knowledge context as labeled source snippets, not as hidden system truth:

```text
Project knowledge snippets:

[rf-ai-mvp-boundary | AI MVP technical boundary | docs/ai-mvp-technical-brief.md#Manual Confirmation Boundary]
AI output is advisory until the user confirms it...
```

The prompt should tell the model:

- use snippets only as supporting context;
- do not reveal secrets or local operational details;
- cite only provided source IDs;
- ask a pending question when a requirement cannot be justified from user input or snippets;
- keep output in the provider-neutral draft schema.

## Downstream Worktrack Notes

### WT-20260526-033

- Implement the whitelist as server-side code or static data.
- Do not scan arbitrary repo paths at runtime.
- Add tests for empty-context fallback, exclusion of test credentials/env names, and no fabricated citations.
- Keep provider calls mocked in CI.

### WT-20260526-034

- Render citation snippets with source title and short snippet.
- Show empty-context fallback when citation list is empty.
- Do not expose server-only env or local path details in the browser.

### WT-20260526-035

- When staging draft text into the ticket form, include citations only after user acceptance.
- Preserve pending questions in the composed description.
- Do not add a citation database field in MS6.

### WT-20260526-036

- Verify no MS6 path uses uploaded administrator documents, zip imports, PostgreSQL, pgvector, embeddings, or vector search.
- Verify generated drafts can be produced with citations and without citations.
- Verify manual confirmation remains required regardless of citation availability.
