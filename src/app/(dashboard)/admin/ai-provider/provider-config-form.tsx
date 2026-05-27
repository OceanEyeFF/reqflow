"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound, PlugZap, Save, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProviderConfig = {
  baseUrl: string;
  model: string;
  noKeyMode: boolean;
  enabled: boolean;
  hasApiKey: boolean;
  maskedApiKey: string | null;
};

const emptyConfig: ProviderConfig = {
  baseUrl: "https://api.deepseek.com",
  model: "deepseek-v4-flash",
  noKeyMode: false,
  enabled: true,
  hasApiKey: false,
  maskedApiKey: null,
};

export function AdminAiProviderForm() {
  const [config, setConfig] = useState<ProviderConfig>(emptyConfig);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadConfig() {
      try {
        const response = await fetch("/api/admin/ai-provider");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "加载失败");
        if (mounted && data.config) {
          setConfig({
            baseUrl: data.config.baseUrl,
            model: data.config.model,
            noKeyMode: data.config.noKeyMode,
            enabled: data.config.enabled,
            hasApiKey: data.config.hasApiKey,
            maskedApiKey: data.config.maskedApiKey,
          });
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  async function saveConfig() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/ai-provider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: config.baseUrl,
          model: config.model,
          apiKey,
          keepExistingApiKey: !apiKey && config.hasApiKey,
          clearApiKey: config.noKeyMode,
          noKeyMode: config.noKeyMode,
          enabled: config.enabled,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败");
      setConfig({
        baseUrl: data.config.baseUrl,
        model: data.config.model,
        noKeyMode: data.config.noKeyMode,
        enabled: data.config.enabled,
        hasApiKey: data.config.hasApiKey,
        maskedApiKey: data.config.maskedApiKey,
      });
      setApiKey("");
      setMessage("配置已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function testConfig() {
    setTesting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/ai-provider/test", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "测试失败");
      setMessage(`配置可用：${data.model} / ${data.keyMode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "测试失败");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Provider 配置</h2>
        <p className="mt-1 text-sm text-gray-500">配置服务端使用的 OpenAI-compatible endpoint、模型和密钥策略</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="h-5 w-5" />
            Provider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <p className="text-sm text-gray-500">加载中...</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">API endpoint</Label>
                  <Input
                    id="baseUrl"
                    value={config.baseUrl}
                    onChange={(event) => setConfig((current) => ({ ...current, baseUrl: event.target.value }))}
                    placeholder="https://api.deepseek.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">模型</Label>
                  <Input
                    id="model"
                    value={config.model}
                    onChange={(event) => setConfig((current) => ({ ...current, model: event.target.value }))}
                    placeholder="deepseek-v4-flash"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API key</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="apiKey"
                      type="password"
                      className="pl-9"
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      placeholder={config.maskedApiKey || "输入新 API key"}
                      disabled={config.noKeyMode}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-3 rounded-md border p-4">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={config.noKeyMode}
                      onChange={(event) =>
                        setConfig((current) => ({ ...current, noKeyMode: event.target.checked }))
                      }
                    />
                    localhost 无 API key 模式
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(event) =>
                        setConfig((current) => ({ ...current, enabled: event.target.checked }))
                      }
                    />
                    启用该配置
                  </label>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              {message && (
                <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  <span>{message}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={saveConfig} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "保存中..." : "保存"}
                </Button>
                <Button type="button" variant="outline" onClick={testConfig} disabled={testing}>
                  <PlugZap className="h-4 w-4" />
                  {testing ? "测试中..." : "测试配置"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
