"use client";

import { useEffect, useMemo, useState } from "react";
import LockGate from "@/components/LockGate";

type Msg = { role: "user" | "ai"; text: string };

export default function Home() {
  // ✅ LockGate persistent (localStorage)
  const [locked, setLocked] = useState(true);

  // ✅ Mobile drawer
  const [menuOpen, setMenuOpen] = useState(false);

  // Chat states
  const [promoCode, setPromoCode] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ on first load: check unlock
  useEffect(() => {
    const isUnlocked =
      typeof window !== "undefined"
        ? localStorage.getItem("taurus_unlocked") === "1"
        : false;
    setLocked(!isUnlocked);
  }, []);

  // ✅ prevent body scroll when menu open (mobile)
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleUnlock() {
    localStorage.setItem("taurus_unlocked", "1");
    setLocked(false);
  }

  function handleLockAgain() {
    localStorage.removeItem("taurus_unlocked");
    setLocked(true);
  }

  const sidebarBtnClass = useMemo(
    () =>
      [
        "w-full text-left px-4 py-3 rounded-xl border transition",
        "bg-emerald-500/15 border-emerald-400/50 text-emerald-200",
        "shadow-[0_0_25px_rgba(34,255,136,0.18)]",
        "hover:shadow-[0_0_35px_rgba(34,255,136,0.30)]",
      ].join(" "),
    []
  );

  const sidebarBtnDimClass = useMemo(
    () =>
      [
        "w-full text-left px-4 py-3 rounded-xl border transition",
        "bg-emerald-500/10 border-emerald-400/30 text-emerald-200/80",
        "shadow-[0_0_18px_rgba(34,255,136,0.12)]",
        "hover:shadow-[0_0_28px_rgba(34,255,136,0.22)]",
      ].join(" "),
    []
  );

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, promoCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text:
              data?.reply ||
              data?.error ||
              `Error (${res.status}). Please try again.`,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data?.reply || "No response" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error connecting to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sidebar content reused (Desktop + Mobile drawer)
  const SidebarContent = () => (
    <>
      {/* Logo area */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,255,136,0.28)] grid place-items-center overflow-hidden">
          <img
            src="/taurus-icon.png"
            alt="Taurus icon"
            className="h-8 w-8 object-contain drop-shadow-[0_0_22px_rgba(34,255,136,0.55)]"
          />
        </div>

        <div className="flex-1">
          <img
            src="/taurus-wordmark.png"
            alt="Taurus AI"
            className="h-14 w-auto object-contain drop-shadow-[0_0_30px_rgba(34,255,136,0.45)]"
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          className={sidebarBtnClass}
          onClick={() => setMenuOpen(false)}
        >
          + New Chat
        </button>

        <button className={sidebarBtnClass}>History (Coming Soon)</button>
        <button className={sidebarBtnClass}>Photo Create (Coming Soon)</button>
        <button className={sidebarBtnDimClass}>Pro / Plus (Coming Soon)</button>

        <button className={sidebarBtnClass}>TON Tools (Coming Soon)</button>
        <button className={sidebarBtnClass}>
          Next Level Roadmap (Coming Soon)
        </button>
        <button className={sidebarBtnClass}>
          Custom Local Shop Database (Coming Soon)
        </button>

        <button className={sidebarBtnClass}>T&amp;C</button>

        <button onClick={handleLockAgain} className={sidebarBtnDimClass}>
          Lock (test)
        </button>
      </div>

      <div className="mt-auto pt-6 text-xs text-white/60 leading-relaxed">
        Free Beta Version • Limited daily usage
        <div className="mt-2 text-emerald-300/90">
          Project Founder:{" "}
          <span className="font-semibold">Khant Ko Ko Hein</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black text-white relative">
      {/* ✅ Lock overlay */}
      {locked && <LockGate onUnlock={handleUnlock} />}

      {/* Ambient + Particle-ish Background (CSS only) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,255,136,0.16),transparent_60%)]" />
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(34,255,136,0.10),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(34,255,136,0.08),transparent_40%),radial-gradient(circle_at_60%_80%,rgba(34,255,136,0.06),transparent_45%)] animate-[taGlow_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-20 animate-[taDots_14s_linear_infinite]" />
      </div>

      {/* Top bar (mobile) */}
      <div className="relative z-20 md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <button
          onClick={() => setMenuOpen(true)}
          className="px-3 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 shadow-[0_0_20px_rgba(34,255,136,0.18)]"
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/taurus-wordmark.png"
            alt="Taurus AI"
            className="h-8 w-auto object-contain drop-shadow-[0_0_20px_rgba(34,255,136,0.40)]"
          />
        </div>

        <div className="w-10" />
      </div>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[360px] bg-black/75 backdrop-blur-xl border-r border-white/10 p-5 flex flex-col animate-[taSlideIn_180ms_ease-out]">
            <div className="flex items-center justify-between">
              <div className="text-emerald-200/90 text-sm">
                Menu
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white/80"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex-1 flex flex-col">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Layout wrapper */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-full md:w-80 shrink-0 border-r border-white/10 bg-black/60 backdrop-blur-xl p-6 flex-col">
          <SidebarContent />
        </aside>

        {/* Main */}
        <main className="flex-1 w-full min-w-0 flex flex-col">
          {/* Header Title */}
          <div className="px-5 md:px-10 pt-6 md:pt-10">
            <div className="text-3xl font-bold tracking-wide text-emerald-200 drop-shadow-[0_0_18px_rgba(34,255,136,0.30)]">
              TAURUS AI
            </div>
            <div className="text-white/60 mt-1">Intelligence. Reimagined.</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 md:px-10 py-6 space-y-4 flex flex-col">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-2xl px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "ml-auto bg-emerald-500/20 border border-emerald-400 shadow-[0_0_20px_rgba(34,255,136,0.12)]"
                    : "bg-white/10 border border-white/10"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="max-w-xl px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white/70">
                Taurus AI is thinking...
              </div>
            )}
          </div>

          {/* Inputs */}
          <div className="px-5 md:px-8 pb-6 md:pb-8 space-y-3">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter today's promo code"
              className="w-full bg-black/60 backdrop-blur-lg border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-emerald-400/60"
            />

            <div className="flex gap-3 md:gap-4 bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl px-4 py-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-white/40"
                placeholder="Message Taurus AI..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className={`px-5 md:px-6 py-2 rounded-xl border transition ${
                  loading
                    ? "opacity-60 cursor-not-allowed border-white/20 text-white/60"
                    : "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(34,255,136,0.18)] hover:shadow-[0_0_35px_rgba(34,255,136,0.28)]"
                }`}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* keyframes */}
      <style jsx global>{`
        @keyframes taSlideIn {
          from { transform: translateX(-8px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes taGlow {
          0%, 100% { filter: blur(0px); opacity: 0.70; }
          50% { filter: blur(0.6px); opacity: 0.95; }
        }
        @keyframes taDots {
          from { transform: translateY(0px); }
          to { transform: translateY(-28px); }
        }
      `}</style>
    </div>
  );
}