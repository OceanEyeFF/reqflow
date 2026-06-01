# Plan Task Queue: WT-20260601-108

## Queue Status

- status: active
- current_next_action: validate web Docker image contract

## Tasks

1. Enable Next.js standalone output.
   - status: completed
   - evidence: `next.config.ts`
2. Add web image Dockerfile.
   - status: completed
   - evidence: `Dockerfile`
3. Add Docker build context exclusions.
   - status: completed
   - evidence: `.dockerignore`
4. Document web runtime environment contract.
   - status: completed
   - evidence: `docs/docker-web-runtime-env.md`
5. Run validation gates.
   - status: completed
   - commands: `npx prisma validate --schema prisma/schema.prisma`, `npm run build`, `docker build -t reqflow-web:wt-20260601-108 .`, image content probe, standalone startup probe.
