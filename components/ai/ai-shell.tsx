"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, MessageCircle, SendHorizonal, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const starterReport = `Hemoglobin: 12.8 g/dL\nPlatelets: 250,000/µL\nCholesterol: 196 mg/dL\nBlood pressure: 132/84 mmHg`;

export function AIShell() {
  const [reportText, setReportText] = React.useState(starterReport);
  const [explanation, setExplanation] = React.useState("Paste a report excerpt to receive a plain-language explanation.");
  const [disclaimer, setDisclaimer] = React.useState("This explanation is for educational purposes only. It does not diagnose or replace medical advice.");
  const [isExplaining, setIsExplaining] = React.useState(false);
  const [chatInput, setChatInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "I can explain uploaded reports and answer general health questions in simple language. I do not diagnose.",
    },
  ]);
  const [isChatting, setIsChatting] = React.useState(false);

  const handleExplain = async () => {
    setIsExplaining(true);
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reportText }),
      });
      const data = await response.json();
      const payload = data.data ?? data;
      setExplanation(payload.explanation || data.error?.message || "No explanation returned.");
      setDisclaimer(payload.disclaimer || disclaimer);
    } catch {
      setExplanation("AI is temporarily unavailable, please try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { id: Date.now(), role: "user" as const, text: chatInput.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatting(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });
      const data = await response.json();
      const payload = data.data ?? data;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: `${payload.reply || data.error?.message || "No reply."}\n\n${payload.disclaimer || ""}` },
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,196,196,0.08),_transparent_34%),linear-gradient(135deg,_#f8fdfd_0%,_#f4fbff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-border/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(16,196,196,0.1)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary-foreground">AI Module</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">Educational report explainer and care assistant</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review medical text in plain language and ask the assistant general health questions without replacing a clinician.
              </p>
            </div>
            <Link href="/" className={buttonVariants({ variant: "default", size: "default" })}>
              Back to home
            </Link>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Report explainer</CardTitle>
                  <CardDescription>Paste a report excerpt and receive a simplified explanation.</CardDescription>
                </div>
                <Badge variant="neutral">Non-diagnostic</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm font-medium text-foreground" htmlFor="report-text">
                Report text
              </label>
              <textarea
                id="report-text"
                rows={10}
                value={reportText}
                onChange={(event) => setReportText(event.target.value)}
                className="w-full rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-foreground outline-none focus:border-primary/30"
              />
              <button type="button" onClick={handleExplain} className={buttonVariants({ variant: "default", size: "sm" })}>
                {isExplaining ? "Explaining..." : "Explain report"}
              </button>

              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  Plain-language explanation
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{explanation}</p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                {disclaimer}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Health assistant</CardTitle>
                  <CardDescription>Ask general questions and receive educational guidance.</CardDescription>
                </div>
                <Badge variant="cyan">Educational only</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex min-h-[18rem] flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-6",
                      message.role === "assistant"
                        ? "self-start bg-white text-foreground shadow-sm"
                        : "self-end bg-primary text-primary-foreground",
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">
                      {message.role === "assistant" ? <Bot className="size-3" /> : <MessageCircle className="size-3" />}
                      {message.role === "assistant" ? "AI" : "You"}
                    </div>
                    <p className="whitespace-pre-line">{message.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask about common symptoms or lab terms"
                  className="flex-1 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm outline-none focus:border-primary/30"
                />
                <button type="submit" className={buttonVariants({ variant: "default", size: "icon-sm" })}>
                  {isChatting ? <Sparkles className="size-4" /> : <SendHorizonal className="size-4" />}
                </button>
              </form>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  Safety note
                </div>
                <p className="mt-2">
                  The assistant never diagnoses or prescribes. It offers general education and encourages you to consult a qualified professional for confirmation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
