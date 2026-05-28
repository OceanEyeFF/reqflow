import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { deflateRawSync } from "node:zlib";
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

  it("parses normal deflated zip entries with inner paths", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const version = await seedKnowledgeVersion(admin.id, "zip", "docs.zip");
    mocks.readPrivateKnowledgeFile.mockResolvedValue(
      createDeflatedZip([{ name: "docs/a.md", content: "# A\n\nAlpha knowledge content for parsing." }])
    );

    await parseKnowledgeSourceVersion(version.id);
    const snippet = await prisma.knowledgeSnippet.findFirstOrThrow({ where: { versionId: version.id } });

    expect(snippet.sourcePath).toBe("docs/a.md");
    expect(snippet.section).toBe("A");
    expect(snippet.content).toContain("Alpha knowledge content");
  });

  it("parses deflated zip entries that use a central directory data descriptor", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const version = await seedKnowledgeVersion(admin.id, "zip", "docs.zip");
    mocks.readPrivateKnowledgeFile.mockResolvedValue(
      createCentralDirectoryZip([{ name: "module-a/api/a.md", content: "# A\n\nAlpha knowledge content for parsing." }])
    );

    await parseKnowledgeSourceVersion(version.id);
    const snippet = await prisma.knowledgeSnippet.findFirstOrThrow({ where: { versionId: version.id } });

    expect(snippet.sourcePath).toBe("module-a/api/a.md");
    expect(snippet.section).toBe("A");
    expect(snippet.content).toContain("Alpha knowledge content");
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
  const knowledgeBase = await prisma.knowledgeBase.upsert({
    where: { slug: "default" },
    update: {},
    create: { id: "default", name: "默认知识库", slug: "default" },
  });
  const source = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: knowledgeBase.id,
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

function createDeflatedZip(entries: Array<{ name: string; content: string }>): Buffer {
  return Buffer.concat(entries.map(createDeflatedLocalFileHeader));
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

function createDeflatedLocalFileHeader(entry: { name: string; content: string }): Buffer {
  const name = Buffer.from(entry.name);
  const content = Buffer.from(entry.content);
  const compressed = deflateRawSync(content);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt32LE(0, 10);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(compressed.length, 18);
  header.writeUInt32LE(content.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name, compressed]);
}

function createCentralDirectoryZip(entries: Array<{ name: string; content: string }>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const content = Buffer.from(entry.content);
    const compressed = deflateRawSync(content);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x08, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt32LE(0, 10);
    localHeader.writeUInt32LE(0, 14);
    localHeader.writeUInt32LE(0, 18);
    localHeader.writeUInt32LE(0, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    const descriptor = Buffer.alloc(16);
    descriptor.writeUInt32LE(0x08074b50, 0);
    descriptor.writeUInt32LE(0, 4);
    descriptor.writeUInt32LE(compressed.length, 8);
    descriptor.writeUInt32LE(content.length, 12);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x08, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt32LE(0, 12);
    centralHeader.writeUInt32LE(0, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt32LE(0, 34);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(localOffset, 42);

    const localPart = Buffer.concat([localHeader, name, compressed, descriptor]);
    localParts.push(localPart);
    centralParts.push(Buffer.concat([centralHeader, name]));
    localOffset += localPart.length;
  }

  const centralDirectoryOffset = localOffset;
  const centralDirectory = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(centralDirectoryOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, eocd]);
}
