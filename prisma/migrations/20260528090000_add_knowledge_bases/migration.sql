CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KnowledgeBase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "KnowledgeBase" ("id", "name", "slug", "description", "enabled", "createdAt", "updatedAt")
VALUES ('default', '默认知识库', 'default', 'MS7 兼容默认知识库', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE "new_KnowledgeSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "knowledgeBaseId" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KnowledgeSource_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeSource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_KnowledgeSource" ("id", "knowledgeBaseId", "title", "status", "enabled", "createdById", "createdAt", "updatedAt")
SELECT "id", 'default', "title", "status", "enabled", "createdById", "createdAt", "updatedAt" FROM "KnowledgeSource";

DROP TABLE "KnowledgeSource";
ALTER TABLE "new_KnowledgeSource" RENAME TO "KnowledgeSource";

CREATE UNIQUE INDEX "KnowledgeBase_slug_key" ON "KnowledgeBase"("slug");
CREATE INDEX "KnowledgeSource_knowledgeBaseId_idx" ON "KnowledgeSource"("knowledgeBaseId");
