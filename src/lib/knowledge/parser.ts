import { prisma } from "@/lib/prisma";
import { readPrivateKnowledgeFile } from "./private-storage";
import { isImportableZipDocument, validateZipEntries } from "./upload-validation";
import { readZipEntries } from "./zip-reader";

const MAX_CHUNK_LENGTH = 900;
const MIN_CHUNK_LENGTH = 80;

export class KnowledgeParseError extends Error {}

type ParsedDocument = {
  sourcePath: string;
  text: string;
};

export async function parseKnowledgeSourceVersion(versionId: string): Promise<{ snippetCount: number }> {
  const version = await prisma.knowledgeSourceVersion.findUnique({
    where: { id: versionId },
    include: { source: true },
  });
  if (!version) throw new KnowledgeParseError("知识库版本不存在");

  try {
    const buffer = await readPrivateKnowledgeFile(version.storageKey);
    const documents =
      version.importType === "zip"
        ? parseStoredZipDocuments(buffer)
        : [{ sourcePath: version.originalFilename, text: decodeText(buffer) }];
    const snippets = documents.flatMap((document) => chunkDocument(document));
    if (snippets.length === 0) {
      throw new KnowledgeParseError("没有可解析的知识片段");
    }

    await prisma.$transaction([
      prisma.knowledgeSnippet.deleteMany({ where: { versionId } }),
      prisma.knowledgeSnippet.createMany({
        data: snippets.map((snippet) => ({
          sourceId: version.sourceId,
          versionId,
          sourcePath: snippet.sourcePath,
          section: snippet.section,
          content: snippet.content,
          chunkIndex: snippet.chunkIndex,
        })),
      }),
      prisma.knowledgeSourceVersion.update({
        where: { id: versionId },
        data: { status: "ready", errorCode: null },
      }),
      prisma.knowledgeSource.update({
        where: { id: version.sourceId },
        data: { status: "ready" },
      }),
    ]);

    return { snippetCount: snippets.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "parse_failed";
    await prisma.knowledgeSnippet.deleteMany({ where: { versionId } });
    await prisma.knowledgeSourceVersion.update({
      where: { id: versionId },
      data: { status: "failed", errorCode: message.slice(0, 120) },
    });
    await prisma.knowledgeSource.update({
      where: { id: version.sourceId },
      data: { status: "failed" },
    });
    if (error instanceof KnowledgeParseError) throw error;
    throw new KnowledgeParseError(message);
  }
}

export function chunkDocument(document: ParsedDocument): Array<{
  sourcePath: string;
  section: string | null;
  content: string;
  chunkIndex: number;
}> {
  const paragraphs = document.text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && `${current}\n\n${paragraph}`.length > MAX_CHUNK_LENGTH) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }
  if (current) chunks.push(current);

  return chunks
    .flatMap((chunk) => splitLongChunk(chunk))
    .filter((chunk) => chunk.length >= MIN_CHUNK_LENGTH || chunks.length === 1)
    .map((content, index) => ({
      sourcePath: document.sourcePath,
      section: inferSection(content),
      content,
      chunkIndex: index,
    }));
}

function parseStoredZipDocuments(buffer: Buffer): ParsedDocument[] {
  validateZipEntries(buffer);
  return readZipEntries(buffer)
    .filter((entry) => isImportableZipDocument(entry.name))
    .map((entry) => ({ sourcePath: entry.name, text: decodeText(entry.content) }));
}

function decodeText(buffer: Buffer): string {
  if (buffer.includes(0)) throw new KnowledgeParseError("文档包含二进制内容");
  return buffer.toString("utf8").trim();
}

function splitLongChunk(chunk: string): string[] {
  if (chunk.length <= MAX_CHUNK_LENGTH) return [chunk];
  const parts: string[] = [];
  for (let index = 0; index < chunk.length; index += MAX_CHUNK_LENGTH) {
    parts.push(chunk.slice(index, index + MAX_CHUNK_LENGTH).trim());
  }
  return parts.filter(Boolean);
}

function inferSection(content: string): string | null {
  const heading = content.split("\n").find((line) => /^#{1,6}\s+\S/.test(line));
  return heading ? heading.replace(/^#{1,6}\s+/, "").trim().slice(0, 120) : null;
}
