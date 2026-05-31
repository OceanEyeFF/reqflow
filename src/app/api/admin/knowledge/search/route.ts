import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { toDraftCitations, toSafeCitationGroups, toSafeSearchEvidence } from "@/lib/ai/knowledge";
import { buildHybridContextWindow } from "@/lib/knowledge/retrieval";
import { KnowledgeAdminValidationError, parseJsonBody } from "@/lib/knowledge/admin-view";

const MIN_DEBUG_QUERY_LENGTH = 2;
const MAX_DEBUG_QUERY_LENGTH = 500;
const DEBUG_CONTEXT_MAX_CHARS = 1600;
const DEBUG_CONTEXT_ADJACENT_CHUNKS = 1;

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await parseJsonBody(request);
    const input = readDebugSearchInput(body);
    const result = await buildHybridContextWindow(input.query, {
      knowledgeBaseIds: input.knowledgeBaseIds,
      maxContextChars: DEBUG_CONTEXT_MAX_CHARS,
      adjacentChunks: DEBUG_CONTEXT_ADJACENT_CHUNKS,
    });

    return Response.json({
      citations: toDraftCitations(result.citations),
      citationGroups: toSafeCitationGroups(result.citationGroups),
      searchEvidence: toSafeSearchEvidence(result),
    });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof KnowledgeAdminValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Knowledge debug search POST error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

function readDebugSearchInput(body: Record<string, unknown>): {
  query: string;
  knowledgeBaseIds: string[];
} {
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (query.length < MIN_DEBUG_QUERY_LENGTH) {
    throw new KnowledgeAdminValidationError("检索问题太短");
  }
  if (query.length > MAX_DEBUG_QUERY_LENGTH) {
    throw new KnowledgeAdminValidationError("检索问题太长");
  }

  const knowledgeBaseIds = Array.isArray(body.knowledgeBaseIds)
    ? Array.from(
        new Set(
          body.knowledgeBaseIds
            .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
            .map((id) => id.trim())
        )
      ).slice(0, 20)
    : [];

  return { query, knowledgeBaseIds };
}
