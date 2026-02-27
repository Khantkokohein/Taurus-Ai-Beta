"use client";

import { useEffect, useMemo, useState } from "react";
import LockGate from "@/components/LockGate";

type Msg = { role: "user" | "ai"; text: string };

export default function Home() {
  // ✅ LockGate persistent (localStorage)
  const [locked, setLocked] = useState(true);

  // ✅ Mobile sidebar drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // show user message immediately
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

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      {/* ✅ Lock overlay */}
      {locked && <LockGate onUnlock={handleUnlock} />}

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,255,136,0.15),transparent_65%)]" />

      {/* ✅ Mobile Top Bar (ONLY on mobile) */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_24px_rgba(34,255,136,0.22)] grid place-items-center overflow-hidden">
            <img
              src="/taurus-icon.png"
              alt="Taurus icon"
              className="h-6 w-6 object-contain drop-shadow-[0_0_18px_rgba(34,255,136,0.55)]"
            />
          </div>

          <div className="leading-tight">
            <div className="text-emerald-200 font-semibold tracking-wide">
              TAURUS AI
            </div>
            <div className="text-xs text-white/60">Intelligence. Reimagined.</div>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="px-3 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(34,255,136,0.18)]"
        >
          Menu
        </button>
      </div>

      {/* ✅ Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ✅ Sidebar (Desktop fixed, Mobile drawer) */}
      <aside
        className={[
          "fixed z-40 top-0 left-0 h-full w-[86vw] max-w-[360px]",
          "border-r border-white/10 bg-black/70 backdrop-blur-xl p-6 flex flex-col",
          "transform transition-transform duration-200",
          "md:translate-x-0 md:static md:z-10 md:w-80 md:max-w-none md:bg-black/60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Close (mobile only) */}
        <div className="flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_26px_rgba(34,255,136,0.25)] grid place-items-center overflow-hidden">
              <img
                src="/taurus-icon.png"
                alt="Taurus icon"
                className="h-7 w-7 object-contain drop-shadow-[0_0_18px_rgba(34,255,136,0.55)]"
              />
            </div>
            <img
              src="/taurus-wordmark.png"
              alt="Taurus AI"
              className="h-10 w-auto object-contain drop-shadow-[0_0_26px_rgba(34,255,136,0.40)]"
            />
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="px-3 py-2 rounded-xl border border-white/10 text-white/80"
          >
            ✕
          </button>
        </div>

        {/* Desktop logo area */}
        <div className="hidden md:flex items-center gap-3">
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
            onClick={() => setSidebarOpen(false)}
          >
            + New Chat
          </button>

          <button className={sidebarBtnClass}>History (Coming Soon)</button>

          <button className={sidebarBtnClass}>Photo Create (Coming Soon)</button>

          <button className={sidebarBtnDimClass}>Pro / Plus (Coming Soon)</button>

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
      </aside>

      {/* ✅ Main (always full width on mobile) */}
      <main className="relative z-10 min-h-screen md:ml-80">
        {/* Desktop Header Title */}
        <div className="hidden md:block px-10 pt-10">
          <div className="text-3xl font-bold tracking-wide text-emerald-200 drop-shadow-[0_0_18px_rgba(34,255,136,0.30)]">
            TAURUS AI
          </div>
          <div className="text-white/60 mt-1">Intelligence. Reimagined.</div>
        </div>

        {/* Messages */}
        <div className="px-4 md:px-10 py-6 space-y-4 flex flex-col min-h-[55vh] md:min-h-[60vh]">
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
        <div className="px-4 md:px-8 pb-8 space-y-3">
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
  );
}