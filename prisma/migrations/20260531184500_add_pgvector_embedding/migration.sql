-- Enable pgvector for profile-scoped snippet embeddings.
CREATE EXTENSION IF NOT EXISTS vector;

-- Add the raw vector payload to the WT-083 KnowledgeEmbedding table.
-- The column is intentionally nullable so pending/failed rows can exist
-- without a vector and existing rows are not rewritten destructively.
ALTER TABLE "KnowledgeEmbedding"
ADD COLUMN "embedding" public.vector;

-- Keep ordinary filtering cheap before the vector operator is applied.
CREATE INDEX "KnowledgeEmbedding_profile_status_dimensions_idx"
ON "KnowledgeEmbedding"("profileId", "status", "dimensions");

-- HNSW indexes require a fixed pgvector dimension. Storage stays
-- dimensionless so SearchIndexProfile can own the semantic-space lock, while
-- partial expression indexes cover the deterministic test profile and common
-- provider dimensions within pgvector's HNSW dimension limit. A new production
-- profile dimension outside this list needs an additional index strategy
-- before relying on approximate search.
CREATE INDEX "KnowledgeEmbedding_embedding_hnsw_3_idx"
ON "KnowledgeEmbedding" USING hnsw ((("embedding")::public.vector(3)) public.vector_l2_ops)
WHERE "embedding" IS NOT NULL AND "status" = 'ready' AND "dimensions" = 3;

CREATE INDEX "KnowledgeEmbedding_embedding_hnsw_768_idx"
ON "KnowledgeEmbedding" USING hnsw ((("embedding")::public.vector(768)) public.vector_l2_ops)
WHERE "embedding" IS NOT NULL AND "status" = 'ready' AND "dimensions" = 768;

CREATE INDEX "KnowledgeEmbedding_embedding_hnsw_1024_idx"
ON "KnowledgeEmbedding" USING hnsw ((("embedding")::public.vector(1024)) public.vector_l2_ops)
WHERE "embedding" IS NOT NULL AND "status" = 'ready' AND "dimensions" = 1024;

CREATE INDEX "KnowledgeEmbedding_embedding_hnsw_1536_idx"
ON "KnowledgeEmbedding" USING hnsw ((("embedding")::public.vector(1536)) public.vector_l2_ops)
WHERE "embedding" IS NOT NULL AND "status" = 'ready' AND "dimensions" = 1536;

-- Rollback notes:
-- DROP INDEX IF EXISTS "KnowledgeEmbedding_embedding_hnsw_1536_idx";
-- DROP INDEX IF EXISTS "KnowledgeEmbedding_embedding_hnsw_1024_idx";
-- DROP INDEX IF EXISTS "KnowledgeEmbedding_embedding_hnsw_768_idx";
-- DROP INDEX IF EXISTS "KnowledgeEmbedding_embedding_hnsw_3_idx";
-- DROP INDEX IF EXISTS "KnowledgeEmbedding_profile_status_dimensions_idx";
-- ALTER TABLE "KnowledgeEmbedding" DROP COLUMN IF EXISTS "embedding";
-- Do not drop the vector extension in a shared database unless no other
-- application table depends on it.
