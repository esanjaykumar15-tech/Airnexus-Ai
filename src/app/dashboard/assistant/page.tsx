"use client";

import { useState, useRef, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { useLocationContext } from "@/lib/locationContext";
import { Bot, User, Send } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "Why is pollution high today?",
  "What will AQI be tomorrow?",
  "Which policy has the highest impact?",
  "Are there any active alerts?",
];

export default function AssistantPage() {
  const { locationId } = useLocationContext();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, I'm AIRNEXUS Copilot. Ask me about current conditions, forecasts, sources, or policy impact for the selected region." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"llm" | "rule-based">("rule-based");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(question: string) {
    if (!question.trim() || sending) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, locationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.error || "Something went wrong. Please try again." }]);
      } else {
        setMode(data.mode);
        setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "AIRNEXUS Copilot is temporarily unavailable. Please try again shortly." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar title="AIRNEXUS Copilot" subtitle="Ask questions about current data, forecasts, sources, and policy impact" />
      <div className="flex flex-1 flex-col overflow-hidden p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Mode: <span className="text-cyan-400">{mode === "llm" ? "LLM-backed" : "Rule-based (no LLM key configured)"}</span>
          </span>
        </div>

        <div className="glass-card flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "assistant" ? "bg-cyan-500/15 text-cyan-400" : "bg-white/10 text-slate-300"}`}>
                  {m.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.role === "assistant" ? "bg-white/[0.04] text-slate-200" : "bg-cyan-500/15 text-slate-100"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-400">
                  <Bot size={16} />
                </div>
                <div className="rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm text-slate-500">Thinking…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400 hover:bg-white/10">
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            className="input-dark flex-1"
            placeholder="Ask AIRNEXUS Copilot..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-4">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
