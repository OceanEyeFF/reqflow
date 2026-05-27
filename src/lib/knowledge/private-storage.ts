import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const STORAGE_ROOT = path.join(process.cwd(), ".local-data", "knowledge-uploads");

export async function writePrivateKnowledgeFile(buffer: Buffer, extension: string): Promise<string> {
  await mkdir(STORAGE_ROOT, { recursive: true });
  const storageKey = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
  const resolvedFile = resolveStorageKey(storageKey);
  await mkdir(path.dirname(resolvedFile), { recursive: true });
  await writeFile(resolvedFile, buffer);
  return storageKey.replace(/\\/g, "/");
}

export async function readPrivateKnowledgeFile(storageKey: string): Promise<Buffer> {
  return readFile(resolveStorageKey(storageKey));
}

export async function deletePrivateKnowledgeFile(storageKey: string): Promise<void> {
  try {
    await unlink(resolveStorageKey(storageKey));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
}

function resolveStorageKey(storageKey: string): string {
  const resolvedRoot = path.resolve(STORAGE_ROOT);
  const resolvedFile = path.resolve(path.join(STORAGE_ROOT, storageKey));
  if (!resolvedFile.startsWith(resolvedRoot + path.sep)) {
    throw new Error("Invalid storage key");
  }
  return resolvedFile;
}
