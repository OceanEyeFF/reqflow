import { describe, expect, it } from "vitest";
import { deflateRawSync } from "node:zlib";
import { KnowledgeUploadValidationError, validateKnowledgeUpload, validateZipEntries } from "./upload-validation";

describe("validateKnowledgeUpload", () => {
  it("accepts text-like documents", () => {
    const file = new File(["# Hello"], "guide.md", { type: "text/markdown" });

    expect(validateKnowledgeUpload(file, Buffer.from("# Hello"))).toMatchObject({
      kind: "document",
      extension: ".md",
      safeFilename: "guide.md",
    });
  });

  it("rejects unsupported and binary-looking documents", () => {
    expect(() =>
      validateKnowledgeUpload(new File(["bad"], "guide.exe"), Buffer.from("bad"))
    ).toThrow(KnowledgeUploadValidationError);
    expect(() =>
      validateKnowledgeUpload(new File([new Uint8Array([1, 0, 2])], "guide.txt"), Buffer.from([1, 0, 2]))
    ).toThrow(KnowledgeUploadValidationError);
  });
});

describe("validateZipEntries", () => {
  it("accepts safe docs entries", () => {
    expect(validateZipEntries(createStoredZip([{ name: "docs/guide.md", content: "hello" }]))).toBe(1);
  });

  it("accepts normal deflated docs entries", () => {
    expect(validateZipEntries(createDeflatedZip([{ name: "docs/guide.md", content: "hello" }]))).toBe(1);
  });

  it("accepts deflated docs entries that use a central directory data descriptor", () => {
    expect(validateZipEntries(createCentralDirectoryZip([{ name: "docs/guide.md", content: "hello" }]))).toBe(1);
  });

  it("rejects path traversal entries", () => {
    expect(() => validateZipEntries(createStoredZip([{ name: "../secret.md", content: "bad" }]))).toThrow(
      KnowledgeUploadValidationError
    );
  });

  it("rejects nested archives", () => {
    expect(() => validateZipEntries(createStoredZip([{ name: "docs/archive.zip", content: "bad" }]))).toThrow(
      KnowledgeUploadValidationError
    );
  });
});

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

    localParts.push(Buffer.concat([localHeader, name, compressed, descriptor]));
    centralParts.push(Buffer.concat([centralHeader, name]));
    localOffset += localParts.at(-1)?.length ?? 0;
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
