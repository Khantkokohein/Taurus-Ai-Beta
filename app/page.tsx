"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PersonaKey =
  | "taurus"
  | "tiktok_creator"
  | "facebook_writer"
  | "doctor"
  | "dev_pro"
  | "emergency"
  | "friend";

type Msg = { id: string; role: "user" | "ai"; text: string; ts: number };

type Mode = "chat" | "recruitment";
type IntakeKind = "job" | "hire";

const OWNER_EMAIL = "koheinkhantko51@gmail.com";
const LS_THEME = "taurus_theme";
const LS_DEVICE = "taurus_device_id";

const PERSONAS: { key: PersonaKey; title: string; subtitle: string; tone: string }[] = [
  { key: "taurus", title: "TAURUS AI", subtitle: "All Answers (Main)", tone: "Professional" },
  { key: "tiktok_creator", title: "Taurus Creator", subtitle: "TikTok / Short Video Expert", tone: "Creator" },
  { key: "facebook_writer", title: "Taurus Writer", subtitle: "Facebook Content Writer", tone: "Persuasive" },
  { key: "doctor", title: "Doctor AI", subtitle: "Family Doctor (Clinical)", tone: "Clinical" },
  { key: "dev_pro", title: "Dev Pro", subtitle: "Coding & Tech Specialist", tone: "Technical" },
  { key: "emergency", title: "Emergency AI", subtitle: "Urgent Guidance", tone: "Urgent" },
  { key: "friend", title: "Friend AI", subtitle: "Friendly Buddy", tone: "Friendly" },
];

const JOB_STEPS = [
  { key: "name", q: "အမည် (Full Name) ကိုရေးပေးပါ။" },
  { key: "phone", q: "ဖုန်းနံပါတ် (09xxxxxxxxx)?" },
  { key: "city", q: "မြို့ (ဥပမာ မော်လမြိုင်)?" },
  { key: "exp", q: "Sales experience (နှစ်/လ) ဘယ်လောက်ရှိပါသလဲ?" },
  { key: "salary", q: "မျှော်မှန်းလစာ (MMK)?" },
  { key: "availability", q: "အလုပ်စတင်နိုင်မယ့်ရက် (ဥပမာ ချက်ချင်း / 1 week)?" },
];
const HIRE_STEPS = [
  { key: "biz", q: "လုပ်ငန်းအမည် (Business Name)?" },
  { key: "phone", q: "ဆက်သွယ်ရန်ဖုန်းနံပါတ်?" },
  { key: "position", q: "အလုပ်ရာထူး (Sales)?" },
  { key: "salary_range", q: "လစာအပိုင်းအခြား (ဥ. 300k–450k)?" },
  { key: "commission", q: "Commission ရှိပါသလား? (ရှိ/မရှိ + %/rule)" },
  { key: "hours", q: "အလုပ်ချိန် (ဥ. 9AM–6PM) + Off day?" },
  { key: "location", q: "လုပ်ငန်းတည်နေရာ (မြို့နယ်/လိပ်စာအတို)?" },
  { key: "urgency", q: "အရေးပေါ်အဆင့် (ဥ. Today/This week)?" },
];

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function getBadge(email?: string | null, role?: "free" | "pro" | "plus") {
  if (!email) return null;
  if (email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return { icon: "★", label: "Owner Verified" as const, kind: "owner" as const };
  }
  if (role === "pro" || role === "plus") {
    return { icon: "👑", label: "Pro Verified" as const, kind: "pro" as const };
  }
  return { icon: "✔", label: "Verified" as const, kind: "free" as const };
}

function normalizeYesNo(s: string) {
  const t = s.trim().toLowerCase();
  const yes = ["yes", "y", "ok", "okay", "submit", "confirm", "တင်", "တင်မယ်", "အိုကေ", "ဟုတ်", "ဟုတ်ကဲ့", "လုပ်မယ်"];
  const no = ["no", "n", "cancel", "stop", "မလုပ်", "မတင်", "မတင်ဘူး", "မလို", "မဟုတ်", "ပယ်", "ရပ်"];
  if (yes.some((x) => t === x || t.includes(x))) return "yes";
  if (no.some((x) => t === x || t.includes(x))) return "no";
  return null;
}

type ThemeMode = "light" | "dark";

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaKey>("taurus");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: "free" | "pro" | "plus" } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [intakeKind, setIntakeKind] = useState<IntakeKind | null>(null);
  const [intake, setIntake] = useState<Record<string, any>>({});
  const [awaitingSubmit, setAwaitingSubmit] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Device ID Init
  useEffect(() => {
    try {
      const existing = localStorage.getItem(LS_DEVICE);
      if (!existing) {
        const id = crypto.randomUUID();
        localStorage.setItem(LS_DEVICE, id);
      }
    } catch {}
  }, []);

  // Theme logic
  useEffect(() => {
    const saved = localStorage.getItem(LS_THEME) as ThemeMode | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(LS_THEME, theme);
  }, [theme]);

  // Auth logic
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const session = data.session;
      if (session) {
        const meta: any = session.user.user_metadata || {};
        setAuthed(true);
        setUser({ name: meta.full_name || meta.name || "User", email: session.user.email || "", role: "free" });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        const meta: any = session.user.user_metadata || {};
        setAuthed(true);
        setUser({ name: meta.full_name || meta.name || "User", email: session.user.email || "", role: "free" });
      } else {
        setAuthed(false);
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const personaInfo = useMemo(() => PERSONAS.find((p) => p.key === activePersona)!, [activePersona]);
  const badge = useMemo(() => getBadge(user?.email, user?.role), [user]);

  // --- Image Functions ---
  async function createImage(prompt: string): Promise<{ url: string }> {
    const deviceId = localStorage.getItem(LS_DEVICE) || "unknown";
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token || null;

    const res = await fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ prompt, deviceId }),
    });

    const dataRes = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(String(dataRes?.error ?? "Image create failed"));
    return dataRes as { url: string };
  }

  async function photoCreate() {
    const prompt = window.prompt("ဘယ်လိုပုံမျိုး ဆွဲချင်ပါသလဲ?");
    if (!prompt || !prompt.trim()) return;

    setSending(true);
    try {
      const res = await createImage(prompt);
      if (res && res.url) {
        const aiMsg: Msg = { id: uid(), role: "ai", text: `![AI_PHOTO](${res.url})`, ts: Date.now() };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errMsg: Msg = { id: uid(), role: "ai", text: `❌ Error: ${err.message}`, ts: Date.now() };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }

  // --- Actions ---
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }

  async function logout() {
    await supabase.auth.signOut();
    setAuthed(false);
    setUser(null);
    setMenuOpen(false);
  }

  async function continueGuest() {
    await supabase.auth.signOut().catch(() => {});
    setAuthed(false);
    setUser(null);
  }

  function endChat() {
    setMessages([]);
    setAwaitingSubmit(false);
  }

  function resetIntake() {
    setMode("chat");
    setIntakeKind(null);
    setIntake({});
    setAwaitingSubmit(false);
  }

  function startIntake(kind: IntakeKind) {
    setMode("recruitment");
    setIntakeKind(kind);
    setIntake({});
    setAwaitingSubmit(false);
    setChoiceOpen(false);
    setMenuOpen(false);
    const firstQ = kind === "job" ? JOB_STEPS[0].q : HIRE_STEPS[0].q;
    setMessages([{ id: uid(), role: "ai", text: `✅ Register Mode\n\n${firstQ}`, ts: Date.now() }]);
  }

  async function switchPersona(next: PersonaKey) {
    if (next === activePersona) return;
    if (messages.length > 0) {
      if (!window.confirm("End current chat and switch AI?")) return;
      endChat();
    }
    resetIntake();
    setActivePersona(next);
    setChoiceOpen(false);
    setMenuOpen(false);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Msg = { id: uid(), role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    if (mode === "recruitment" && intakeKind) {
      const yn = awaitingSubmit ? normalizeYesNo(text) : null;
      if (awaitingSubmit) {
        if (yn === "no") {
          setMessages((m) => [...m, { id: uid(), role: "ai", text: "❌ Cancel လုပ်ပြီးပါပြီ။", ts: Date.now() }]);
          resetIntake();
          return;
        }
        if (yn === "yes") {
          setSending(true);
          try {
            await fetch("/api/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: intakeKind, data: intake }) });
            setMessages((m) => [...m, { id: uid(), role: "ai", text: "✅ Submit အောင်မြင်ပါတယ်။", ts: Date.now() }]);
            resetIntake();
          } catch {
            setMessages((m) => [...m, { id: uid(), role: "ai", text: "⚠️ Error occurred. Try again.", ts: Date.now() }]);
          } finally { setSending(false); }
          return;
        }
        setMessages((m) => [...m, { id: uid(), role: "ai", text: "Submit လုပ်မလား? (YES / NO)", ts: Date.now() }]);
        return;
      }

      const steps = intakeKind === "job" ? JOB_STEPS : HIRE_STEPS;
      const missing = steps.find((s) => intake[s.key] == null);
      if (missing) {
        const updated = { ...intake, [missing.key]: text };
        setIntake(updated);
        const nextStep = steps.find((s) => updated[s.key] == null);
        if (nextStep) {
          setMessages((m) => [...m, { id: uid(), role: "ai", text: nextStep.q, ts: Date.now() }]);
        } else {
          setAwaitingSubmit(true);
          setMessages((m) => [...m, { id: uid(), role: "ai", text: "အချက်အလက်တွေ ပြည့်စုံပါပြီ။ Submit လုပ်မလား? (YES/NO)", ts: Date.now() }]);
        }
      }
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, persona: activePersona }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { id: uid(), role: "ai", text: String(data?.reply || "No response"), ts: Date.now() }]);
    } catch {
      setMessages((m) => [...m, { id: uid(), role: "ai", text: "Network error.", ts: Date.now() }]);
    } finally { setSending(false); }
  }

  const headerTitle = mode === "recruitment" ? (intakeKind === "job" ? "Job Registration" : "Employer Request") : personaInfo.title;

  return (
    <main className="min-h-[100dvh] bg-white dark:bg-black relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.05),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <header className="relative z-10 px-4 pt-4">
        <div className="mx-auto max-w-[980px] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">T</div>
             <div>
               <div className="text-[12px] text-zinc-500">Beta</div>
               <div className="text-[14px] font-semibold dark:text-white">{headerTitle}</div>
             </div>
          </div>
          <button onClick={() => setMenuOpen(true)} className="h-10 w-10 rounded-2xl border bg-white/60 dark:bg-zinc-900/55 flex items-center justify-center">
             ☰
          </button>
        </div>
      </header>

      <section className="relative z-10 px-4 pb-[100px] mt-4">
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-3xl border bg-white/60 dark:bg-zinc-900/55 dark:border-white/10 min-h-[60dvh] p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold dark:text-white">Mingalaba!</h2>
                <p className="text-zinc-500 mt-2">{personaInfo.subtitle}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                   <button onClick={() => setChoiceOpen(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-full">Choose AI</button>
                   <button onClick={() => startIntake("job")} className="px-4 py-2 border dark:text-white rounded-full">Find Job</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={classNames("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={classNames("max-w-[80%] px-4 py-2 rounded-2xl", m.role === "user" ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 dark:text-white text-zinc-900")}>
                      {m.text.startsWith("![AI_PHOTO]") ? (
                        <img src={m.text.match(/\((.*?)\)/)?.[1]} alt="AI" className="rounded-lg max-w-full" />
                      ) : (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 z-20 p-4">
        <div className="mx-auto max-w-[980px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border dark:border-white/10 p-2 flex items-end gap-2">
          <button onClick={photoCreate} className="h-11 w-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">📷</button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type here..."
            className="flex-1 bg-transparent border-none outline-none py-2 px-2 dark:text-white resize-none max-h-32"
            rows={1}
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending} className="h-11 px-6 bg-emerald-500 text-white rounded-2xl font-bold disabled:opacity-50">
            {sending ? "..." : "Send"}
          </button>
        </div>
      </footer>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMenuOpen(false)} />
          <aside className="relative w-80 bg-white dark:bg-zinc-900 h-full p-6 shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-xl dark:text-white">Menu</h3>
              <button onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="space-y-4">
              <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="w-full text-left py-2 dark:text-white">
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
              <div className="border-t dark:border-white/10 pt-4">
                <p className="text-xs text-zinc-500 mb-2">Switch AI Assistant</p>
                {PERSONAS.map(p => (
                  <button key={p.key} onClick={() => switchPersona(p.key)} className={classNames("w-full text-left py-2 px-3 rounded-lg mb-1", activePersona === p.key ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "dark:text-white")}>
                    {p.title}
                  </button>
                ))}
              </div>
              {!authed ? (
                <button onClick={signInWithGoogle} className="w-full py-3 bg-blue-600 text-white rounded-xl mt-4">Sign in with Google</button>
              ) : (
                <button onClick={logout} className="w-full py-3 border border-red-200 text-red-500 rounded-xl mt-4">Logout</button>
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}