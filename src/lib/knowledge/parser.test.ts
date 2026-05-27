import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  seedUser,
} from "@/test/api-test-helpers";

const mocks = vi.hoisted(() => ({
  readPrivateKnowledgeFile: vi.fn(),
}));

vi.mock("./private-storage", () => ({
  readPrivateKnowledgeFile: mocks.readPrivateKnowledgeFile,
}));

let prisma: PrismaClient;
let parseKnowledgeSourceVersion: typeof import("./parser").parseKnowledgeSourceVersion;

beforeAll(async () => {
  process.env.DATABASE_URL = createTestDatabaseUrl("knowledge-parser");
  const helpers = await import("@/test/api-test-helpers");
  helpers.pushTestDatabaseSchema(process.env.DATABASE_URL);
  const prismaModule = await import("@/lib/prisma");
  prisma = prismaModule.prisma;
  const parserModule = await import("./parser");
  parseKnowledgeSourceVersion = parserModule.parseKnowledgeSourceVersion;

  return async () => {
    await disconnectPrisma(prisma);
    helpers.removeTestDatabase(process.env.DATABASE_URL);
  };
});

beforeEach(async () => {
  mocks.readPrivateKnowledgeFile.mockReset();
  await clearDatabase(prisma);
});

describe("parseKnowledgeSourceVersion", () => {
  it("parses a document version into snippets and marks it ready", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const version = await seedKnowledgeVersion(admin.id, "document", "guide.md");
    mocks.readPrivateKnowledgeFile.mockResolvedValue(
      Buffer.from("# Guide\n\nThis is a project knowledge paragraph with enough useful content for a snippet.")
    );

    const result = await parseKnowledgeSourceVersion(version.id);
    const snippets = await prisma.knowledgeSnippet.findMany({ where: { versionId: version.id } });
    const updatedVersion = await prisma.knowledgeSourceVersion.findUniqueOrThrow({ where: { id: version.id } });

    expect(result.snippetCount).toBe(1);
    expect(updatedVersion.status).toBe("ready");
    expect(snippets[0]).toMatchObject({ sourcePath: "guide.md", section: "Guide", chunkIndex: 0 });
  });

  it("parses stored zip entries with inner paths", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const version = await seedKnowledgeVersion(admin.id, "zip", "docs.zip");
    mocks.readPrivateKnowledgeFile.mockResolvedValue(
      createStoredZip([{ name: "docs/a.md", content: "# A\n\nAlpha knowledge content for parsing." }])
    );

    await parseKnowledgeSourceVersion(version.id);
    const snippet = await prisma.knowledgeSnippet.findFirstOrThrow({ where: { versionId: version.id } });

    expect(snippet.sourcePath).toBe("docs/a.md");
    expect(snippet.section).toBe("A");
  });

  it("marks failed parse without snippets", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const version = await seedKnowledgeVersion(admin.id, "document", "bad.txt");
    mocks.readPrivateKnowledgeFile.mockResolvedValue(Buffer.from([1, 0, 2]));

    await expect(parseKnowledgeSourceVersion(version.id)).rejects.toThrow("文档包含二进制内容");
    const updatedVersion = await prisma.knowledgeSourceVersion.findUniqueOrThrow({ where: { id: version.id } });
    const snippetCount = await prisma.knowledgeSnippet.count({ where: { versionId: version.id } });

    expect(updatedVersion.status).toBe("failed");
    expect(snippetCount).toBe(0);
  });
});

async function seedKnowledgeVersion(userId: string, importType: string, filename: string) {
  const source = await prisma.knowledgeSource.create({
    data: {
      title: filename,
      createdById: userId,
      versions: {
        create: {
          originalFilename: filename,
          storageKey: `test/${filename}`,
          mimeType: "text/plain",
          fileSize: 100,
          contentHash: "hash",
          importType,
          createdById: userId,
        },
      },
    },
    include: { versions: true },
  });
  return source.versions[0];
}

function createStoredZip(entries: Array<{ name: string; content: string }>): Buffer {
  return Buffer.concat(entries.map(createStoredLocalFileHeader));
}

function createStoredLocalFileHeader(entry: { name: string; content: string }): Buffer {
  const name = Buffer.from(entry.name);
  const content = Buffer.from(entry.content);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt32LE(0, 10);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(content.length, 18);
  header.writeUInt32LE(content.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name, content]);
}
