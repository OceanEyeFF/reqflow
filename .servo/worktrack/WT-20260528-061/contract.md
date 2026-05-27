# Worktrack Contract: WT-20260528-061

## Metadata

- worktrack_id: WT-20260528-061
- title: Prisma worktree 依赖流程文档
- milestone_id: MS-20260527-001
- derived_from_user_feedback: true
- node_type: docs
- status: active
- created_at: 2026-05-28
- updated: 2026-05-28

## Scope

### Goal

Document the development workflow needed to avoid repeated `@prisma/client` and Prisma CLI module resolution failures after worktree-based changes.

### In Scope

- Worktree dependency initialization instructions.
- Prisma client generation reminder.
- Warning against normalizing on junctions to the main checkout `node_modules`.
- Safe cleanup guidance for worktrees that contain dependency links.
- Cross-links from developer-facing docs.

### Out of Scope

- Changing package manager, dependency layout, Prisma schema, migrations, or runtime behavior.
- Deleting existing historical worktree residue.
- Installing dependencies as part of this docs worktrack.

## Acceptance Criteria

1. Docs explain why worktrees need their own dependency setup.
2. Docs include the commands required before Prisma-backed validation.
3. Docs explicitly mention the `Module not found: Can't resolve '@prisma/client'` failure and prevention path.
4. Docs warn against unsafe junction cleanup that can damage the main checkout dependencies.
