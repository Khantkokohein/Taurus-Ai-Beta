"use client";

import { useEffect, useMemo, useState } from "react";
import LockGate from "@/components/LockGate";

type Msg = { role: "user" | "ai"; text: string };

export default function Home() {
  // LockGate persistent
  const [locked, setLocked] = useState(true);

  // Mobile drawer
  const [menuOpen, setMenuOpen] = useState(false);

  // T&C modal
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Chat states
  const [promoCode, setPromoCode] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  // On first load: lock + terms
  useEffect(() => {
    const isUnlocked =
      typeof window !== "undefined"
        ? localStorage.getItem("taurus_unlocked") === "1"
        : false;
    setLocked(!isUnlocked);

    const accepted =
      typeof window !== "undefined"
        ? localStorage.getItem("taurus_terms_accepted") === "1"
        : false;
    setTermsAccepted(accepted);
  }, []);

  // Prevent body scroll when drawer open
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
    setMenuOpen(false);
  }

  function openTerms() {
    setTermsOpen(true);
  }
  function closeTerms() {
    setTermsOpen(false);
  }
  function agreeTerms() {
    localStorage.setItem("taurus_terms_accepted", "1");
    setTermsAccepted(true);
    setTermsOpen(false);
  }

  const sidebarBtnClass = useMemo(
    () =>
      [
        "w-full text-left px-4 py-3 rounded-2xl border transition",
        "bg-emerald-500/12 border-emerald-400/35 text-emerald-100",
        "shadow-[0_0_26px_rgba(34,255,136,0.16)]",
        "hover:shadow-[0_0_38px_rgba(34,255,136,0.26)]",
        "hover:border-emerald-300/50",
      ].join(" "),
    []
  );

  const sidebarBtnDimClass = useMemo(
    () =>
      [
        "w-full text-left px-4 py-3 rounded-2xl border transition",
        "bg-emerald-500/8 border-emerald-400/25 text-emerald-100/75",
        "shadow-[0_0_18px_rgba(34,255,136,0.10)]",
        "hover:shadow-[0_0_28px_rgba(34,255,136,0.18)]",
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

  // Sidebar content reused (Desktop + Mobile drawer)
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

        {/* (Optional) if you want later */}
        <button className={sidebarBtnDimClass}>
          Google Map Shop Tracker (Coming Soon)
        </button>

        <button
          className={sidebarBtnClass}
          onClick={() => {
            setMenuOpen(false);
            openTerms();
          }}
        >
          T&amp;C
          {!termsAccepted && (
            <span className="ml-2 text-[11px] text-emerald-200/80">
              (Read)
            </span>
          )}
        </button>

        <button
          onClick={handleLockAgain}
          className={sidebarBtnDimClass}
        >
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

  const HeroGlass = () => (
    <div className="relative">
      <div className="rounded-3xl border border-emerald-300/25 bg-emerald-500/10 backdrop-blur-xl shadow-[0_0_55px_rgba(34,255,136,0.14)] overflow-hidden">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_30%_20%,rgba(34,255,136,0.22),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(34,255,136,0.12),transparent_55%)] animate-[taGlow_8s_ease-in-out_infinite]" />
        <div className="relative px-6 md:px-8 py-6 md:py-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold tracking-wide text-emerald-200 drop-shadow-[0_0_20px_rgba(34,255,136,0.28)] animate-[taShimmer_3.8s_ease-in-out_infinite]">
                TAURUS AI
              </div>
              <div className="text-white/65 mt-2 text-lg md:text-xl">
                Intelligence. Reimagined.
              </div>
              <div className="text-white/45 mt-3 text-sm md:text-[15px] leading-relaxed max-w-[70ch]">
                Beta Edition • Building toward a global-scale assistant for
                strategy, brand, and business growth.
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70 shadow-[0_0_18px_rgba(34,255,136,0.35)] animate-[taPulse_2.2s_ease-in-out_infinite]" />
              <span className="text-xs text-emerald-200/70">Beta</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TermsModal = () =>
    termsOpen ? (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/70"
          onClick={closeTerms}
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-[920px] rounded-3xl border border-emerald-300/25 bg-black/70 backdrop-blur-2xl shadow-[0_0_70px_rgba(34,255,136,0.14)] overflow-hidden">
            {/* Header */}
            <div className="relative px-5 md:px-7 py-4 border-b border-white/10">
              <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_25%_15%,rgba(34,255,136,0.20),transparent_45%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-emerald-200">
                    Terms &amp; Conditions (Beta)
                  </div>
                  <div className="text-white/55 mt-1 text-sm">
                    Effective Date: 27/02/2026
                  </div>
                </div>

                <button
                  onClick={closeTerms}
                  className="relative px-4 py-2 rounded-2xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 md:px-7 py-5 max-h-[70vh] overflow-y-auto">
              <div className="text-white/75 leading-relaxed">
                <p>
                  Welcome to <span className="text-emerald-200 font-semibold">Taurus AI</span>.
                  This Beta version is provided to help users consult, plan,
                  and solve problems efficiently—especially for brand building,
                  business development, productivity, and strategic decision-making.
                </p>

                <h3 className="mt-6 text-emerald-200 font-bold text-lg">
                  1) Beta Access &amp; Limitations
                </h3>
                <ul className="mt-2 list-disc pl-6 space-y-2 text-white/70">
                  <li>Beta may have limited daily usage, temporary downtime, or feature changes without notice.</li>
                  <li>Some buttons or modules are marked “Coming Soon” and are not active yet.</li>
                  <li>We may refine UI/UX, performance, and features as feedback is collected.</li>
                </ul>

                <h3 className="mt-6 text-emerald-200 font-bold text-lg">
                  2) Responsible Use
                </h3>
                <ul className="mt-2 list-disc pl-6 space-y-2 text-white/70">
                  <li>Do not use Taurus AI to break laws, abuse systems, or harm others.</li>
                  <li>Do not input sensitive personal data, passwords, secret keys, or confidential business secrets.</li>
                  <li>Any output should be reviewed by you before taking real-world action.</li>
                </ul>

                <h3 className="mt-6 text-emerald-200 font-bold text-lg">
                  3) No Guarantee / No Liability
                </h3>
                <ul className="mt-2 list-disc pl-6 space-y-2 text-white/70">
                  <li>Outputs are provided “as-is” and results may vary.</li>
                  <li>We are not responsible for losses, damages, or decisions taken based on Beta outputs.</li>
                  <li>For critical topics (legal, medical, financial), consult qualified professionals.</li>
                </ul>

                <h3 className="mt-6 text-emerald-200 font-bold text-lg">
                  4) Future Expansion
                </h3>
                <p className="mt-2 text-white/70">
                  Taurus AI is designed for continuous growth. After the Beta phase,
                  we plan to expand into a <span className="text-emerald-200 font-semibold">Global Version</span> and scale to:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-2 text-white/70">
                  <li>Web App (Global Release)</li>
                  <li>iOS App</li>
                  <li>Windows App</li>
                  <li>Extended toolkits and premium upgrades</li>
                </ul>

                <h3 className="mt-6 text-emerald-200 font-bold text-lg">
                  5) Brand Promise
                </h3>
                <p className="mt-2 text-white/70">
                  Taurus AI aims to be your trusted partner for planning, consultation,
                  and problem solving—supporting your progress across business, brand,
                  productivity, and real-life decisions with clarity and confidence.
                </p>

                {/* Official Statement Card */}
                <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-500/8 backdrop-blur-xl shadow-[0_0_55px_rgba(34,255,136,0.10)] p-5 md:p-6">
                  <div className="text-white/55 text-xs uppercase tracking-wider">
                    Official Statement
                  </div>
                  <div className="mt-1 text-emerald-200 font-bold text-xl">
                    Taurus AI — Beta Terms Acknowledgement
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full border border-emerald-300/25 bg-emerald-500/10 grid place-items-center text-emerald-200 font-bold shadow-[0_0_30px_rgba(34,255,136,0.14)]">
                      SEAL
                    </div>
                    <div>
                      <div className="text-white/55 text-sm">Project Founder</div>
                      <div className="text-emerald-200 font-semibold text-lg">
                        Khant Ko Ko Hein
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-white/60 text-sm">
                    By using Taurus AI Beta, you acknowledge and agree to these terms.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 md:px-7 py-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={closeTerms}
                className="px-6 py-3 rounded-2xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              >
                Close
              </button>
              <button
                onClick={agreeTerms}
                className="px-6 py-3 rounded-2xl border border-emerald-300/35 bg-emerald-500/15 text-emerald-100 shadow-[0_0_30px_rgba(34,255,136,0.18)] hover:shadow-[0_0_42px_rgba(34,255,136,0.26)]"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-black text-white relative">
      {/* Lock overlay */}
      {locked && <LockGate onUnlock={handleUnlock} />}

      {/* T&C modal */}
      <TermsModal />

      {/* Ambient + particles background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,255,136,0.16),transparent_60%)]" />
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(34,255,136,0.10),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(34,255,136,0.08),transparent_40%),radial-gradient(circle_at_60%_80%,rgba(34,255,136,0.06),transparent_45%)] animate-[taGlow_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-20 animate-[taDots_14s_linear_infinite]" />
      </div>

      {/* Mobile top bar (ONLY on mobile) */}
      <div className="relative z-20 md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <button
          onClick={() => setMenuOpen(true)}
          className="px-3 py-2 rounded-2xl border border-emerald-300/35 bg-emerald-500/10 text-emerald-100 shadow-[0_0_22px_rgba(34,255,136,0.16)]"
          aria-label="Open menu"
        >
          ☰
        </button>

        <img
          src="/taurus-wordmark.png"
          alt="Taurus AI"
          className="h-8 w-auto object-contain drop-shadow-[0_0_20px_rgba(34,255,136,0.40)]"
        />

        <div className="w-10" />
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[380px] bg-black/75 backdrop-blur-xl border-r border-white/10 p-5 flex flex-col animate-[taSlideIn_180ms_ease-out]">
            <div className="flex items-center justify-between">
              <div className="text-emerald-200/90 text-sm">Menu</div>
              <button
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-2xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
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

      {/* Desktop layout (sidebar + main). Mobile: main only */}
      <div className="relative z-10 flex min-h-[100dvh]">
        {/* Desktop sidebar only */}
        <aside className="hidden md:flex w-80 shrink-0 border-r border-white/10 bg-black/60 backdrop-blur-xl p-6 flex-col">
          <SidebarContent />
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Center hero area */}
          <div className="px-5 md:px-10 pt-6 md:pt-10">
            <div className="max-w-3xl">
              <HeroGlass />
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 min-h-0 px-5 md:px-10 py-6">
            <div className="h-full rounded-3xl border border-white/10 bg-black/35 backdrop-blur-lg shadow-[0_0_40px_rgba(0,0,0,0.25)] overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`max-w-2xl px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "ml-auto bg-emerald-500/18 border border-emerald-300/35 shadow-[0_0_22px_rgba(34,255,136,0.12)]"
                          : "bg-white/7 border border-white/10"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}

                  {loading && (
                    <div className="max-w-xl px-4 py-3 rounded-2xl bg-white/7 border border-white/10 text-white/70">
                      Taurus AI is thinking...
                    </div>
                  )}

                  {!loading && messages.length === 0 && (
                    <div className="text-white/45 text-sm leading-relaxed">
                      Ask anything about brand strategy, business growth, productivity, or planning.
                    </div>
                  )}
                </div>

                {/* Inputs pinned inside chat card (no dock stacking) */}
                <div className="border-t border-white/10 p-4 md:p-6 space-y-3 bg-black/30">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter today's promo code"
                    className="w-full bg-black/55 backdrop-blur-lg border border-emerald-500/25 rounded-2xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-emerald-300/45"
                  />

                  <div className="flex gap-3 md:gap-4 bg-black/55 backdrop-blur-lg border border-white/10 rounded-2xl px-4 py-3">
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
                      className={`px-5 md:px-6 py-2 rounded-2xl border transition ${
                        loading
                          ? "opacity-60 cursor-not-allowed border-white/20 text-white/60"
                          : "bg-emerald-500/16 border-emerald-300/35 text-emerald-100 shadow-[0_0_28px_rgba(34,255,136,0.16)] hover:shadow-[0_0_42px_rgba(34,255,136,0.24)]"
                      }`}
                    >
                      {loading ? "..." : "Send"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-white/40">
                    <span>Beta UI • Smooth glass layout</span>
                    <button
                      onClick={openTerms}
                      className="text-emerald-200/70 hover:text-emerald-200"
                    >
                      Terms &amp; Conditions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer spacing (mobile safe area) */}
          <div className="h-4 md:h-6" />
        </main>
      </div>

      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes taSlideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes taGlow {
          0%, 100% { filter: blur(0px); opacity: 0.72; }
          50%      { filter: blur(0.8px); opacity: 0.98; }
        }
        @keyframes taDots {
          from { transform: translateY(0px); }
          to   { transform: translateY(-28px); }
        }
        @keyframes taPulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50%      { transform: scale(1.08); opacity: 1; }
        }
        @keyframes taShimmer {
          0%, 100% { opacity: 0.92; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}