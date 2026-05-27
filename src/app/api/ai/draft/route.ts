import { AuthError, requireAuth } from "@/lib/auth-helper";
import { AiProviderConfigError, AiProviderError, createDeepseekProvider } from "@/lib/ai/deepseek-provider";
import { AiDraftValidationError, generateRequirementDraft } from "@/lib/ai/draft-service";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await parseJsonBody(request);
    const result = await generateRequirementDraft(body, createDeepseekProvider());

    return Response.json(result);
  } catch (error) {
    if (error instanceof AuthError || (error instanceof Error && error.message === "未登录")) {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    if (error instanceof AiDraftValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof AiProviderConfigError) {
      return Response.json({ error: "AI provider is not configured" }, { status: 503 });
    }
    if (error instanceof AiProviderError) {
      return Response.json({ error: "AI provider request failed" }, { status: 502 });
    }

    console.error("AI draft POST error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AiDraftValidationError("请求 JSON 格式不正确");
  }
}
