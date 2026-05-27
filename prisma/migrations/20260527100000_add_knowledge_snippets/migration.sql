-- CreateTable
CREATE TABLE "KnowledgeSnippet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "section" TEXT,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeSnippet_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeSnippet_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "KnowledgeSourceVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSnippet_versionId_sourcePath_chunkIndex_key" ON "KnowledgeSnippet"("versionId", "sourcePath", "chunkIndex");
