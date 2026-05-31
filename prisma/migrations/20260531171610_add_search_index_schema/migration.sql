-- CreateTable
CREATE TABLE "EmbeddingProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'default',
    "provider" TEXT NOT NULL,
    "baseUrl" TEXT,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "apiKey" TEXT,
    "noKeyMode" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmbeddingProviderConfig_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchIndexProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'default',
    "embeddingProviderConfigId" TEXT,
    "embeddingProvider" TEXT NOT NULL,
    "embeddingModel" TEXT NOT NULL,
    "embeddingDimensions" INTEGER NOT NULL,
    "semanticSpace" TEXT NOT NULL,
    "lexicalEngine" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'building',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SearchIndexProfile_embeddingProviderConfigId_fkey" FOREIGN KEY ("embeddingProviderConfigId") REFERENCES "EmbeddingProviderConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeSnippetSearchMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snippetId" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "section" TEXT,
    "documentTitle" TEXT,
    "lexicalText" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "domainEntities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "processNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "materialTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "approvalActions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "applicabilityRules" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgeSnippetSearchMetadata_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "KnowledgeSnippet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeEmbedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snippetId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "contentHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "vectorRef" TEXT,
    "errorCode" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgeEmbedding_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "KnowledgeSnippet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeEmbedding_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SearchIndexProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmbeddingProviderConfig_name_key" ON "EmbeddingProviderConfig"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIndexProfile_name_key" ON "SearchIndexProfile"("name");

-- CreateIndex
CREATE INDEX "SearchIndexProfile_status_isActive_idx" ON "SearchIndexProfile"("status", "isActive");

-- CreateIndex
CREATE INDEX "SearchIndexProfile_embeddingProvider_embeddingModel_embeddingDimensions_idx" ON "SearchIndexProfile"("embeddingProvider", "embeddingModel", "embeddingDimensions");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSnippetSearchMetadata_snippetId_key" ON "KnowledgeSnippetSearchMetadata"("snippetId");

-- CreateIndex
CREATE INDEX "KnowledgeSnippetSearchMetadata_sourcePath_idx" ON "KnowledgeSnippetSearchMetadata"("sourcePath");

-- CreateIndex
CREATE INDEX "KnowledgeSnippetSearchMetadata_contentHash_idx" ON "KnowledgeSnippetSearchMetadata"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeEmbedding_snippetId_profileId_key" ON "KnowledgeEmbedding"("snippetId", "profileId");

-- CreateIndex
CREATE INDEX "KnowledgeEmbedding_profileId_status_idx" ON "KnowledgeEmbedding"("profileId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeEmbedding_contentHash_idx" ON "KnowledgeEmbedding"("contentHash");
