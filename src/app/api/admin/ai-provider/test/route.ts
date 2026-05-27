import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { AiProviderConfigValidationError, getEffectiveProviderConfig } from "@/lib/ai/provider-config";

export async function POST() {
  try {
    await requireAdmin();
    const config = await getEffectiveProviderConfig();
    if (!config.baseUrl || !config.model) {
      throw new AiProviderConfigValidationError("AI Provider 配置不完整");
    }

    return Response.json({
      ok: true,
      endpoint: config.baseUrl,
      model: config.model,
      keyMode: config.apiKey ? "api-key" : "local-no-key",
    });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof AiProviderConfigValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("AI provider test error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
