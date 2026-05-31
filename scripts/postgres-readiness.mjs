import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const databaseUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;
const schemaPath = "prisma/schema.prisma";
const schema = readFileSync(schemaPath, "utf8");
const datasourceBlock = schema.match(/datasource\s+\w+\s+\{(?<body>[\s\S]*?)\}/)?.groups?.body ?? "";
const provider = datasourceBlock.match(/provider\s*=\s*"([^"]+)"/)?.[1];

if (!databaseUrl) {
  console.error("Set POSTGRES_DATABASE_URL or DATABASE_URL before running PostgreSQL readiness checks.");
  process.exit(1);
}

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  console.error("PostgreSQL readiness requires a postgresql:// or postgres:// database URL.");
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: databaseUrl };
const prismaCli = "node_modules/prisma/build/index.js";

if (provider !== "postgresql") {
  console.log(`Current Prisma provider is "${provider}".`);
  console.log("PostgreSQL service URL is configured, but Prisma PostgreSQL validate/migrate gates are deferred to WT-080.");
  console.log("Running Prisma validate with the current provider and SQLite-compatible CI URL instead.");
  run("prisma validate (current provider)", ["validate", "--schema", schemaPath], {
    ...process.env,
    DATABASE_URL: process.env.SQLITE_DATABASE_URL || "file:./ci.db",
  });
  process.exit(0);
}

run("prisma validate", ["validate", "--schema", schemaPath], env);
run("prisma migrate status", ["migrate", "status", "--schema", schemaPath], env);

function run(label, args, commandEnv = env) {
  console.log(`\n> ${label}`);
  execFileSync(process.execPath, [prismaCli, ...args],
  {
    cwd: process.cwd(),
    env: commandEnv,
    stdio: "inherit",
  });
}
