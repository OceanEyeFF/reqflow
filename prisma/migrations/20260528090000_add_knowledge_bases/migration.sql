CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgeBase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "KnowledgeBase" ("id", "name", "slug", "description", "enabled", "createdAt", "updatedAt")
VALUES ('default', '默认知识库', 'default', 'MS7 兼容默认知识库', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE "KnowledgeSource" ADD COLUMN "knowledgeBaseId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "KnowledgeBase_slug_key" ON "KnowledgeBase"("slug");
CREATE INDEX "KnowledgeSource_knowledgeBaseId_idx" ON "KnowledgeSource"("knowledgeBaseId");
