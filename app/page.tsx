"use client";

import { useEffect, useMemo, useState } from "react";
import LockGate from "@/components/LockGate";

type Msg = { role: "user" | "ai"; text: string };

export default function Home() {
  const [locked, setLocked] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

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
      {locked && <LockGate onUnlock={handleUnlock} />}

      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,255,136,0.15),transparent_65%)]" />

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">

        {/* Sidebar */}
        <aside className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-black/60 backdrop-blur-xl p-6 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,255,136,0.28)] grid place-items-center overflow-hidden">
              <img
                src="/taurus-icon.png"
                alt="Taurus icon"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <img
                src="/taurus-wordmark.png"
                alt="Taurus AI"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button className={sidebarBtnClass}>+ New Chat</button>
            <button className={sidebarBtnClass}>History (Coming Soon)</button>
            <button className={sidebarBtnClass}>Photo Create (Coming Soon)</button>
            <button className={sidebarBtnClass}>Pro / Plus (Coming Soon)</button>
            <button className={sidebarBtnClass}>T&C</button>
            <button onClick={handleLockAgain} className={sidebarBtnClass}>
              Lock (test)
            </button>
          </div>

          <div className="mt-auto pt-6 text-xs text-white/60">
            Free Beta Version • Limited daily usage
            <div className="mt-2 text-emerald-300">
              Project Founder: <span className="font-semibold">Khant Ko Ko Hein</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">

          {/* Header */}
          <div className="px-6 md:px-10 pt-8">
            <div className="text-2xl md:text-3xl font-bold text-emerald-200">
              TAURUS AI
            </div>
            <div className="text-white/60 mt-1">
              Intelligence. Reimagined.
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-2xl px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "ml-auto bg-emerald-500/20 border border-emerald-400"
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

          {/* Input Area */}
          <div className="px-6 md:px-8 pb-6 space-y-3">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter today's promo code"
              className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white"
            />

            <div className="flex gap-3 bg-black/60 border border-white/10 rounded-2xl px-4 py-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white"
                placeholder="Message Taurus AI..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200"
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