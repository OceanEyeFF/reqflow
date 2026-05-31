# Operator Hybrid Search And AI Draft Runbook

## Current State

This is the current operator-facing baseline after MS-9, MS-10, and the completed MS-11 worktracks WT-089 through WT-092.

ReqFlow now uses PostgreSQL as the Prisma datasource provider. Knowledge retrieval is PostgreSQL-backed and uses structured metadata, PostgreSQL native FTS fallback, pgvector embeddings, RRF-style rank fusion, a bounded Context Window Builder, and citation groups. AI draft generation consumes only the bounded context produced by that path.

`pg_search` / BM25 is not enabled in the current local Docker image. Native PostgreSQL FTS fallback is the required lexical path until a target environment proves `pg_search` readiness.

## Operator Surfaces

| Surface | Path | Current purpose |
|---------|------|-----------------|
| Admin knowledge management | `/admin/knowledge` | Create/edit/disable knowledge bases, upload files or zip archives, parse versions, enable/disable sources and snippets, delete sources, clear selected knowledge, and inspect retrieval debug evidence. |
| AI requirement discussion | `/tickets/ai-discussion` | Select knowledge bases, choose language behavior, answer clarification questions, generate up to the configured draft count, inspect citations and search evidence, and stage one accepted draft for the ticket form. |
| Ticket creation | `/tickets/new?from=ai-draft` | Final human review and save. AI output never creates or mutates tickets directly. |

## Knowledge And Retrieval Flow

1. An admin uploads documents or zip archives under a knowledge base.
2. The parser records source versions and snippets with path, section, content, chunk index, enabled status, and source/version provenance.
3. Search metadata stores lexical text and structured fields such as domain entities, process names, material types, approval actions, applicability rules, source path, section, and document title.
4. Embeddings are generated under the active `SearchIndexProfile`. Vectors are only comparable inside the same provider/model/dimensions/semantic-space profile.
5. Query understanding creates lexical and embedding query forms.
6. Lexical retrieval runs PostgreSQL native FTS fallback in the database and preserves matched-term evidence.
7. Vector retrieval uses pgvector when an active ready profile exists; otherwise it degrades with explicit evidence such as `active-profile-missing`.
8. RRF-style fusion combines ranked lexical and vector lanes without adding raw scores directly.
9. Context Window Builder rechecks enabled/archive/source/snippet filters, merges adjacent chunks only when provenance stays clear, caps provider context, and emits citation groups for included spans only.

## AI Draft Boundary

- `POST /api/ai/draft` is authenticated and server-side.
- The provider receives only `knowledge` text assembled by the Context Window Builder.
- `searchEvidence` is returned to the UI after generation; it is not sent to the provider.
- Citations include source id/title, path, section, snippet, and freshness when available.
- Provider output is advisory. Accepting a draft stores browser-side staged form data and navigates to the existing ticket form.
- The existing `/api/tickets` submit path is still the only way to create a ticket.

## Debug Evidence

Admin retrieval debug evidence is for inspection only. It must not change AI results.

Expected evidence includes:

- selected knowledge-base filters;
- lexical lane status, ranks, matched terms, and fallback status;
- vector lane status, distance/rank evidence, or explicit degradation reason;
- fused rank and contribution evidence;
- context-window included snippets and cap behavior;
- citation groups with source/path/section/snippet counts.

Evidence must not expose provider API keys, raw secrets, disabled knowledge content, or unauthorized knowledge bases.

## Local Validation Commands

Use the local PostgreSQL service unless another PostgreSQL URL is explicitly approved:

```bash
docker compose -f docker-compose.postgres.yml up -d postgres
npm run postgres:wait
$env:DATABASE_URL="postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public"
npx prisma migrate deploy --schema prisma/schema.prisma
npm run postgres:readiness
npm run search:extensions
npm run retrieval:evaluate
npm run test
npm run lint
npm run build
```

Worktrees may need `npm install` before Prisma CLI commands if `node_modules/prisma/build/index.js` is missing. Do not commit dependency artifacts.

## Manual Acceptance Checklist

| Step | Expected result |
|------|-----------------|
| Login as `admin` and open `/admin/knowledge` | Knowledge-base management and retrieval debug surfaces are visible. |
| Upload and parse a Chinese business document or zip | Source version and snippets are created with path/section provenance. |
| Enable the relevant source/snippets | Disabled or archived knowledge is not offered to AI draft users. |
| Run an admin debug search with a Chinese business query | Lexical/vector/fusion/context evidence and citation groups are visible. |
| Open `/tickets/ai-discussion` and select the relevant knowledge base | The request is scoped to selected knowledge bases. |
| Generate a Chinese draft | Draft includes citations tied to actual retrieved snippets. |
| Inspect search evidence on the AI discussion page | Evidence matches the selected scope and does not expose secrets. |
| Accept one draft | Browser stages the draft and opens the existing new-ticket form. |
| Submit the ticket form manually | Ticket creation follows the existing `/api/tickets` path and normal audit behavior. |

## Current Follow-Up Boundary

Local CPU embedding sidecar implementation is planned as WT-20260531-100. The feasibility verdict is documented in `docs/local-embedding-docker-feasibility.md`: feasible as a separate CPU sidecar, not recommended as model weights bundled into the main Next.js image by default.
