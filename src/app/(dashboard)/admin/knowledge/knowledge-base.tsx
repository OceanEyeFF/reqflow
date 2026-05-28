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
  Trash2,
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
  knowledgeBase: {
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
  };
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

type KnowledgeBase = {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  sourceCount: number;
};

export function AdminKnowledgeBase() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
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
  const allSourcesSelected = sources.length > 0 && selectedSourceIds.size === sources.length;

  useEffect(() => {
    void loadSources();
    void loadKnowledgeBases();
  }, []);

  async function loadSources() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/knowledge/sources");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载知识库失败");
      setSources(data.sources ?? []);
      setSelectedSourceIds((current) => {
        const liveIds = new Set<string>((data.sources ?? []).map((source: KnowledgeSource) => source.id));
        return new Set(Array.from(current).filter((id) => liveIds.has(id)));
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载知识库失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadKnowledgeBases() {
    try {
      const response = await fetch("/api/admin/knowledge/bases");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载知识库失败");
      const bases = (data.knowledgeBases ?? []) as KnowledgeBase[];
      setKnowledgeBases(bases);
      setSelectedKnowledgeBaseId((current) => current || bases[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载知识库失败");
    }
  }

  async function uploadFile() {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append("file", file);
      }
      if (selectedKnowledgeBaseId) {
        formData.set("knowledgeBaseId", selectedKnowledgeBaseId);
      }
      const response = await fetch("/api/admin/knowledge/uploads", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "上传失败");
      setSelectedFiles([]);
      setMessage(data.sources?.length > 1 ? `已上传 ${data.sources.length} 个文件` : `已上传 ${data.source.title}`);
      await loadSources();
      await loadKnowledgeBases();
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

  async function deleteSource(source: KnowledgeSource) {
    if (!window.confirm(`删除知识来源「${source.title}」？此操作会移除原始文件和已解析片段。`)) return;
    await runAction(`delete:${source.id}`, async () => {
      const response = await fetch(`/api/admin/knowledge/sources/${source.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE_SOURCE" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "删除知识来源失败");
      setMessage(data.storageCleanupErrors?.length ? "知识来源已删除，部分原始文件需要手动清理" : "知识来源已删除");
    });
  }

  async function deleteSelectedSources() {
    if (selectedSourceIds.size === 0) return;
    if (!window.confirm(`删除已选择的 ${selectedSourceIds.size} 个知识来源？此操作会移除对应原始文件和已解析片段。`)) return;
    await runAction("delete:selected", async () => {
      const response = await fetch("/api/admin/knowledge/sources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation: "DELETE_SELECTED_SOURCES",
          sourceIds: Array.from(selectedSourceIds),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "删除选中知识来源失败");
      setSelectedSourceIds(new Set());
      setMessage(
        data.storageCleanupErrors?.length
          ? `已删除 ${data.deletedCount} 个知识来源，部分原始文件需要手动清理`
          : `已删除 ${data.deletedCount} 个知识来源`
      );
    });
  }

  function toggleSourceSelection(sourceId: string) {
    setSelectedSourceIds((current) => {
      const next = new Set(current);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  }

  function selectAllSources() {
    setSelectedSourceIds(new Set(sources.map((source) => source.id)));
  }

  function invertSourceSelection() {
    setSelectedSourceIds((current) => new Set(sources.filter((source) => !current.has(source.id)).map((source) => source.id)));
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
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={loadSources} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            刷新
          </Button>
        </div>
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
                multiple
                accept=".md,.markdown,.txt,.json,.zip,text/markdown,text/plain,application/json,application/zip"
                onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="knowledge-base">知识库</Label>
              <select
                id="knowledge-base"
                value={selectedKnowledgeBaseId}
                onChange={(event) => setSelectedKnowledgeBaseId(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={knowledgeBases.length === 0}
              >
                {knowledgeBases.map((base) => (
                  <option key={base.id} value={base.id}>
                    {base.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" onClick={uploadFile} disabled={selectedFiles.length === 0 || uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "上传中" : "上传文件"}
            </Button>
          </div>
          {selectedFiles.length > 0 && (
            <p className="text-sm text-gray-500">
              已选择 {selectedFiles.length} 个文件，合计 {formatBytes(selectedFiles.reduce((total, file) => total + file.size, 0))}
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
        {sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border bg-white p-3">
            <Button type="button" variant="outline" size="sm" onClick={allSourcesSelected ? () => setSelectedSourceIds(new Set()) : selectAllSources}>
              {allSourcesSelected ? "取消全选" : "全选"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={invertSourceSelection}>
              反选
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={deleteSelectedSources}
              disabled={selectedSourceIds.size === 0 || busyId === "delete:selected"}
            >
              {busyId === "delete:selected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              删除所选
            </Button>
            <span className="text-sm text-gray-500">已选择 {selectedSourceIds.size} / {sources.length}</span>
          </div>
        )}
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
              onDeleteSource={deleteSource}
              selected={selectedSourceIds.has(source.id)}
              onToggleSelected={toggleSourceSelection}
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
  onDeleteSource,
  selected,
  onToggleSelected,
}: {
  source: KnowledgeSource;
  busyId: string;
  onParse: (versionId: string) => Promise<void>;
  onToggleSource: (source: KnowledgeSource) => Promise<void>;
  onToggleSnippet: (snippet: KnowledgeSnippet) => Promise<void>;
  onDeleteSource: (source: KnowledgeSource) => Promise<void>;
  selected: boolean;
  onToggleSelected: (sourceId: string) => void;
}) {
  const latestVersion = source.versions[0];
  const canEnable = source.status === "ready" || source.status === "enabled";
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelected(source.id)}
                aria-label={`选择 ${source.title}`}
                className="h-4 w-4"
              />
              {latestVersion?.importType === "zip" ? <FileArchive className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              <span className="truncate">{source.title}</span>
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <Badge>{source.status}</Badge>
              <Badge>{source.enabled ? "enabled" : "disabled"}</Badge>
              <Badge>{source.knowledgeBase.name}</Badge>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDeleteSource(source)}
              disabled={busyId === `delete:${source.id}`}
            >
              {busyId === `delete:${source.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              删除
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
