"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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

export default function Page() {
  // -------- UI state --------
  const [menuOpen, setMenuOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaKey>("taurus");

  // Auth UI (Beta: Guest allowed; Global: Login required later)
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: "free" | "pro" | "plus" } | null>(null);

  // T&C + Settings sheets
  const [tcOpen, setTcOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Chat
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Recruitment mode (Intake)
  const [mode, setMode] = useState<Mode>("chat");
  const [intakeKind, setIntakeKind] = useState<IntakeKind | null>(null);
  const [intake, setIntake] = useState<Record<string, any>>({});
  const [awaitingSubmit, setAwaitingSubmit] = useState(false);

  // Scroll anchor
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const personaInfo = useMemo(() => PERSONAS.find((p) => p.key === activePersona)!, [activePersona]);
  const badge = useMemo(() => getBadge(user?.email, user?.role), [user]);

  // -------- helpers --------
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
    // switch to recruitment mode
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

    // End Chat flow before switching
    if (messages.length > 0) {
      const ok = window.confirm("End current chat and switch AI?");
      if (!ok) return;
      endChat();
    }

    // Also exit recruitment mode if switching persona (safety)
    resetIntake();

    setActivePersona(next);
    setChoiceOpen(false);
    setMenuOpen(false);
  }

  function autoGrowTextarea(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`; // cap to avoid huge growth
  }

  async function submitIntake(payload: any) {
    // MVP: submit to /api/intake (you will wire to Supabase/Sheet)
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Submit failed");
    return res.json().catch(() => ({}));
  }

  function nextMissingStep(kind: IntakeKind, data: Record<string, any>) {
    const steps = kind === "job" ? JOB_STEPS : HIRE_STEPS;
    return steps.find((s) => data[s.key] == null || String(data[s.key]).trim() === "") ?? null;
  }

  function buildIntakePayload(kind: IntakeKind, data: Record<string, any>) {
    return {
      kind, // "job" | "hire"
      createdAt: Date.now(),
      source: "taurus_web",
      user: user ? { name: user.name, email: user.email, role: user.role } : { guest: true },
      data,
    };
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Msg = { id: uid(), role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Recruitment mode: step-based intake (no /api/chat)
    if (mode === "recruitment" && intakeKind) {
      const yn = awaitingSubmit ? normalizeYesNo(text) : null;

      // If waiting YES/NO for submit
      if (awaitingSubmit) {
        if (yn === "no") {
          setMessages((m) => [
            ...m,
            {
              id: uid(),
              role: "ai",
              text: "❌ Cancel လုပ်ပြီးပါပြီ။ Register Mode မှ ထွက်ပြီး normal chat ပြန်သွားပါမယ်။",
              ts: Date.now(),
            },
          ]);
          resetIntake();
          return;
        }

        if (yn === "yes") {
          setSending(true);
          try {
            const payload = buildIntakePayload(intakeKind, intake);
            await submitIntake(payload);

            setMessages((m) => [
              ...m,
              {
                id: uid(),
                role: "ai",
                text:
                  "✅ Submit အောင်မြင်ပါတယ်။\n\nကျေးဇူးတင်ပါတယ်။ Owner (Admin) က review လုပ်ပြီး မကြာခင် ဆက်သွယ်ပေးပါမယ်။\n\nRegister Mode ထွက်ပြီး normal chat ပြန်သွားပါမယ်။",
                ts: Date.now(),
              },
            ]);
            resetIntake();
          } catch {
            setMessages((m) => [
              ...m,
              {
                id: uid(),
                role: "ai",
                text:
                  "⚠️ Submit မအောင်မြင်ပါ။ Network/Server ပြဿနာဖြစ်နိုင်ပါတယ်။\n\nYES လို့ ပြန်ပို့ပြီး ထပ်ကြိုးစားလို့ရပါတယ်။ မလိုတော့ရင် NO လို့ပို့ပါ။",
                ts: Date.now(),
              },
            ]);
          } finally {
            setSending(false);
          }
          return;
        }

        // Not recognized as yes/no
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "ai",
            text: "Submit လုပ်မလား? (YES / NO) လို့ပဲ ပြန်ပို့ပေးပါ။",
            ts: Date.now(),
          },
        ]);
        return;
      }

      // Normal step capture
      const missing = nextMissingStep(intakeKind, intake);
      if (!missing) {
        // already complete but not in awaitingSubmit state (edge)
        setAwaitingSubmit(true);
        setMessages((m) => [...m, { id: uid(), role: "ai", text: "Submit လုပ်မလား? (YES / NO)", ts: Date.now() }]);
        return;
      }

      const updated = { ...intake, [missing.key]: text };
      setIntake(updated);

      const next = nextMissingStep(intakeKind, updated);
      if (next) {
        setMessages((m) => [...m, { id: uid(), role: "ai", text: next.q, ts: Date.now() }]);
      } else {
        setAwaitingSubmit(true);
        // Show a compact summary for trust (admin will see full)
        const summary = intakeKind === "job"
          ? `🧾 Summary (Job Seeker)\n• Name: ${updated.name ?? "-"}\n• Phone: ${updated.phone ?? "-"}\n• City: ${updated.city ?? "-"}\n• Exp: ${updated.exp ?? "-"}\n• Salary: ${updated.salary ?? "-"}\n• Start: ${updated.availability ?? "-"}`
          : `🧾 Summary (Employer)\n• Business: ${updated.biz ?? "-"}\n• Phone: ${updated.phone ?? "-"}\n• Position: ${updated.position ?? "-"}\n• Salary: ${updated.salary_range ?? "-"}\n• Commission: ${updated.commission ?? "-"}\n• Hours: ${updated.hours ?? "-"}\n• Location: ${updated.location ?? "-"}\n• Urgency: ${updated.urgency ?? "-"}`;

        setMessages((m) => [
          ...m,
          { id: uid(), role: "ai", text: `${summary}\n\nSubmit လုပ်မလား? (YES / NO)`, ts: Date.now() },
        ]);
      }
      return;
    }

    // normal chat mode (existing)
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, persona: activePersona }),
      });

      const data = await res.json().catch(() => ({}));
      const replyText = String(data?.reply ?? data?.error ?? "No response");

      const aiMsg: Msg = { id: uid(), role: "ai", text: replyText, ts: Date.now() };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      const aiMsg: Msg = { id: uid(), role: "ai", text: "Network error. Please try again.", ts: Date.now() };
      setMessages((m) => [...m, aiMsg]);
    } finally {
      setSending(false);
    }
  }

  // Photo Create (UI both: menu + button). Feature can be Coming Soon.
  function photoCreate() {
    alert("Photo Create (Coming Soon) — beta limited test will be enabled later.");
  }

  // Fake Google login UI (scaffold). Wiring next step with NextAuth.
  function googleLoginMock() {
    // Scaffold behavior: set a demo user (replace with real Google OAuth later)
    setAuthed(true);
    setUser({ name: "Free User", email: "free.user@gmail.com", role: "free" });
  }

  function continueGuest() {
    setAuthed(false);
    setUser(null);
  }

  // Owner quick test (optional)
  function ownerMock() {
    setAuthed(true);
    setUser({ name: "Khant Ko Ko Hein", email: OWNER_EMAIL, role: "free" });
  }

  // Pro mock (optional)
  function proMock() {
    setAuthed(true);
    setUser({ name: "Pro User", email: "pro.user@gmail.com", role: "pro" });
  }

  const headerTitle =
    mode === "recruitment"
      ? intakeKind === "job"
        ? "Taurus Match — Job Registration"
        : "Taurus Match — Employer Request"
      : personaInfo.title;

  const headerSubtitle =
    mode === "recruitment"
      ? "Structured registration • Submit to Admin"
      : personaInfo.subtitle;

  // -------- UI --------
  return (
    <main className="min-h-[100dvh] w-full bg-white text-zinc-900 relative overflow-hidden">
      {/* Subtle glass background tint (no wallpaper, no global stars) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.05),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(16,185,129,0.03),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(0,0,0,0.03),transparent_60%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-4">
        <div className="mx-auto max-w-[980px]">
          <div className="flex items-center justify-between">
            {/* Taurus badge (stars only inside badge) */}
            <div className="flex items-center gap-3">
              <TaurusBadge />
              <div className="leading-tight">
                <div className="text-[12px] text-zinc-500">Beta</div>
                <div className="text-[14px] font-semibold text-zinc-900">{headerTitle}</div>
              </div>
            </div>

            {/* Right: user + menu */}
            <div className="flex items-center gap-3">
              {/* User display */}
              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <div className="flex items-center">
                    <span className="text-[13px] font-semibold text-zinc-900">{user.name}</span>
                    {badge ? <UserBadge icon={badge.icon} label={badge.label} kind={badge.kind} /> : null}
                  </div>
                ) : (
                  <span className="text-[12px] text-zinc-500">Guest Mode</span>
                )}
              </div>

              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(true)}
                className="h-10 w-10 rounded-2xl border border-emerald-200/60 bg-white/60 backdrop-blur-xl
                           shadow-[0_8px_30px_rgba(16,185,129,0.08)] flex items-center justify-center"
                aria-label="Menu"
              >
                <div className="space-y-[4px]">
                  <div className="h-[2px] w-[18px] bg-emerald-700/70 rounded-full" />
                  <div className="h-[2px] w-[18px] bg-emerald-700/55 rounded-full" />
                  <div className="h-[2px] w-[18px] bg-emerald-700/40 rounded-full" />
                </div>
              </button>
            </div>
          </div>

          {/* Login policy strip (professional) */}
          <div className="mt-3 rounded-2xl border border-emerald-200/50 bg-white/55 backdrop-blur-xl px-4 py-3">
            <div className="text-[12px] text-zinc-700">
              <span className="font-semibold text-zinc-900">Sign in with Google</span> to unlock enhanced security and advanced
              features. Taurus AI does not access or store your Gmail content. Your data is never sold or used for advertising.
            </div>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <section className="relative z-10 px-4 pb-[92px]">
        <div className="mx-auto max-w-[980px]">
          <div
            className="mt-4 rounded-3xl border border-emerald-200/55 bg-white/60 backdrop-blur-2xl
                       shadow-[0_12px_60px_rgba(16,185,129,0.09)]"
          >
            {/* Chat header strip */}
            <div className="px-4 py-3 border-b border-emerald-200/35 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-zinc-900">{headerTitle}</span>
                <span className="text-[12px] text-zinc-500">• {headerSubtitle}</span>
              </div>

              <div className="flex items-center gap-2">
                {mode === "recruitment" ? (
                  <button
                    onClick={() => {
                      const ok = window.confirm("Exit Register Mode?");
                      if (ok) {
                        endChat();
                        resetIntake();
                      }
                    }}
                    className="text-[12px] px-3 py-1.5 rounded-full border backdrop-blur-xl border-emerald-200/70 text-emerald-800 bg-white/55 hover:bg-white/70"
                  >
                    Exit
                  </button>
                ) : null}

                <button
                  onClick={() => {
                    if (messages.length === 0) return;
                    const ok = window.confirm("End this chat?");
                    if (ok) endChat();
                  }}
                  className={classNames(
                    "text-[12px] px-3 py-1.5 rounded-full border backdrop-blur-xl",
                    messages.length === 0
                      ? "border-zinc-200/60 text-zinc-400 bg-white/40 cursor-not-allowed"
                      : "border-emerald-200/70 text-emerald-800 bg-white/55 hover:bg-white/70"
                  )}
                  disabled={messages.length === 0}
                >
                  End Chat
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[60dvh] md:h-[62dvh] overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <EmptyState
                  personaTitle={personaInfo.title}
                  subtitle={personaInfo.subtitle}
                  onChoice={() => setChoiceOpen(true)}
                  onStartJob={() => startIntake("job")}
                  onStartHire={() => startIntake("hire")}
                />
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} role={m.role} text={m.text} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Input bar fixed bottom (safe-area aware) */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
        <div className="mx-auto max-w-[980px]">
          <div
            className="rounded-3xl border border-emerald-200/60 bg-white/70 backdrop-blur-2xl
                       shadow-[0_12px_50px_rgba(16,185,129,0.10)] px-3 py-3"
          >
            <div className="flex items-end gap-2">
              {/* Left icon: in recruitment mode show quick actions */}
              {mode === "recruitment" ? (
                <button
                  onClick={() => {
                    // quick restart intake
                    const ok = window.confirm("Restart this registration?");
                    if (!ok) return;
                    if (intakeKind) startIntake(intakeKind);
                  }}
                  className="h-11 w-11 rounded-2xl border border-emerald-200/70 bg-white/65 backdrop-blur-xl flex items-center justify-center text-[16px]"
                  aria-label="Restart"
                  title="Restart registration"
                >
                  ↻
                </button>
              ) : (
                <button
                  onClick={photoCreate}
                  className="h-11 w-11 rounded-2xl border border-emerald-200/70 bg-white/65 backdrop-blur-xl
                             flex items-center justify-center text-[18px]"
                  aria-label="Photo Create"
                  title="Photo Create (Coming Soon)"
                >
                  📷
                </button>
              )}

              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoGrowTextarea(e.currentTarget);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={mode === "recruitment" ? "အဖြေကိုရေးပြီး Enter နှိပ်ပါ…" : "Type a message…"}
                  className="w-full resize-none rounded-2xl border border-emerald-200/60 bg-white/75
                             px-4 py-3 text-[14px] outline-none
                             focus:border-emerald-300/80"
                  rows={1}
                />
                <div className="mt-1 flex items-center justify-between px-1">
                  <span className="text-[11px] text-zinc-500">
                    {mode === "recruitment" ? "Register Mode • Structured intake" : "Glass White • Green accent only"}
                  </span>
                  <span className="text-[11px] text-zinc-500">{sending ? "Thinking…" : " "}</span>
                </div>
              </div>

              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className={classNames(
                  "h-11 px-4 rounded-2xl border backdrop-blur-xl text-[13px] font-semibold",
                  !input.trim() || sending
                    ? "border-zinc-200/70 bg-white/55 text-zinc-400 cursor-not-allowed"
                    : "border-emerald-200/80 bg-white/75 text-emerald-800 hover:bg-white/90"
                )}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Menu Drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/15" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-[86%] max-w-[380px] bg-white/75 backdrop-blur-2xl border-l border-emerald-200/60 shadow-[0_0_60px_rgba(16,185,129,0.12)]">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TaurusBadge small />
                  <div>
                    <div className="text-[13px] font-semibold text-zinc-900">Menu</div>
                    <div className="text-[12px] text-zinc-500">Clean • Minimal • Glass</div>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="h-10 w-10 rounded-2xl border border-emerald-200/70 bg-white/70 backdrop-blur-xl"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Quick actions */}
              <div className="mt-4 space-y-2">
                <GlassButton
                  onClick={() => startIntake("job")}
                  title="Job Seeker Register"
                >
                  Request Job (Register)
                </GlassButton>
                <GlassButton
                  onClick={() => startIntake("hire")}
                  title="Employer Request"
                  subtle
                >
                  Request Employee (Register)
                </GlassButton>
              </div>

              {/* Account block */}
              <div className="mt-4 rounded-2xl border border-emerald-200/60 bg-white/65 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] text-zinc-500">Account</div>
                    {user ? (
                      <div className="mt-1">
                        <div className="text-[13px] font-semibold text-zinc-900">{user.name}</div>
                        <div className="text-[12px] text-zinc-500">{user.email}</div>
                      </div>
                    ) : (
                      <div className="mt-1 text-[13px] font-semibold text-zinc-900">Guest</div>
                    )}
                  </div>

                  <div className="text-right">{badge ? <UserBadge icon={badge.icon} label={badge.label} kind={badge.kind} /> : null}</div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <GlassButton onClick={googleLoginMock} title="Sign in with Google (UI scaffold)">
                    Sign in with Google
                  </GlassButton>
                  <GlassButton onClick={continueGuest} subtle>
                    Continue as Guest
                  </GlassButton>

                  {/* Optional mock controls for testing badges */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <GlassButton onClick={ownerMock} subtle>
                      Owner (test)
                    </GlassButton>
                    <GlassButton onClick={proMock} subtle>
                      Pro (test)
                    </GlassButton>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-zinc-600">
                  Login unlocks enhanced security and advanced features. We do not access your Gmail content.
                </div>
              </div>

              {/* Primary actions */}
              <div className="mt-4 space-y-2">
                <GlassButton
                  onClick={() => {
                    setChoiceOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Choice AI Assistant
                </GlassButton>

                <GlassButton
                  onClick={() => {
                    if (messages.length > 0) {
                      const ok = window.confirm("End current chat first?");
                      if (!ok) return;
                      endChat();
                    }
                    setChoiceOpen(true);
                    setMenuOpen(false);
                  }}
                  subtle
                >
                  End Chat & Choose AI
                </GlassButton>

                <GlassButton onClick={photoCreate}>Photo Create (Coming Soon)</GlassButton>

                <ComingSoonItem label="History (Coming Soon)" />
                <ComingSoonItem label="Pro / Plus (Coming Soon)" />
                <ComingSoonItem label="TON Tools (Coming Soon)" />
                <ComingSoonItem label="Next Level Roadmap (Coming Soon)" />
                <ComingSoonItem label="Custom Local Shop Database (Coming Soon)" />
                <ComingSoonItem label="Google Map Shop Tracker (Coming Soon)" />
              </div>

              {/* Persona shortcuts (Confirmed: Yes) */}
              <div className="mt-5">
                <div className="text-[12px] font-semibold text-zinc-900">Persona Shortcuts</div>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {PERSONAS.filter((p) => p.key !== "friend").map((p) => (
                    <GlassButton key={p.key} onClick={() => switchPersona(p.key)} subtle={p.key !== activePersona}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[13px] font-semibold">{p.title}</span>
                        <span className="text-[12px] text-zinc-500">{p.tone}</span>
                      </div>
                    </GlassButton>
                  ))}
                </div>
              </div>

              {/* Legal / Settings */}
              <div className="mt-5 space-y-2">
                <GlassButton
                  onClick={() => {
                    setTcOpen(true);
                    setMenuOpen(false);
                  }}
                  subtle
                >
                  T&C
                </GlassButton>
                <GlassButton
                  onClick={() => {
                    setSettingsOpen(true);
                    setMenuOpen(false);
                  }}
                  subtle
                >
                  Settings
                </GlassButton>

                <div className="pt-2 text-[11px] text-zinc-500">
                  Founder: <span className="font-semibold text-zinc-800">Khant Ko Ko Hein</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Choice AI Assistant Overlay */}
      {choiceOpen ? (
        <ModalShell title="Choice AI Assistant" onClose={() => setChoiceOpen(false)}>
          <div className="grid grid-cols-1 gap-3">
            {PERSONAS.map((p) => (
              <button
                key={p.key}
                onClick={() => switchPersona(p.key)}
                className={classNames(
                  "w-full text-left rounded-3xl border bg-white/70 backdrop-blur-2xl px-4 py-4",
                  p.key === activePersona ? "border-emerald-300/75" : "border-emerald-200/55"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-extrabold text-zinc-900">{p.title}</div>
                    <div className="text-[12px] text-zinc-600 mt-1">{p.subtitle}</div>
                  </div>
                  <span className="text-[12px] text-zinc-500">{p.tone}</span>
                </div>
                <div className="mt-3 text-[11px] text-zinc-500">
                  Tap to start a new chat. If you have an active chat, End Chat confirmation will appear.
                </div>
              </button>
            ))}
          </div>
        </ModalShell>
      ) : null}

      {/* T&C Sheet */}
      {tcOpen ? (
        <ModalShell title="Terms & Conditions" onClose={() => setTcOpen(false)}>
          <div className="space-y-3 text-[13px] text-zinc-700 leading-relaxed">
            <p className="font-semibold text-zinc-900">TAURUS AI — Beta Terms</p>
            <p>
              Taurus AI is a beta product. Features may change without notice. We aim to provide accurate responses, but outputs may contain errors.
              Use critical judgment for important decisions.
            </p>
            <p>
              <span className="font-semibold">Privacy:</span> We do not access or store your Gmail content. We do not sell personal data or use it for
              advertising. (Full privacy page can be added later.)
            </p>
            <p className="text-[12px] text-zinc-500">Founder: Khant Ko Ko Hein</p>
          </div>
        </ModalShell>
      ) : null}

      {/* Settings Sheet */}
      {settingsOpen ? (
        <ModalShell title="Settings" onClose={() => setSettingsOpen(false)}>
          <div className="space-y-3 text-[13px] text-zinc-700 leading-relaxed">
            <SettingRow title="Security & Password" desc="(Coming Soon) Pattern/PIN lock + session security." />
            <SettingRow title="Dark Mode" desc="(Coming Soon) Glass mode switch + theme control." />
            <SettingRow title="Version Upgrade" desc="(Coming Soon) Provider upgrades + performance improvements." />
            <SettingRow title="About" desc="TAURUS AI — Born in Myanmar. Built for the World." />
          </div>
        </ModalShell>
      ) : null}
    </main>
  );
}

/* ---------------- Components ---------------- */

function TaurusBadge({ small }: { small?: boolean }) {
  // Stars ONLY inside badge; no global stars.
  return (
    <div
      className={classNames(
        "relative overflow-hidden rounded-2xl border border-emerald-300/60 bg-white/55 backdrop-blur-2xl",
        small ? "h-10 w-28" : "h-12 w-32"
      )}
      aria-label="TAURUS AI badge"
      title="TAURUS AI"
    >
      <div className="absolute inset-0">
        <TwinkleStars />
      </div>
      <div className="relative z-10 h-full w-full flex items-center justify-center">
        <span
          className={classNames(
            "font-extrabold tracking-[0.18em] text-emerald-700/90",
            small ? "text-[11px]" : "text-[12px]"
          )}
        >
          TAURUS AI
        </span>
      </div>
    </div>
  );
}

function TwinkleStars() {
  // Lightweight CSS-only twinkle/fall effect
  return (
    <div className="absolute inset-0">
      {/* tiny stars */}
      <span className="star s1" />
      <span className="star s2" />
      <span className="star s3" />
      <span className="star s4" />
      {/* falling star */}
      <span className="fall f1" />
      <style jsx>{`
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.25);
          opacity: 0.9;
          animation: twinkle 1.8s infinite ease-in-out;
        }
        .s1 {
          top: 28%;
          left: 18%;
          animation-delay: 0.1s;
        }
        .s2 {
          top: 48%;
          left: 55%;
          animation-delay: 0.6s;
          opacity: 0.75;
        }
        .s3 {
          top: 22%;
          left: 72%;
          animation-delay: 1s;
          opacity: 0.8;
        }
        .s4 {
          top: 64%;
          left: 32%;
          animation-delay: 1.4s;
          opacity: 0.7;
        }

        .fall {
          position: absolute;
          width: 26px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.95));
          opacity: 0.65;
          transform: rotate(-18deg);
          animation: fall 3.2s infinite ease-in-out;
          filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.18));
        }
        .f1 {
          top: 18%;
          left: -10%;
        }

        @keyframes twinkle {
          0%,
          100% {
            transform: scale(0.9);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.95;
          }
        }
        @keyframes fall {
          0% {
            transform: translateX(-20%) translateY(0) rotate(-18deg);
            opacity: 0;
          }
          15% {
            opacity: 0.65;
          }
          55% {
            opacity: 0.65;
          }
          100% {
            transform: translateX(160%) translateY(40%) rotate(-18deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function UserBadge({
  icon,
  label,
  kind,
}: {
  icon: string;
  label: string;
  kind: "owner" | "pro" | "free";
}) {
  const border =
    kind === "owner"
      ? "border-emerald-300/65 text-emerald-800"
      : kind === "pro"
        ? "border-emerald-300/55 text-emerald-800"
        : "border-emerald-200/60 text-emerald-700";

  return (
    <span
      className={classNames(
        "ml-2 inline-flex items-center gap-1 rounded-full border bg-white/60 backdrop-blur-xl px-2 py-[2px] text-[11px] tracking-wide",
        border
      )}
    >
      <span className="text-[11px]">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function GlassButton({
  children,
  onClick,
  subtle,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  subtle?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={classNames(
        "w-full rounded-2xl border backdrop-blur-2xl px-4 py-3 text-left transition",
        subtle ? "border-emerald-200/55 bg-white/55 hover:bg-white/70" : "border-emerald-300/70 bg-white/70 hover:bg-white/90",
        "shadow-[0_10px_35px_rgba(16,185,129,0.08)]"
      )}
    >
      <div className="text-[13px] font-semibold text-zinc-900">{children}</div>
    </button>
  );
}

function ComingSoonItem({ label }: { label: string }) {
  return (
    <div className="w-full rounded-2xl border border-zinc-200/70 bg-white/45 backdrop-blur-xl px-4 py-3">
      <div className="text-[13px] font-semibold text-zinc-500">{label}</div>
    </div>
  );
}

function EmptyState({
  personaTitle,
  subtitle,
  onChoice,
  onStartJob,
  onStartHire,
}: {
  personaTitle: string;
  subtitle: string;
  onChoice: () => void;
  onStartJob: () => void;
  onStartHire: () => void;
}) {
  return (
    <div className="py-10 text-center">
      <div className="text-[18px] font-extrabold text-zinc-900">{personaTitle}</div>
      <div className="mt-2 text-[13px] text-zinc-600">{subtitle}</div>

      <div className="mt-6 max-w-[560px] mx-auto text-[12px] text-zinc-600 leading-relaxed">
        Messages are bottom-anchored. Input is fixed to the very bottom with safe-area support. Green is used only as borders and small accents.
      </div>

      <div className="mt-6 flex flex-col gap-2 items-center">
        <button
          onClick={onStartJob}
          className="w-full max-w-[360px] rounded-2xl border border-emerald-300/70 bg-white/70 backdrop-blur-2xl px-5 py-3
                     shadow-[0_12px_45px_rgba(16,185,129,0.10)] text-[13px] font-semibold text-emerald-800"
        >
          အလုပ်လျှောက်မည် (Request Job)
        </button>

        <button
          onClick={onStartHire}
          className="w-full max-w-[360px] rounded-2xl border border-emerald-200/60 bg-white/55 backdrop-blur-2xl px-5 py-3
                     shadow-[0_12px_45px_rgba(16,185,129,0.08)] text-[13px] font-semibold text-zinc-900"
        >
          ဝန်ထမ်းလိုသည် (Request Employee)
        </button>

        <button
          onClick={onChoice}
          className="mt-2 rounded-2xl border border-emerald-200/60 bg-white/55 backdrop-blur-2xl px-5 py-3
                     text-[13px] font-semibold text-emerald-800"
        >
          Choice AI Assistant
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ role, text }: { role: "user" | "ai"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={classNames("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={classNames("max-w-[86%] rounded-3xl px-4 py-3 border backdrop-blur-2xl bg-white/75", isUser ? "border-emerald-300/55" : "border-emerald-200/45")}>
        <div className="text-[14px] text-zinc-900 leading-relaxed whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/15" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-0 right-0 top-0 bottom-0 flex items-end sm:items-center justify-center p-4">
        <div className="w-full max-w-[720px] rounded-3xl border border-emerald-200/65 bg-white/80 backdrop-blur-2xl shadow-[0_0_70px_rgba(16,185,129,0.12)] overflow-hidden">
          <div className="px-4 py-3 border-b border-emerald-200/40 flex items-center justify-between">
            <div className="text-[13px] font-semibold text-zinc-900">{title}</div>
            <button onClick={onClose} className="h-10 w-10 rounded-2xl border border-emerald-200/70 bg-white/70 backdrop-blur-xl" aria-label="Close">
              ✕
            </button>
          </div>
          <div className="p-4 max-h-[74dvh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200/55 bg-white/60 backdrop-blur-2xl p-4">
      <div className="text-[13px] font-semibold text-zinc-900">{title}</div>
      <div className="mt-1 text-[12px] text-zinc-600">{desc}</div>
    </div>
  );
}