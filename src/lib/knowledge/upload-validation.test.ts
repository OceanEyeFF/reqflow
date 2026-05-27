import { describe, expect, it } from "vitest";
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
