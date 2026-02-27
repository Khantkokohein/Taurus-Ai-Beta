"use client";

import { useEffect, useMemo, useState } from "react";
import LockGate from "@/components/LockGate";

type Msg = { role: "user" | "ai"; text: string };

export default function Home() {
  // ✅ LockGate persistent (localStorage)
  const [locked, setLocked] = useState(true);

  // ✅ UI overlays
  const [showTC, setShowTC] = useState(false);

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

  function handleNewChat() {
    setMessages([]);
    setInput("");
  }

  // ✅ ESC closes modal
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowTC(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sidebarBtnClass = useMemo(
    () =>
      [
        "w-full text-left px-4 py-3 rounded-xl border transition",
        "bg-emerald-500/15 border-emerald-400/45 text-emerald-200",
        "shadow-[0_0_25px_rgba(34,255,136,0.18)]",
        "hover:shadow-[0_0_35px_rgba(34,255,136,0.30)]",
      ].join(" "),
    []
  );

  const sidebarBtnDimClass = useMemo(
    () =>
      [
        "w-full text-left px-4 py-3 rounded-xl border transition",
        "bg-emerald-500/10 border-emerald-400/25 text-emerald-200/80",
        "shadow-[0_0_18px_rgba(34,255,136,0.12)]",
        "hover:shadow-[0_0_28px_rgba(34,255,136,0.22)]",
      ].join(" "),
    []
  );

  const comingSoonPill = useMemo(
    () =>
      [
        "w-full text-left px-4 py-3 rounded-xl border transition",
        "bg-emerald-500/8 border-emerald-400/20 text-emerald-200/75",
        "shadow-[0_0_14px_rgba(34,255,136,0.10)]",
        "hover:shadow-[0_0_22px_rgba(34,255,136,0.18)]",
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
    <div className="min-h-screen w-full overflow-x-hidden bg-black text-white relative">
      {/* ✅ Lock overlay */}
      {locked && <LockGate onUnlock={handleUnlock} />}

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,255,136,0.14),transparent_65%)]" />

      {/* ✅ Terms & Conditions Modal */}
      {showTC && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            aria-label="Close T&C"
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowTC(false)}
          />
          <div className="relative w-full max-w-3xl rounded-3xl border border-emerald-400/25 bg-black/70 backdrop-blur-2xl shadow-[0_0_60px_rgba(34,255,136,0.20)] overflow-hidden">
            {/* top glass bar */}
            <div className="relative px-6 py-5 border-b border-white/10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(34,255,136,0.20),transparent_60%)]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold text-emerald-200 drop-shadow-[0_0_18px_rgba(34,255,136,0.28)]">
                    Terms & Conditions (Beta)
                  </div>
                  <div className="text-xs text-white/55 mt-1">
                    Effective Date: {new Date().toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => setShowTC(false)}
                  className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 text-sm leading-relaxed text-white/80 max-h-[70vh] overflow-y-auto">
              <p className="text-white/75">
                Welcome to <span className="text-emerald-200 font-semibold">Taurus AI</span>.
                This Beta version is provided to help users consult, plan, and solve problems efficiently—especially for
                brand building, business development, productivity, and strategic decision-making.
              </p>

              <div className="space-y-3">
                <div className="text-emerald-200/90 font-semibold">
                  1) Beta Access & Limitations
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Beta may have limited daily usage, temporary downtime, or feature changes without notice.</li>
                  <li>Some buttons or modules are marked “Coming Soon” and are not active yet.</li>
                  <li>We may refine UI/UX, performance, and features as feedback is collected.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-emerald-200/90 font-semibold">
                  2) Responsible Use
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Do not use Taurus AI to break laws, abuse systems, or harm others.</li>
                  <li>Do not input sensitive personal data, passwords, secret keys, or confidential business secrets.</li>
                  <li>Any output should be reviewed by you before taking real-world action.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-emerald-200/90 font-semibold">
                  3) No Guarantee / No Liability
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Taurus AI provides guidance and suggestions—results may vary.</li>
                  <li>We are not responsible for losses, damages, or decisions taken based on Beta outputs.</li>
                  <li>For critical topics (legal, medical, financial), consult qualified professionals.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-emerald-200/90 font-semibold">
                  4) Future Expansion
                </div>
                <p>
                  Taurus AI is designed for continuous growth. After the Beta phase, we plan to expand into a{" "}
                  <span className="text-emerald-200 font-semibold">Global Version</span> and scale to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Web App (Global Release)</li>
                  <li>iOS App</li>
                  <li>Windows App</li>
                  <li>Extended toolkits and premium upgrades</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-emerald-200/90 font-semibold">
                  5) Brand Promise
                </div>
                <p>
                  Taurus AI aims to be your trusted partner for planning, consultation, and problem solving—
                  supporting your progress across business, brand, productivity, and real-life decisions with clarity and confidence.
                </p>
              </div>

              {/* Signature / stamp-like block */}
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-white/70 text-xs">Official Statement</div>
                    <div className="text-emerald-200 font-semibold">
                      Taurus AI — Beta Terms Acknowledgement
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full border border-emerald-400/30 bg-emerald-500/10 grid place-items-center shadow-[0_0_22px_rgba(34,255,136,0.18)]">
                      <span className="text-emerald-200 text-xs font-semibold">SEAL</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-xs">Project Founder</div>
                      <div className="text-emerald-200 font-semibold">Khant Ko Ko Hein</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-white/55">
                  By using Taurus AI Beta, you acknowledge and agree to these terms.
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowTC(false)}
                className="px-5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                Close
              </button>
              <button
                onClick={() => setShowTC(false)}
                className="px-5 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-200 shadow-[0_0_22px_rgba(34,255,136,0.18)] hover:shadow-[0_0_32px_rgba(34,255,136,0.28)] transition"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Responsive Layout Wrapper */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-screen w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
            {/* Top row (logo + mobile close icon placeholder area) */}
            <div className="flex items-center gap-3">
              {/* Taurus icon */}
              <div className="h-12 w-12 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,255,136,0.28)] grid place-items-center overflow-hidden">
                <img
                  src="/taurus-icon.png"
                  alt="Taurus icon"
                  className="h-8 w-8 object-contain drop-shadow-[0_0_22px_rgba(34,255,136,0.55)]"
                />
              </div>

              {/* Wordmark */}
              <div className="flex-1">
                <img
                  src="/taurus-wordmark.png"
                  alt="Taurus AI"
                  className="h-14 w-auto object-contain drop-shadow-[0_0_30px_rgba(34,255,136,0.45)]"
                />
              </div>

              {/* NOTE: The “X” you circled is likely from a mobile UI / overlay you added earlier.
                 This layout doesn't require it; leaving as spacing-safe. */}
            </div>

            <div className="mt-5 md:mt-6 space-y-3">
              <button onClick={handleNewChat} className={sidebarBtnClass}>
                + New Chat
              </button>

              <button className={sidebarBtnClass}>History (Coming Soon)</button>

              <button className={sidebarBtnClass}>
                Photo Create (Coming Soon)
              </button>

              <button className={sidebarBtnDimClass}>
                Pro / Plus (Coming Soon)
              </button>

              {/* ✅ T&C opens modal */}
              <button onClick={() => setShowTC(true)} className={sidebarBtnClass}>
                T&amp;C
              </button>

              <button onClick={handleLockAgain} className={sidebarBtnDimClass}>
                Lock (test)
              </button>

              {/* ✅ NEW: requested Coming Soon modules */}
              <div className="pt-2 space-y-2">
                <button className={comingSoonPill}>TON Tools (Coming Soon)</button>
                <button className={comingSoonPill}>
                  Next Level Roadmap (Coming Soon)
                </button>
                <button className={comingSoonPill}>
                  Custom Local Shop Database (Coming Soon)
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 md:mt-auto pt-6 text-xs text-white/60 leading-relaxed">
              Free Beta Version • Limited daily usage
              <div className="mt-2 text-emerald-300/90">
                Project Founder:{" "}
                <span className="font-semibold">Khant Ko Ko Hein</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Header Title (✅ glass + atoms) */}
          <div className="px-4 sm:px-6 md:px-10 pt-6 sm:pt-8 md:pt-10">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-500/5 backdrop-blur-xl p-5 sm:p-6 shadow-[0_0_55px_rgba(34,255,136,0.16)]">
              {/* Glass highlight */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,255,136,0.22),transparent_55%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,255,136,0.12),transparent_55%)]" />

              {/* Atoms / particles */}
              <div className="pointer-events-none absolute -top-6 -left-6 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl animate-pulse" />
              <div className="pointer-events-none absolute -bottom-10 right-10 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
              <div className="pointer-events-none absolute top-6 right-6 h-2 w-2 rounded-full bg-emerald-300/60 shadow-[0_0_18px_rgba(34,255,136,0.55)] animate-ping" />
              <div className="pointer-events-none absolute top-16 right-24 h-1.5 w-1.5 rounded-full bg-emerald-300/50 shadow-[0_0_14px_rgba(34,255,136,0.45)] animate-pulse" />
              <div className="pointer-events-none absolute bottom-10 left-16 h-2 w-2 rounded-full bg-emerald-300/50 shadow-[0_0_18px_rgba(34,255,136,0.45)] animate-pulse" />

              <div className="text-3xl font-bold tracking-wide text-emerald-200 drop-shadow-[0_0_18px_rgba(34,255,136,0.30)]">
                TAURUS AI
              </div>
              <div className="text-white/60 mt-1">
                Intelligence. Reimagined.
              </div>
              <div className="text-xs text-white/50 mt-3">
                Beta Edition • Building toward a global-scale assistant for strategy, brand, and business growth.
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-5 md:py-6 space-y-4 flex flex-col">
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

          {/* Inputs (✅ iPhone safe area fix) */}
          <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-3">
            {/* Promo Code Input */}
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter today's promo code"
              className="w-full bg-black/60 backdrop-blur-lg border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-emerald-400/60"
            />

            {/* Message Box */}
            <div className="flex gap-3 sm:gap-4 bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl px-4 py-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder-white/40"
                placeholder="Message Taurus AI..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className={`px-5 sm:px-6 py-2 rounded-xl border transition ${
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
    </div>
  );
}