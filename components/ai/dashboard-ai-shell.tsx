"use client";

import Link from "next/link";
import * as React from "react";
import {
  ArrowLeft,
  Bot,
  MessageCircle,
  SendHorizonal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChatMessage = { id: number; role: "assistant" | "user"; text: string };

const INITIAL_MESSAGE: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "I can explain uploaded reports and answer general health questions in simple language. I do not diagnose.",
};

export function DashboardAIShell({ backHref }: { backHref: string }) {
  const [reportText, setReportText] = React.useState("");
  const [explanation, setExplanation] = React.useState<string | null>(null);
  const [disclaimer, setDisclaimer] = React.useState<string | null>(null);
  const [isExplaining, setIsExplaining] = React.useState(false);
  const [chatInput, setChatInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isChatting, setIsChatting] = React.useState(false);
  const [sessionId] = React.useState(() => crypto.randomUUID());
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleExplain = async () => {
    if (!reportText.trim()) return;
    setIsExplaining(true);
    setExplanation(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reportText }),
      });
      const data = await res.json();
      const payload = data.data ?? data;
      setExplanation(payload.explanation ?? data.error?.message ?? "No explanation returned.");
      setDisclaimer(payload.disclaimer ?? null);
    } catch {
      setExplanation("AI is temporarily unavailable, please try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatting(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = await res.json();
      const payload = data.data ?? data;
      const reply = payload.reply ?? payload.response ?? data.error?.message ?? "No reply.";
      const disc = payload.disclaimer ? `\n\n${payload.disclaimer}` : "";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: `${reply}${disc}` },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: "AI is temporarily unavailable, please try again." },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                AI Module
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Health assistant &amp; report explainer
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Review medical text in plain language and ask general health questions without
                replacing a clinician.
              </p>
            </div>
            <Link href={backHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          {/* Report explainer */}
          <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-slate-900">Report explainer</CardTitle>
                  <CardDescription className="text-slate-600">
                    Paste a report excerpt and receive a simplified explanation.
                  </CardDescription>
                </div>
                <Badge variant="neutral">Non-diagnostic</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm font-medium text-slate-900" htmlFor="report-text">
                Report text
              </label>
              <textarea
                id="report-text"
                rows={8}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Paste lab values, scan notes, or prescription text here…"
                className="w-full rounded-2xl border border-white/30 bg-white/50 p-3 text-sm text-slate-900 outline-none focus:border-primary/30 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleExplain}
                disabled={isExplaining || !reportText.trim()}
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                {isExplaining ? "Explaining…" : "Explain report"}
              </button>

              {explanation !== null && (
                <>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Sparkles className="size-4 text-primary" />
                      Plain-language explanation
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {explanation}
                    </p>
                  </div>
                  {disclaimer && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                      {disclaimer}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-slate-900">Health assistant</CardTitle>
                  <CardDescription className="text-slate-600">
                    Ask general questions and receive educational guidance.
                  </CardDescription>
                </div>
                <Badge variant="cyan">Educational only</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4">
              <div className="flex min-h-[22rem] flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-white/30 bg-white/40 p-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-6",
                      msg.role === "assistant"
                        ? "self-start bg-white text-foreground shadow-sm"
                        : "self-end bg-primary text-primary-foreground",
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
                      {msg.role === "assistant" ? (
                        <Bot className="size-3" />
                      ) : (
                        <MessageCircle className="size-3" />
                      )}
                      {msg.role === "assistant" ? "AI" : "You"}
                    </div>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                ))}
                {isChatting && (
                  <div className="self-start rounded-2xl bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm">
                    Thinking…
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about symptoms, lab terms, or medications…"
                  className="flex-1 rounded-full border border-white/30 bg-white/50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-primary/30 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isChatting || !chatInput.trim()}
                  className={buttonVariants({ variant: "default", size: "icon-sm" })}
                  aria-label="Send message"
                >
                  {isChatting ? (
                    <Sparkles className="size-4" />
                  ) : (
                    <SendHorizonal className="size-4" />
                  )}
                </button>
              </form>

              <div className="rounded-2xl border border-white/30 bg-white/50 p-4 text-sm leading-6 text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <ShieldCheck className="size-4 text-primary" />
                  Safety note
                </div>
                <p className="mt-2">
                  The assistant never diagnoses or prescribes. It offers general education and
                  encourages you to consult a qualified professional for confirmation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
