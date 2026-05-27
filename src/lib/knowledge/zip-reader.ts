import { inflateRawSync } from "node:zlib";

const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_DIRECTORY_FILE_HEADER = 0x02014b50;
const LOCAL_FILE_HEADER = 0x04034b50;
const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;
const DATA_DESCRIPTOR_FLAG = 0x08;
const UINT32_MAX = 0xffffffff;

export class KnowledgeZipError extends Error {}

export type KnowledgeZipEntry = {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  content: Buffer;
};

export function readZipEntries(buffer: Buffer): KnowledgeZipEntry[] {
  const centralDirectory = readCentralDirectoryEntries(buffer);
  if (centralDirectory.length > 0) {
    return centralDirectory;
  }
  return readLocalHeaderEntries(buffer);
}

function readCentralDirectoryEntries(buffer: Buffer): KnowledgeZipEntry[] {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset === null) return [];

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  if (
    centralDirectoryOffset === UINT32_MAX ||
    centralDirectorySize === UINT32_MAX ||
    centralDirectoryOffset + centralDirectorySize > buffer.length
  ) {
    throw new KnowledgeZipError("zip 文件使用了暂不支持的 ZIP64 结构");
  }

  const entries: KnowledgeZipEntry[] = [];
  let offset = centralDirectoryOffset;
  const directoryEnd = centralDirectoryOffset + centralDirectorySize;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > directoryEnd || buffer.readUInt32LE(offset) !== CENTRAL_DIRECTORY_FILE_HEADER) {
      throw new KnowledgeZipError("zip 文件结构不正确");
    }

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    if (
      compressedSize === UINT32_MAX ||
      uncompressedSize === UINT32_MAX ||
      localHeaderOffset === UINT32_MAX
    ) {
      throw new KnowledgeZipError("zip 文件使用了暂不支持的 ZIP64 结构");
    }

    const nameStart = offset + 46;
    const nameEnd = nameStart + fileNameLength;
    const nextOffset = nameEnd + extraLength + commentLength;
    if (nextOffset > directoryEnd) {
      throw new KnowledgeZipError("zip 文件结构不正确");
    }

    const contentStart = getLocalFileContentStart(buffer, localHeaderOffset);
    const contentEnd = contentStart + compressedSize;
    if (contentEnd > buffer.length) {
      throw new KnowledgeZipError("zip 文件结构不正确");
    }

    const compressed = buffer.subarray(contentStart, contentEnd);
    entries.push({
      name: buffer.toString("utf8", nameStart, nameEnd),
      compressedSize,
      uncompressedSize,
      content: decodeZipContent(compressed, method),
    });
    offset = nextOffset;
  }

  return entries;
}

function readLocalHeaderEntries(buffer: Buffer): KnowledgeZipEntry[] {
  const entries: KnowledgeZipEntry[] = [];
  let offset = 0;

  while (offset + 30 <= buffer.length) {
    if (buffer.readUInt32LE(offset) !== LOCAL_FILE_HEADER) break;

    const flags = buffer.readUInt16LE(offset + 6);
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const uncompressedSize = buffer.readUInt32LE(offset + 22);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    if (nameEnd > buffer.length) {
      throw new KnowledgeZipError("zip 文件结构不正确");
    }
    if ((flags & DATA_DESCRIPTOR_FLAG) !== 0) {
      throw new KnowledgeZipError("zip 文件缺少可读取的中央目录");
    }

    const name = buffer.toString("utf8", nameStart, nameEnd);
    const contentStart = nameEnd + extraLength;
    const contentEnd = contentStart + compressedSize;
    if (contentEnd > buffer.length) {
      throw new KnowledgeZipError("zip 文件结构不正确");
    }

    const compressed = buffer.subarray(contentStart, contentEnd);
    entries.push({
      name,
      compressedSize,
      uncompressedSize,
      content: decodeZipContent(compressed, method),
    });
    offset = contentEnd;
  }

  return entries;
}

function findEndOfCentralDirectory(buffer: Buffer): number | null {
  const minimumEocdSize = 22;
  const maximumCommentSize = 0xffff;
  const minimumOffset = Math.max(0, buffer.length - minimumEocdSize - maximumCommentSize);
  for (let offset = buffer.length - minimumEocdSize; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === END_OF_CENTRAL_DIRECTORY) {
      return offset;
    }
  }
  return null;
}

function getLocalFileContentStart(buffer: Buffer, localHeaderOffset: number): number {
  if (localHeaderOffset + 30 > buffer.length || buffer.readUInt32LE(localHeaderOffset) !== LOCAL_FILE_HEADER) {
    throw new KnowledgeZipError("zip 文件结构不正确");
  }
  const fileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
  const extraLength = buffer.readUInt16LE(localHeaderOffset + 28);
  const contentStart = localHeaderOffset + 30 + fileNameLength + extraLength;
  if (contentStart > buffer.length) {
    throw new KnowledgeZipError("zip 文件结构不正确");
  }
  return contentStart;
}

function decodeZipContent(content: Buffer, method: number): Buffer {
  if (method === METHOD_STORE) return content;
  if (method === METHOD_DEFLATE) {
    try {
      return inflateRawSync(content);
    } catch {
      throw new KnowledgeZipError("zip 文件压缩内容不正确");
    }
  }
  throw new KnowledgeZipError("zip 文件包含不支持的压缩方式");
}
