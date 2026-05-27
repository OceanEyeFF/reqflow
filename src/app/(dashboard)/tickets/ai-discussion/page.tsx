"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, HelpCircle, RefreshCcw, Send, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITY_LABELS } from "@/types";

type DraftCitation = {
  sourceId: string;
  sourceTitle: string;
  snippet: string;
};

type AiRequirementDraft = {
  title: string;
  background: string;
  userStory: string;
  acceptanceCriteria: string[];
  pendingQuestions: string[];
  suggestedPriority: "low" | "medium" | "high" | "urgent";
  citations: DraftCitation[];
};

type ClarificationQuestion = {
  id: string;
  question: string;
  reason: string;
};

type AiDraftResponse =
  | {
      kind: "clarification";
      result: { questions: ClarificationQuestion[]; canDraftNow: boolean };
      citations: DraftCitation[];
      emptyKnowledge: boolean;
    }
  | {
      kind: "draft";
      result: AiRequirementDraft;
      citations: DraftCitation[];
      emptyKnowledge: boolean;
    };

type AnswerMap = Record<string, string>;
type PageState = "empty" | "clarifying" | "draft_ready" | "accepted" | "failed";

export default function AiDiscussionPage() {
  const router = useRouter();
  const [requirement, setRequirement] = useState("");
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [draft, setDraft] = useState<AiRequirementDraft | null>(null);
  const [citations, setCitations] = useState<DraftCitation[]>([]);
  const [emptyKnowledge, setEmptyKnowledge] = useState(false);
  const [status, setStatus] = useState<PageState>("empty");
  const [loading, setLoading] = useState<"clarify" | "draft" | null>(null);
  const [error, setError] = useState("");

  async function requestAi(mode: "clarify" | "draft") {
    const trimmedRequirement = requirement.trim();
    if (trimmedRequirement.length < 8) {
      setError("请先输入更完整的需求描述。");
      setStatus("failed");
      return;
    }

    setLoading(mode);
    setError("");
    try {
      const response = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          requirement: trimmedRequirement,
          answers: questions.map((question) => ({
            question: question.question,
            answer: answers[question.id] || "",
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "AI 生成失败");
      }

      applyAiResponse(data as AiDraftResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 生成失败");
      setStatus("failed");
    } finally {
      setLoading(null);
    }
  }

  function applyAiResponse(data: AiDraftResponse) {
    setCitations(data.citations || []);
    setEmptyKnowledge(data.emptyKnowledge);
    if (data.kind === "clarification") {
      setQuestions(data.result.questions);
      setDraft(null);
      setStatus("clarifying");
      return;
    }

    setDraft(data.result);
    setCitations(data.result.citations?.length ? data.result.citations : data.citations);
    setStatus("draft_ready");
  }

  function resetDiscussion() {
    setRequirement("");
    setQuestions([]);
    setAnswers({});
    setDraft(null);
    setCitations([]);
    setEmptyKnowledge(false);
    setStatus("empty");
    setError("");
  }

  function acceptDraft() {
    if (!draft) return;

    sessionStorage.setItem(
      "reqflow.aiDraft",
      JSON.stringify({
        title: draft.title,
        description: formatDraftDescription(draft),
        type: "需求",
        priority: draft.suggestedPriority,
        stagedAt: new Date().toISOString(),
      })
    );
    setStatus("accepted");
    router.push("/tickets/new?from=ai-draft");
  }

  const canSubmit = requirement.trim().length >= 8 && !loading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI 需求讨论</h2>
          <p className="mt-1 text-sm text-gray-500">把模糊想法整理成可审查的工单草稿</p>
        </div>
        <Link href="/tickets/new">
          <Button variant="outline">普通新建</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                讨论输入
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requirement">需求描述</Label>
                <Textarea
                  id="requirement"
                  rows={8}
                  value={requirement}
                  onChange={(event) => setRequirement(event.target.value)}
                  placeholder="例如：我们想让项目经理更容易追踪需求审批过程，但目前只有普通工单状态。"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => requestAi("clarify")} disabled={!canSubmit}>
                  <HelpCircle className="h-4 w-4" />
                  {loading === "clarify" ? "追问中..." : "让 AI 追问"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => requestAi("draft")} disabled={!canSubmit}>
                  <Send className="h-4 w-4" />
                  {loading === "draft" ? "生成中..." : "生成草稿"}
                </Button>
                <Button type="button" variant="outline" onClick={resetDiscussion}>
                  <RefreshCcw className="h-4 w-4" />
                  重置
                </Button>
              </div>
              {status === "failed" && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI 追问</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-2 rounded-md border p-4">
                    <div>
                      <p className="font-medium">{question.question}</p>
                      <p className="mt-1 text-sm text-gray-500">{question.reason}</p>
                    </div>
                    <Textarea
                      rows={3}
                      value={answers[question.id] || ""}
                      onChange={(event) =>
                        setAnswers((current) => ({ ...current, [question.id]: event.target.value }))
                      }
                      placeholder="补充你的回答，也可以留空后直接生成草稿"
                    />
                  </div>
                ))}
                <Button type="button" onClick={() => requestAi("draft")} disabled={!canSubmit}>
                  <Send className="h-4 w-4" />
                  {loading === "draft" ? "生成中..." : "根据回答生成草稿"}
                </Button>
              </CardContent>
            </Card>
          )}

          <DraftPreview
            draft={draft}
            status={status}
            onAccept={acceptDraft}
            onDiscard={() => {
              setDraft(null);
              setStatus(questions.length > 0 ? "clarifying" : "empty");
            }}
          />
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">确认边界</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>AI 只生成草稿和追问，不会创建工单。</p>
              <p>接受草稿只会预填现有工单表单，不会自动提交。</p>
              <p>最终仍需要你在工单表单里检查并提交。</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">引用片段</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emptyKnowledge && (
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                  本次草稿没有使用项目知识片段。
                </p>
              )}
              {citations.length === 0 && !emptyKnowledge ? (
                <p className="text-sm text-gray-500">生成后会显示使用过的项目知识片段。</p>
              ) : (
                citations.map((citation) => (
                  <div key={`${citation.sourceId}-${citation.snippet}`} className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{citation.sourceTitle}</p>
                      <Badge variant="outline">{citation.sourceId}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{citation.snippet}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function formatDraftDescription(draft: AiRequirementDraft): string {
  const sections = [
    ["背景", draft.background],
    ["用户故事", draft.userStory],
    ["验收标准", numberedList(draft.acceptanceCriteria)],
    ["待确认问题", numberedList(draft.pendingQuestions)],
    [
      "引用片段",
      draft.citations.map((citation) => `- ${citation.sourceTitle}: ${citation.snippet}`).join("\n"),
    ],
  ];

  return sections
    .filter(([, content]) => content.trim().length > 0)
    .map(([title, content]) => `${title}\n${content}`)
    .join("\n\n");
}

function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function DraftPreview({
  draft,
  status,
  onAccept,
  onDiscard,
}: {
  draft: AiRequirementDraft | null;
  status: PageState;
  onAccept: () => void;
  onDiscard: () => void;
}) {
  if (!draft) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-gray-500">
          生成草稿后，这里会显示标题、背景、用户故事、验收标准、待确认问题和建议优先级。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle className="text-lg">草稿预览</CardTitle>
          <Badge priority={draft.suggestedPriority}>{PRIORITY_LABELS[draft.suggestedPriority]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {status === "accepted" && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            草稿已进入人工确认状态；本页面没有创建工单。
          </div>
        )}
        <section>
          <h3 className="text-sm font-semibold text-gray-500">标题</h3>
          <p className="mt-1 font-medium">{draft.title}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-gray-500">背景</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{draft.background || "未生成"}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-gray-500">用户故事</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{draft.userStory || "未生成"}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-gray-500">验收标准</h3>
          {draft.acceptanceCriteria.length > 0 ? (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
              {draft.acceptanceCriteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-1 text-sm text-gray-500">未生成</p>
          )}
        </section>
        <section>
          <h3 className="text-sm font-semibold text-gray-500">待确认问题</h3>
          {draft.pendingQuestions.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {draft.pendingQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-gray-500">暂无</p>
          )}
        </section>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={onAccept}>
            <Check className="h-4 w-4" />
            接受草稿
          </Button>
          <Button type="button" variant="outline" onClick={onDiscard}>
            <Trash2 className="h-4 w-4" />
            丢弃草稿
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
