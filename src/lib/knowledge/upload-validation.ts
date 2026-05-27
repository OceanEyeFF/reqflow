import path from "node:path";

const ALLOWED_DOCUMENT_EXTENSIONS = new Set([".md", ".markdown", ".txt", ".json"]);
const ZIP_EXTENSION = ".zip";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 200;
const MAX_ZIP_UNCOMPRESSED_SIZE = 20 * 1024 * 1024;
const LOCAL_FILE_HEADER = 0x04034b50;

export class KnowledgeUploadValidationError extends Error {}

export type KnowledgeUploadKind = "document" | "zip";

export type ValidatedKnowledgeUpload = {
  kind: KnowledgeUploadKind;
  extension: string;
  safeFilename: string;
  zipEntryCount?: number;
};

export function validateKnowledgeUpload(file: File, buffer: Buffer): ValidatedKnowledgeUpload {
  const safeFilename = path.basename(file.name).replace(/[^\w.\- ]+/g, "_");
  const extension = path.extname(safeFilename).toLowerCase();

  if (!safeFilename || safeFilename === "." || safeFilename === "..") {
    throw new KnowledgeUploadValidationError("文件名不正确");
  }
  if (buffer.length === 0 || file.size === 0) {
    throw new KnowledgeUploadValidationError("文件不能为空");
  }
  if (buffer.length > MAX_FILE_SIZE || file.size > MAX_FILE_SIZE) {
    throw new KnowledgeUploadValidationError("文件大小超过10MB限制");
  }
  if (extension === ZIP_EXTENSION) {
    return { kind: "zip", extension, safeFilename, zipEntryCount: validateZipEntries(buffer) };
  }
  if (!ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
    throw new KnowledgeUploadValidationError("不支持的知识库文件类型");
  }
  if (looksBinary(buffer)) {
    throw new KnowledgeUploadValidationError("知识库文档必须是文本内容");
  }
  return { kind: "document", extension, safeFilename };
}

export function validateZipEntries(buffer: Buffer): number {
  let offset = 0;
  let entryCount = 0;
  let totalUncompressedSize = 0;

  while (offset + 30 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature !== LOCAL_FILE_HEADER) break;

    const compressedSize = buffer.readUInt32LE(offset + 18);
    const uncompressedSize = buffer.readUInt32LE(offset + 22);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    if (nameEnd > buffer.length) {
      throw new KnowledgeUploadValidationError("zip 文件结构不正确");
    }

    const entryName = buffer.toString("utf8", nameStart, nameEnd);
    validateZipEntryName(entryName);
    if (!entryName.endsWith("/")) {
      entryCount += 1;
      totalUncompressedSize += uncompressedSize;
      if (entryCount > MAX_ZIP_ENTRIES) {
        throw new KnowledgeUploadValidationError("zip 文件条目过多");
      }
      if (totalUncompressedSize > MAX_ZIP_UNCOMPRESSED_SIZE) {
        throw new KnowledgeUploadValidationError("zip 解压内容超过限制");
      }
    }

    offset = nameEnd + extraLength + compressedSize;
  }

  if (entryCount === 0) {
    throw new KnowledgeUploadValidationError("zip 文件没有可导入的文档");
  }

  return entryCount;
}

function validateZipEntryName(entryName: string): void {
  const normalized = entryName.replace(/\\/g, "/");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:\//.test(normalized) ||
    normalized.split("/").includes("..")
  ) {
    throw new KnowledgeUploadValidationError("zip 文件包含不安全路径");
  }
  if (normalized.endsWith("/")) return;
  const extension = path.extname(normalized).toLowerCase();
  if (extension === ZIP_EXTENSION || !ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
    throw new KnowledgeUploadValidationError("zip 文件包含不支持的条目类型");
  }
}

function looksBinary(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 1024));
  return sample.includes(0);
}
