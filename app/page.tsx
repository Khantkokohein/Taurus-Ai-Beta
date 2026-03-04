"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// --- Types & Constants ---
type Msg = { id: string; role: "user" | "ai"; text: string; ts: number };

const PERSONAS = [
  { key: "taurus", title: "Taurus AI", desc: "Your personal assistant" },
  { key: "professional", title: "Pro Mode", desc: "Expert business consultant" }
];

// --- Helper Functions ---
const uid = () => Math.random().toString(36).substring(7);

const normalizeYesNo = (text: string) => {
  const t = text.toLowerCase().trim();
  if (["yes", "y", "ဟုတ်", "အင်း"].includes(t)) return "yes";
  if (["no", "n", "မဟုတ်", "ဟင့်အင်း"].includes(t)) return "no";
  return null;
};

const JOB_STEPS = [
  { key: "name", q: "သင့်နာမည် အပြည့်အစုံ ပြောပေးပါ။" },
  { key: "skill", q: "ဘာကျွမ်းကျင်မှုတွေ ရှိပါသလဲ?" }
];

const HIRE_STEPS = [
  { key: "company", q: "ကုမ္ပဏီ နာမည် ပြောပေးပါ။" },
  { key: "position", q: "ဘာရာထူးအတွက် ခေါ်ချင်တာလဲ?" }
];

function nextMissingStep(kind: "job" | "hire", data: any) {
  const steps = kind === "job" ? JOB_STEPS : HIRE_STEPS;
  return steps.find(s => !data[s.key]);
}

// --- Main Page Component ---
export default function Page() {
  const [activePersona, setActivePersona] = useState("taurus");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"chat" | "recruitment">("chat");
  const [intakeKind, setIntakeKind] = useState<"job" | "hire" | null>(null);
  const [intake, setIntake] = useState<Record<string, any>>({});
  const [awaitingSubmit, setAwaitingSubmit] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Image Generation Logic (Free Token Friendly) ---
  async function createImage(prompt: string) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    const res = await fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Token ရှိရင် ထည့်ပို့မယ်၊ မရှိရင်လည်း Free token logic နဲ့ backend က စစ်ပေးဖို့ မျှော်လင့်ရမယ်
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ prompt, isFree: true }),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401) throw new Error("Unauthorized: Free token error or Session expired.");
      throw new Error(result.error || "Image creation failed");
    }
    return result as { url: string };
  }

  const resetIntake = () => {
    setMode("chat");
    setIntakeKind(null);
    setIntake({});
    setAwaitingSubmit(false);
  };

  // --- Send Message ---
  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Msg = { id: uid(), role: "user", text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // 1. /draw logic
    if (text.toLowerCase().startsWith("/draw")) {
      setSending(true);
      try {
        const prompt = text.replace("/draw", "").trim() || text;
        const res = await createImage(prompt);
        setMessages(prev => [...prev, { id: uid(), role: "ai", text: `![AI_PHOTO](${res.url})`, ts: Date.now() }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { id: uid(), role: "ai", text: "❌ " + err.message, ts: Date.now() }]);
      } finally {
        setSending(false);
      }
      return;
    }

    // 2. Recruitment logic
    if (mode === "recruitment" && intakeKind) {
      if (awaitingSubmit) {
        const yn = normalizeYesNo(text);
        if (yn === "yes") {
          setSending(true);
          setMessages(prev => [...prev, { id: uid(), role: "ai", text: "✅ Submit အောင်မြင်ပါသည်။", ts: Date.now() }]);
          resetIntake();
          setSending(false);
        } else if (yn === "no") {
          setMessages(prev => [...prev, { id: uid(), role: "ai", text: "❌ ဖျက်သိမ်းလိုက်ပါပြီ။", ts: Date.now() }]);
          resetIntake();
        }
        return;
      }

      const missing = nextMissingStep(intakeKind, intake);
      if (missing) {
        const updated = { ...intake, [missing.key]: text };
        setIntake(updated);
        const next = nextMissingStep(intakeKind, updated);
        if (next) {
          setMessages(prev => [...prev, { id: uid(), role: "ai", text: next.q, ts: Date.now() }]);
        } else {
          setAwaitingSubmit(true);
          setMessages(prev => [...prev, { id: uid(), role: "ai", text: "အတည်ပြုမှာလား? (YES/NO)", ts: Date.now() }]);
        }
      }
      return;
    }

    // 3. Normal Chat
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, persona: activePersona }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: uid(), role: "ai", text: data.reply || "No response", ts: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { id: uid(), role: "ai", text: "❌ Connection error.", ts: Date.now() }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[100dvh] bg-white dark:bg-zinc-950 shadow-xl">
      {/* Header */}
      <header className="p-4 border-b flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
        <h1 className="font-bold text-lg text-blue-600">TAURUS AI</h1>
        <button onClick={() => setMode(mode === "chat" ? "recruitment" : "chat")} className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
          Mode: {mode}
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              m.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none"
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white dark:bg-zinc-950">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={mode === "recruitment" ? "Answer the question..." : "Type /draw to create image..."}
            className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all"
          >
            {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : "▲"}
          </button>
        </div>
      </div>
    </div>
  );
}