"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileArchive,
  FileText,
  Loader2,
  Power,
  RefreshCw,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type KnowledgeVersion = {
  id: string;
  version: number;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  contentHash: string;
  importType: string;
  status: string;
  errorCode: string | null;
  createdAt: string;
  snippetCount: number;
};

type KnowledgeSnippet = {
  id: string;
  sourcePath: string;
  section: string | null;
  snippet: string;
  chunkIndex: number;
  enabled: boolean;
  createdAt: string;
};

type KnowledgeSource = {
  id: string;
  title: string;
  status: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  snippetCount: number;
  versionCount: number;
  versions: KnowledgeVersion[];
  snippets: KnowledgeSnippet[];
};

export function AdminKnowledgeBase() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const readyCount = useMemo(() => sources.filter((source) => source.status === "ready" || source.status === "enabled").length, [sources]);
  const enabledSnippetCount = useMemo(
    () => sources.reduce((count, source) => count + source.snippets.filter((snippet) => snippet.enabled).length, 0),
    [sources]
  );

  useEffect(() => {
    void loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/knowledge/sources");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载知识库失败");
      setSources(data.sources ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载知识库失败");
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile() {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.set("file", selectedFile);
      const response = await fetch("/api/admin/knowledge/uploads", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "上传失败");
      setSelectedFile(null);
      setMessage(`已上传 ${data.source.title}`);
      await loadSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function parseVersion(versionId: string) {
    await runAction(`parse:${versionId}`, async () => {
      const response = await fetch(`/api/admin/knowledge/versions/${versionId}/parse`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "解析失败");
      setMessage(`解析完成，生成 ${data.snippetCount} 个片段`);
    });
  }

  async function toggleSource(source: KnowledgeSource) {
    await runAction(`source:${source.id}`, async () => {
      const response = await fetch(`/api/admin/knowledge/sources/${source.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !source.enabled }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "更新来源失败");
      setMessage(data.source.enabled ? "知识来源已启用" : "知识来源已停用");
    });
  }

  async function toggleSnippet(snippet: KnowledgeSnippet) {
    await runAction(`snippet:${snippet.id}`, async () => {
      const response = await fetch(`/api/admin/knowledge/snippets/${snippet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !snippet.enabled }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "更新片段失败");
      setMessage(data.snippet.enabled ? "片段已启用" : "片段已停用");
    });
  }

  async function runAction(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      await action();
      await loadSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">管理员知识库</h2>
          <p className="mt-1 text-sm text-gray-500">上传私有文档或 docs zip，解析后作为 AI 草稿的可追踪引用片段</p>
        </div>
        <Button type="button" variant="outline" onClick={loadSources} disabled={loading}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          刷新
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusTile label="来源" value={sources.length} />
        <StatusTile label="可用来源" value={readyCount} />
        <StatusTile label="预览启用片段" value={enabledSnippetCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5" />
            上传
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="knowledge-file">文件</Label>
              <Input
                id="knowledge-file"
                type="file"
                accept=".md,.markdown,.txt,.json,.zip,text/markdown,text/plain,application/json,application/zip"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="button" onClick={uploadFile} disabled={!selectedFile || uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "上传中" : "上传文件"}
            </Button>
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-500">
              已选择 {selectedFile.name}，{formatBytes(selectedFile.size)}
            </p>
          )}
        </CardContent>
      </Card>

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

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center gap-2 p-6 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              加载中...
            </CardContent>
          </Card>
        ) : sources.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-gray-500">暂无知识来源</CardContent>
          </Card>
        ) : (
          sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              busyId={busyId}
              onParse={parseVersion}
              onToggleSource={toggleSource}
              onToggleSnippet={toggleSnippet}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatusTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SourceCard({
  source,
  busyId,
  onParse,
  onToggleSource,
  onToggleSnippet,
}: {
  source: KnowledgeSource;
  busyId: string;
  onParse: (versionId: string) => Promise<void>;
  onToggleSource: (source: KnowledgeSource) => Promise<void>;
  onToggleSnippet: (snippet: KnowledgeSnippet) => Promise<void>;
}) {
  const latestVersion = source.versions[0];
  const canEnable = source.status === "ready" || source.status === "enabled";
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {latestVersion?.importType === "zip" ? <FileArchive className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              <span className="truncate">{source.title}</span>
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <Badge>{source.status}</Badge>
              <Badge>{source.enabled ? "enabled" : "disabled"}</Badge>
              <Badge>{source.snippetCount} snippets</Badge>
              <span>{formatDate(source.createdAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {latestVersion && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onParse(latestVersion.id)}
                disabled={busyId === `parse:${latestVersion.id}`}
              >
                {busyId === `parse:${latestVersion.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                解析
              </Button>
            )}
            <Button
              type="button"
              variant={source.enabled ? "secondary" : "outline"}
              size="sm"
              onClick={() => onToggleSource(source)}
              disabled={!canEnable || busyId === `source:${source.id}`}
              title={canEnable ? "切换来源启停" : "解析成功后才能启用"}
            >
              {busyId === `source:${source.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
              {source.enabled ? "停用" : "启用"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestVersion && (
          <div className="grid gap-3 rounded-md border bg-gray-50 p-3 text-sm md:grid-cols-4">
            <Field label="版本" value={`v${latestVersion.version}`} />
            <Field label={latestVersion.importType === "zip" ? "文件夹" : "文件"} value={latestVersion.originalFilename} />
            <Field label="大小" value={formatBytes(latestVersion.fileSize)} />
            <Field label="片段" value={`${latestVersion.snippetCount}`} />
            {latestVersion.errorCode && (
              <div className="md:col-span-4">
                <p className="text-xs text-gray-500">错误</p>
                <p className="mt-1 text-sm text-red-700">{latestVersion.errorCode}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4" />
            {latestVersion?.importType === "zip" ? "文件夹片段预览" : "片段预览"}
          </div>
          {source.snippets.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-gray-500">解析后显示片段</p>
          ) : (
            source.snippets.map((snippet) => (
              <div key={snippet.id} className="rounded-md border p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{snippet.sourcePath}</span>
                    {snippet.section && <span> / {snippet.section}</span>}
                    <span> / #{snippet.chunkIndex + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant={snippet.enabled ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onToggleSnippet(snippet)}
                    disabled={busyId === `snippet:${snippet.id}`}
                  >
                    {busyId === `snippet:${snippet.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                    {snippet.enabled ? "停用片段" : "启用片段"}
                  </Button>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-700">{snippet.snippet}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded border bg-white px-2 py-0.5 text-xs text-gray-600">{children}</span>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm text-gray-800">{value}</p>
    </div>
  );
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
