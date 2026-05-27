import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const STORAGE_ROOT = path.join(process.cwd(), ".local-data", "knowledge-uploads");

export async function writePrivateKnowledgeFile(buffer: Buffer, extension: string): Promise<string> {
  await mkdir(STORAGE_ROOT, { recursive: true });
  const storageKey = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
  const filePath = path.join(STORAGE_ROOT, storageKey);
  const resolvedRoot = path.resolve(STORAGE_ROOT);
  const resolvedFile = path.resolve(filePath);
  if (!resolvedFile.startsWith(resolvedRoot + path.sep)) {
    throw new Error("Invalid storage key");
  }
  await mkdir(path.dirname(resolvedFile), { recursive: true });
  await writeFile(resolvedFile, buffer);
  return storageKey.replace(/\\/g, "/");
}
