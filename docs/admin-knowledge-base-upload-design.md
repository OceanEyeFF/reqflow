# Admin Knowledge Base Upload Design

This document is the MS7 product and permission contract for administrator-managed project knowledge-base import. It is a design artifact for `WT-20260527-039`; it does not implement API routes, storage, parsing, retrieval, UI, migrations, or provider configuration.

## Scope

MS7 adds an administrator-maintained knowledge base that can later supply selected, traceable snippets to the existing AI draft flow. The MVP is intentionally narrow:

- Admins can import project knowledge from individual text-like documents or docs-style zip packages.
- Imported content is stored privately, parsed into source/version records and later chunks by downstream worktracks.
- Only enabled, safe snippets can be considered for AI draft context.
- Non-admin users cannot manage uploaded knowledge or inspect raw uploaded content through management endpoints.
- No PostgreSQL, pgvector, embeddings, semantic retrieval, PDF/DOCX/OCR, object storage provider, or cross-project knowledge base is introduced by default.

MS6 remains unchanged: the current AI discussion MVP uses source-controlled snippets in `src/lib/ai/knowledge.ts`. This MS7 contract defines the boundary for replacing or extending that source with persisted administrator-managed knowledge later.

## Current Baseline

The existing app has these relevant facts:

| Area | Current fact | MS7 implication |
|------|--------------|-----------------|
| Roles | `User.role` is a string with `admin`, `manager`, and `user`; `isAdminSession()` checks `session.user.role === "admin"`. | Knowledge-base management must use an explicit admin guard and must not infer admin from ticket membership. |
| Admin UI | There is no dedicated admin route tree. | MS7 UI work must create a clear admin-only surface instead of burying controls in ticket pages. |
| AI draft | `POST /api/ai/draft` is authenticated user-facing behavior and uses `src/lib/ai/*`. | Draft generation may consume enabled knowledge snippets later, but ordinary users must not gain raw knowledge management permissions. |
| MS6 knowledge | `src/lib/ai/knowledge.ts` contains a static whitelist of safe source snippets. | Persisted MS7 knowledge should preserve source IDs, snippets, freshness, and no fabricated citations. |
| Attachments | Ticket attachments use `public/uploads/` and expose `/uploads/<file>`. | Knowledge uploads must not reuse public attachment storage. |
| Database | Prisma currently targets SQLite. | New schema must remain SQLite-compatible unless a later milestone explicitly changes the database path. |

## Actors And Permissions

| Actor | Allowed | Denied |
|-------|---------|--------|
| Admin (`role === "admin"`) | Create imports, upload allowed files, view import status, enable/disable knowledge sources, retry failed imports, delete or supersede sources when implemented, inspect parsed snippets. | Directly expose secrets, bypass file validation, make uploaded raw files public, or force semantic/vector infrastructure into MS7. |
| Manager (`role === "manager"`) | Use AI draft generation as an authenticated user when that feature is available. | Create, update, delete, enable/disable, retry, or inspect administrator knowledge imports. |
| User (`role === "user"`) | Use AI draft generation as an authenticated user when that feature is available. | Any knowledge-base management action or raw uploaded-content access. |
| Unauthenticated | None. | All knowledge-base APIs and UI. |

Required API posture:

- Every knowledge-base management route must require authentication and then require admin role.
- Authorization failure should return `401` for unauthenticated requests and `403` for authenticated non-admin requests.
- Management responses must not include local filesystem paths outside operator-safe identifiers.
- Raw uploaded file download is not part of the MVP. If added later, it must be admin-only and must not use public static paths.

## Upload Inputs

Allowed MVP inputs:

| Input | Extensions | Notes |
|-------|------------|-------|
| Plain text document | `.txt` | UTF-8 text preferred; reject binary-looking content. |
| Markdown document | `.md`, `.markdown` | Preserve headings as source section hints where possible. |
| JSON document | `.json` | Treat as text-like structured content; downstream parser may extract fields conservatively. |
| Docs-style zip package | `.zip` | May contain allowed text-like files inside a docs directory shape. |

Default limits for implementation worktracks:

- Per-file upload limit: 10 MB unless the user approves a different limit.
- Per-zip extracted text budget: implementation should define a bounded limit before parsing.
- Reject empty files.
- Reject unknown extensions, executable/script files, archives nested inside zip packages, and files with mismatched binary content.
- PDF, DOC, DOCX, XLS/XLSX, images, OCR, and media files are out of scope for the MVP even though ticket attachments currently accept some of them.

## Private Storage Boundary

Knowledge uploads must use private server-side storage, not `public/uploads/`.

Implementation worktracks should use an app-private path such as a server-only data directory or a storage adapter abstraction. The selected path must satisfy:

- Not served by Next.js static public file handling.
- Not returned directly to browser clients.
- Uses generated server-side object identifiers rather than trusting user filenames.
- Stores original filename as metadata only.
- Can be cleaned up if database record creation fails.
- Can tolerate failed parse jobs by keeping import status explicit.

Cloud production storage remains a separate decision. This contract allows local private filesystem storage for the MVP, but it does not solve the production persistence decision recorded in `docs/cloud-readiness-boundary.md`.

## Zip Safety Contract

Docs-style zip import must be treated as hostile input:

- Reject absolute paths, drive-letter paths, `..` segments, and symlink-like entries.
- Normalize every entry path before deciding whether it is allowed.
- Reject directories or files that would extract outside the private import workspace.
- Reject nested archives and executable/script extensions.
- Ignore OS metadata files such as `.DS_Store` only if doing so is explicit and tested.
- Enforce file count, total uncompressed byte, and per-entry size limits before extraction.
- Do not run package managers, scripts, markdown plugins, or user-provided code from an upload.

The parser may read allowed files from memory or a private temporary workspace. Any temporary extracted files must be removed after import success or failure.

## Knowledge Lifecycle

Downstream implementation should model knowledge imports as stateful records. The product contract uses this lifecycle:

| State | Meaning | Operator action |
|-------|---------|-----------------|
| `uploaded` | File accepted and private raw object recorded. | Wait for parsing or start parse. |
| `parsing` | Parser is extracting source records and chunks. | Show progress/status; avoid duplicate parser execution. |
| `ready` | Parse completed and snippets are available but not necessarily enabled. | Admin may enable or review. |
| `enabled` | Snippets may be selected for AI draft context. | Admin may disable or supersede. |
| `disabled` | Source is retained but excluded from AI draft context. | Admin may re-enable. |
| `failed` | Upload or parse failed with an operator-safe reason. | Admin may retry or remove failed import. |
| `superseded` | A newer version replaces this source. | Keep traceability; exclude by default. |

Versioning requirements:

- Preserve original filename, normalized source path, uploader admin ID, created/imported time, content hash when feasible, and version number or generation.
- A new import of the same logical source should not silently overwrite the old one; it should create a new version or require an explicit supersede action.
- Disabling a source must not delete existing citations from already generated ticket drafts.
- Deletion, if implemented, must define whether raw file, parsed snippets, and citation history are retained or removed.

Rollback/retry requirements:

- Failed parse should leave a failed import record with no enabled snippets.
- Retry should create clear evidence of the retry attempt or transition the same import through a controlled status path.
- If raw storage succeeds but DB write fails, clean up the raw object or record a recoverable orphan cleanup task.
- If DB write succeeds but raw storage fails, do not mark the import usable.

## Citation And AI Context Contract

AI draft generation may only use enabled, parsed snippets. It must not send raw uploaded files wholesale to the provider.

Required citation fields for downstream work:

- Stable source ID.
- Source title or display name.
- Original path inside an uploaded docs package, when applicable.
- Source version.
- Snippet text.
- Freshness/import timestamp.
- Enabled/disabled state at selection time.

Selection rules:

- Only enabled sources are eligible.
- Snippets must be bounded and selected intentionally; do not concatenate entire uploaded documents into provider context.
- Draft responses must not fabricate citations.
- Empty-context fallback from MS6 remains valid: lack of imported snippets must not block manual requirement drafting.
- Provider prompts must continue to treat knowledge snippets as supporting context, not hidden absolute truth.

## Operator UX Contract

The later admin UI should let admins:

- See a knowledge source list with status, version, uploader, import time, source path/title, and enabled state.
- Upload one allowed document or one docs-style zip package.
- See validation and parse failures in operator-safe language.
- Enable, disable, retry failed imports, and view parsed snippet/source details.
- Distinguish raw upload failure from parse failure.
- Understand that semantic/vector search and PDF/DOCX/OCR are not available in this MVP.

The UI must not show management controls to non-admin users. Server authorization remains mandatory even if UI hides controls.

## API And Schema Handoff

Recommended implementation shape for later worktracks:

- Add a shared admin guard helper rather than duplicating `session.user.role === "admin"` in every route.
- Add Prisma models for provider-independent knowledge source/import/chunk records only when the feature worktrack starts.
- Keep schema SQLite-compatible and avoid enum-only constructs that would complicate the current Prisma/SQLite baseline.
- Keep uploaded raw object metadata separate from parsed snippet records.
- Add route tests for unauthenticated, non-admin, admin success, invalid file type, oversized file, path traversal zip, and failed parse cases.

Suggested model concepts, not final schema:

- `KnowledgeSource`: logical source title, status, enabled flag, current version, uploader/admin relation, timestamps.
- `KnowledgeSourceVersion`: original filename/path, content hash, raw storage key, parse status, error code, imported time.
- `KnowledgeSnippet`: source version relation, section/path, snippet text, order/index, enabled eligibility.

## Downstream Worktrack Handoff

| Worktrack | Handoff |
|-----------|---------|
| WT-20260527-040 | Implement private upload handling and zip safety from this contract. Do not use `public/uploads/`. |
| WT-20260527-041 | Implement parsing, chunking, source/version status records, retry/failure behavior. |
| WT-20260527-042 | Select bounded enabled snippets and preserve citation fields. Do not introduce pgvector/embeddings. |
| WT-20260527-043 | Build admin UI over server-authorized APIs; hide controls from non-admins but rely on API authorization. |
| WT-20260527-044 | Validate admin/non-admin authorization, upload safety, lifecycle, citation traceability, and no public raw content exposure. |

## Explicit Non-Goals

- No implementation in this worktrack.
- No `public/uploads/` storage for knowledge files.
- No broad attachment-file support reuse.
- No PDF/DOCX/OCR/media import.
- No PostgreSQL, pgvector, embeddings, vector database, or semantic search.
- No object storage provider choice.
- No direct AI provider configuration work; that belongs to `WT-20260527-045`.
- No autonomous ticket creation or mutation.
