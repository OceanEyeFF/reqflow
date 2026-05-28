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
  Save,
  Trash2,
  Upload,
  X,
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
  description: string | null;
  enabled: boolean;
  isDefault: boolean;
  sourceCount: number;
};

type KnowledgeBaseForm = {
  name: string;
  description: string;
};

export function AdminKnowledgeBase() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [editingBaseId, setEditingBaseId] = useState("");
  const [baseForm, setBaseForm] = useState<KnowledgeBaseForm>({ name: "", description: "" });
  const [createBaseForm, setCreateBaseForm] = useState<KnowledgeBaseForm>({ name: "", description: "" });
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
  const uploadableKnowledgeBases = useMemo(() => knowledgeBases.filter((base) => base.enabled), [knowledgeBases]);
  const selectedKnowledgeBase = useMemo(
    () => knowledgeBases.find((base) => base.id === selectedKnowledgeBaseId),
    [knowledgeBases, selectedKnowledgeBaseId]
  );
  const cleanupEligibleSources = useMemo(() => sources.filter((source) => source.knowledgeBase.enabled), [sources]);
  const allSourcesSelected = cleanupEligibleSources.length > 0 && selectedSourceIds.size === cleanupEligibleSources.length;

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

  async function loadKnowledgeBases(preferredBaseId?: string) {
    try {
      const response = await fetch("/api/admin/knowledge/bases");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载知识库失败");
      const bases = (data.knowledgeBases ?? []) as KnowledgeBase[];
      setKnowledgeBases(bases);
      setSelectedKnowledgeBaseId((current) => {
        const preferredBase = bases.find((base) => base.id === preferredBaseId);
        if (preferredBase?.enabled) return preferredBase.id;
        const currentBase = bases.find((base) => base.id === current);
        if (currentBase?.enabled) return current;
        return bases.find((base) => base.enabled)?.id || "";
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载知识库失败");
    }
  }

  async function uploadFile() {
    if (selectedFiles.length === 0) return;
    if (!selectedKnowledgeBaseId || selectedKnowledgeBase?.enabled === false) {
      setError("请选择可用知识库后再上传");
      return;
    }
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

  function startEditBase(base: KnowledgeBase) {
    setEditingBaseId(base.id);
    setBaseForm({ name: base.name, description: base.description ?? "" });
  }

  async function saveKnowledgeBase(base: KnowledgeBase) {
    await runAction(`base:${base.id}:save`, async () => {
      const response = await fetch(`/api/admin/knowledge/bases/${base.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: baseForm.name,
          description: baseForm.description,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "更新知识库失败");
      setEditingBaseId("");
      setMessage("知识库信息已更新");
      await loadKnowledgeBases();
    });
  }

  async function createBase() {
    await runAction("base:create", async () => {
      const response = await fetch("/api/admin/knowledge/bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createBaseForm.name,
          description: createBaseForm.description,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "创建知识库失败");
      setCreateBaseForm({ name: "", description: "" });
      setMessage("知识库已创建");
      await loadKnowledgeBases(data.knowledgeBase.id);
    });
  }

  async function toggleKnowledgeBase(base: KnowledgeBase) {
    if (base.isDefault && base.enabled) {
      setError("默认知识库不可禁用");
      return;
    }
    await runAction(`base:${base.id}:toggle`, async () => {
      const response = await fetch(`/api/admin/knowledge/bases/${base.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !base.enabled }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "更新知识库状态失败");
      setMessage(data.knowledgeBase.enabled ? "知识库已恢复" : "知识库已禁用");
      await loadKnowledgeBases();
    });
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
    if (!source.knowledgeBase.enabled) {
      setError("禁用/归档知识库下的内容不可清理，请先恢复知识库");
      return;
    }
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
    const selectedSources = sources.filter((source) => selectedSourceIds.has(source.id));
    if (selectedSources.some((source) => !source.knowledgeBase.enabled)) {
      setError("禁用/归档知识库下的内容不可清理，请先恢复知识库");
      return;
    }
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

  function toggleSourceSelection(source: KnowledgeSource) {
    if (!source.knowledgeBase.enabled) return;
    setSelectedSourceIds((current) => {
      const next = new Set(current);
      if (next.has(source.id)) {
        next.delete(source.id);
      } else {
        next.add(source.id);
      }
      return next;
    });
  }

  function selectAllSources() {
    setSelectedSourceIds(new Set(cleanupEligibleSources.map((source) => source.id)));
  }

  function invertSourceSelection() {
    setSelectedSourceIds((current) => new Set(cleanupEligibleSources.filter((source) => !current.has(source.id)).map((source) => source.id)));
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
            <FileArchive className="h-5 w-5" />
            知识库
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border bg-gray-50 p-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-2">
                <Label htmlFor="new-base-name">名称</Label>
                <Input
                  id="new-base-name"
                  value={createBaseForm.name}
                  onChange={(event) => setCreateBaseForm((current) => ({ ...current, name: event.target.value }))}
                  maxLength={80}
                  placeholder="例如：支付模块知识库"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-base-description">描述</Label>
                <Input
                  id="new-base-description"
                  value={createBaseForm.description}
                  onChange={(event) => setCreateBaseForm((current) => ({ ...current, description: event.target.value }))}
                  maxLength={200}
                  placeholder="可选"
                />
              </div>
              <Button
                type="button"
                onClick={createBase}
                disabled={createBaseForm.name.trim().length === 0 || busyId === "base:create"}
              >
                {busyId === "base:create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                新建知识库
              </Button>
            </div>
          </div>
          {knowledgeBases.length === 0 ? (
            <p className="text-sm text-gray-500">暂无知识库</p>
          ) : (
            knowledgeBases.map((base) => {
              const editing = editingBaseId === base.id;
              return (
                <div key={base.id} className="rounded-md border p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      {editing ? (
                        <div className="grid gap-2 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                          <Input
                            value={baseForm.name}
                            onChange={(event) => setBaseForm((current) => ({ ...current, name: event.target.value }))}
                            aria-label="知识库名称"
                            maxLength={80}
                          />
                          <Input
                            value={baseForm.description}
                            onChange={(event) => setBaseForm((current) => ({ ...current, description: event.target.value }))}
                            aria-label="知识库描述"
                            maxLength={200}
                            placeholder="描述"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-gray-900">{base.name}</h3>
                            <Badge>{base.enabled ? "可用" : "已禁用/归档"}</Badge>
                            {base.isDefault && <Badge>默认库</Badge>}
                            <Badge>{base.sourceCount} sources</Badge>
                          </div>
                          <p className="text-sm text-gray-500">{base.description || "无描述"}</p>
                        </>
                      )}
                      <p className="text-xs text-gray-500">内部标识：{base.slug}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editing ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => saveKnowledgeBase(base)}
                            disabled={busyId === `base:${base.id}:save`}
                          >
                            {busyId === `base:${base.id}:save` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            保存
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditingBaseId("")}>
                            <X className="h-4 w-4" />
                            取消
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={() => startEditBase(base)}>
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant={base.enabled ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => toggleKnowledgeBase(base)}
                            disabled={(base.isDefault && base.enabled) || busyId === `base:${base.id}:toggle`}
                            title={base.isDefault && base.enabled ? "默认知识库不可禁用" : base.enabled ? "禁用/归档知识库" : "恢复知识库"}
                          >
                            {busyId === `base:${base.id}:toggle` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                            {base.enabled ? "禁用" : "恢复"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

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
                disabled={uploadableKnowledgeBases.length === 0}
              >
                {knowledgeBases.map((base) => (
                  <option key={base.id} value={base.id} disabled={!base.enabled}>
                    {base.enabled ? base.name : `${base.name}（已禁用）`}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" onClick={uploadFile} disabled={selectedFiles.length === 0 || uploading || !selectedKnowledgeBase?.enabled}>
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
  onToggleSelected: (source: KnowledgeSource) => void;
}) {
  const latestVersion = source.versions[0];
  const canEnable = source.status === "ready" || source.status === "enabled";
  const cleanupAllowed = source.knowledgeBase.enabled;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelected(source)}
                aria-label={`选择 ${source.title}`}
                disabled={!cleanupAllowed}
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
              disabled={!cleanupAllowed || busyId === `delete:${source.id}`}
              title={cleanupAllowed ? "删除知识来源" : "禁用/归档知识库下的内容不可清理"}
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
