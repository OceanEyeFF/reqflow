import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.SEARCH_EXTENSION_DATABASE_URL || process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Set SEARCH_EXTENSION_DATABASE_URL, POSTGRES_DATABASE_URL, or DATABASE_URL before running search extension readiness.");
  process.exit(1);
}

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  console.error("Search extension readiness requires a PostgreSQL database URL.");
  process.exit(1);
}

const schemaName = `ext_${process.pid}_${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
const schemaUrl = withSchema(databaseUrl, schemaName);
const maintenanceUrl = withSchema(databaseUrl, null);
const maintenance = new PrismaClient({ datasources: { db: { url: maintenanceUrl } } });
const prisma = new PrismaClient({ datasources: { db: { url: schemaUrl } } });

try {
  await runReadiness();
} finally {
  await prisma.$disconnect();
  await maintenance.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  await maintenance.$disconnect();
}

async function runReadiness() {
  const versionRows = await maintenance.$queryRawUnsafe("SHOW server_version");
  console.log(`PostgreSQL server_version: ${versionRows[0]?.server_version ?? "unknown"}`);

  await maintenance.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

  const availableExtensions = await maintenance.$queryRawUnsafe(
    "SELECT name, default_version, installed_version FROM pg_available_extensions WHERE name IN ('vector', 'pg_search') ORDER BY name"
  );
  console.log(`Available search extensions: ${JSON.stringify(availableExtensions)}`);

  await ensureVectorAvailable(availableExtensions);
  await verifyPgvector();
  await verifyNativeFts();
  await verifyPgSearchBoundary(availableExtensions);
}

async function ensureVectorAvailable(availableExtensions) {
  if (!availableExtensions.some((extension) => extension.name === "vector")) {
    throw new Error("pgvector extension is not available in this PostgreSQL image.");
  }
  await maintenance.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector");
}

async function verifyPgvector() {
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
  await prisma.$executeRawUnsafe('CREATE TABLE "VectorProbe" ("id" TEXT PRIMARY KEY, "embedding" public.vector(3) NOT NULL)');
  await prisma.$executeRawUnsafe(
    'INSERT INTO "VectorProbe" ("id", "embedding") VALUES ($1, $2::public.vector), ($3, $4::public.vector)',
    "near",
    "[1,0,0]",
    "far",
    "[0,1,0]"
  );
  const nearest = await prisma.$queryRawUnsafe(
    'SELECT "id" FROM "VectorProbe" ORDER BY "embedding" OPERATOR(public.<->) $1::public.vector LIMIT 1',
    "[0.9,0.1,0]"
  );
  if (nearest[0]?.id !== "near") {
    throw new Error("pgvector distance ordering did not return the expected nearest row.");
  }
  await prisma.$executeRawUnsafe('CREATE INDEX "VectorProbe_embedding_hnsw_idx" ON "VectorProbe" USING hnsw ("embedding" public.vector_l2_ops)');
  console.log("pgvector readiness: pass");
}

async function verifyNativeFts() {
  await prisma.$executeRawUnsafe('CREATE TABLE "FtsProbe" ("id" TEXT PRIMARY KEY, "body" TEXT NOT NULL)');
  await prisma.$executeRawUnsafe(
    'INSERT INTO "FtsProbe" ("id", "body") VALUES ($1, $2), ($3, $4)',
    "hit",
    "采购 审批 流程 材料 上传 purchase approval workflow material upload",
    "miss",
    "账号 登录 页面 样式 account login page style"
  );
  const rows = await prisma.$queryRawUnsafe(
    'SELECT "id" FROM "FtsProbe" WHERE to_tsvector($1::regconfig, "body") @@ websearch_to_tsquery($1::regconfig, $2) ORDER BY "id"',
    "simple",
    "采购 审批"
  );
  if (!rows.some((row) => row.id === "hit")) {
    throw new Error("Native PostgreSQL FTS did not find the expected Chinese-token fallback row.");
  }
  await prisma.$executeRawUnsafe('CREATE INDEX "FtsProbe_body_fts_idx" ON "FtsProbe" USING gin (to_tsvector(\'simple\', "body"))');
  console.log("native PostgreSQL FTS readiness: pass");
}

async function verifyPgSearchBoundary(availableExtensions) {
  const pgSearch = availableExtensions.find((extension) => extension.name === "pg_search");
  if (!pgSearch) {
    console.log("pg_search readiness: unavailable in current image; native PostgreSQL FTS fallback is required.");
    if (process.env.SEARCH_REQUIRE_PG_SEARCH === "true") {
      throw new Error("SEARCH_REQUIRE_PG_SEARCH=true but pg_search is not available.");
    }
    return;
  }

  await maintenance.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS pg_search");
  console.log(`pg_search readiness: available (${pgSearch.default_version})`);
}

function withSchema(rawUrl, schemaName) {
  const url = new URL(rawUrl);
  if (schemaName) {
    url.searchParams.set("schema", schemaName);
  } else {
    url.searchParams.delete("schema");
  }
  return url.toString();
}
