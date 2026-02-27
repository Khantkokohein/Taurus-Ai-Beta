"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  onUnlock: () => void;
};

type Mode = "pattern" | "password";

const LS_UNLOCKED = "taurus_unlocked";
const LS_MODE = "taurus_lock_mode";
const LS_PATTERN = "taurus_lock_pattern";
const LS_PIN = "taurus_lock_pin";

export default function LockGate({ onUnlock }: Props) {
  const [mode, setMode] = useState<Mode>("pattern");
  const [pattern, setPattern] = useState<number[]>([]);
  const [password, setPassword] = useState("");

  const [isSetup, setIsSetup] = useState(false);
  const [hasLock, setHasLock] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const patternKey = useMemo(() => pattern.join("-"), [pattern]);

  useEffect(() => {
    // detect existing lock config
    const savedMode = localStorage.getItem(LS_MODE) as Mode | null;
    const savedPattern = localStorage.getItem(LS_PATTERN);
    const savedPin = localStorage.getItem(LS_PIN);

    const exists = !!(savedMode && ((savedMode === "pattern" && savedPattern) || (savedMode === "password" && savedPin)));

    setHasLock(exists);

    if (savedMode) setMode(savedMode);

    // if no lock yet -> go setup
    if (!exists) {
      setIsSetup(true);
    }
  }, []);

  function fail(msg: string) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 280);
  }

  function resetPattern() {
    setPattern([]);
    setError(null);
  }

  function toggleDot(n: number) {
    setError(null);
    setPattern((prev) => (prev.includes(n) ? prev : [...prev, n]));
  }

  function saveLock() {
    // Setup flow: save selected mode + value
    if (mode === "pattern") {
      if (pattern.length < 4) return fail("Pattern တိုတယ် (အနည်းဆုံး 4 dots)");
      localStorage.setItem(LS_MODE, "pattern");
      localStorage.setItem(LS_PATTERN, patternKey);
      localStorage.removeItem(LS_PIN);
    } else {
      const pin = password.trim();
      if (!pin) return fail("PIN ထည့်ပါ");
      if (pin.length < 4) return fail("PIN အနည်းဆုံး 4 လုံး");
      localStorage.setItem(LS_MODE, "password");
      localStorage.setItem(LS_PIN, pin);
      localStorage.removeItem(LS_PATTERN);
    }

    setIsSetup(false);
    setHasLock(true);
    setError(null);
    resetPattern();
    setPassword("");
    // optional: auto unlock after setup
    unlock();
  }

  function unlock() {
    localStorage.setItem(LS_UNLOCKED, "1");
    onUnlock();
  }

  function checkUnlock() {
    const savedMode = (localStorage.getItem(LS_MODE) as Mode | null) ?? "pattern";
    const savedPattern = localStorage.getItem(LS_PATTERN) ?? "";
    const savedPin = localStorage.getItem(LS_PIN) ?? "";

    if (savedMode === "pattern") {
      if (pattern.length < 4) return fail("Pattern တိုတယ် (အနည်းဆုံး 4 dots)");
      if (patternKey === savedPattern) return unlock();
      return fail("Pattern မမှန်ပါ");
    } else {
      const pin = password.trim();
      if (!pin) return fail("PIN ထည့်ပါ");
      if (pin === savedPin) return unlock();
      return fail("PIN မမှန်ပါ");
    }
  }

  function resetLockCompletely() {
    // admin/dev button usage
    localStorage.removeItem(LS_UNLOCKED);
    localStorage.removeItem(LS_MODE);
    localStorage.removeItem(LS_PATTERN);
    localStorage.removeItem(LS_PIN);
    setIsSetup(true);
    setHasLock(false);
    setError(null);
    setPattern([]);
    setPassword("");
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Fog + dim */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,255,136,0.18),transparent_60%)]" />

      <div
        className={[
          "relative w-[92%] max-w-[560px] rounded-3xl border border-emerald-400/25 bg-black/55 backdrop-blur-2xl p-8",
          "shadow-[0_0_90px_rgba(34,255,136,0.14)]",
          shake ? "animate-[shake_0.28s_ease-in-out]" : "",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Taurus icon */}
            <div className="h-12 w-12 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,255,136,0.25)] grid place-items-center overflow-hidden">
              {/* If you have /taurus-icon.png, use img */}
              <img src="/taurus-icon.png" alt="Taurus" className="h-8 w-8 object-contain" />
            </div>

            <div>
              <div className="text-emerald-200 font-semibold tracking-widest">TAURUS AI</div>
              <div className="text-white/45 text-sm">
                {isSetup ? "Create your lock (first time)" : "Secure Access Gate"}
              </div>
            </div>
          </div>

          {/* tiny reset (dev) */}
          <button
            onClick={resetLockCompletely}
            className="text-xs text-white/35 hover:text-white/70 border border-white/10 rounded-xl px-3 py-2 bg-white/5"
            title="Reset lock (dev)"
          >
            Reset Lock
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => { setMode("pattern"); setError(null); resetPattern(); setPassword(""); }}
            className={`flex-1 rounded-xl px-4 py-3 border ${
              mode === "pattern"
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            Pattern
          </button>
          <button
            onClick={() => { setMode("password"); setError(null); resetPattern(); setPassword(""); }}
            className={`flex-1 rounded-xl px-4 py-3 border ${
              mode === "password"
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            PIN / Password
          </button>
        </div>

        {/* Body */}
        <div className="mt-6">
          {mode === "pattern" ? (
            <>
              <div className="text-white/60 text-sm mb-3">
                {isSetup
                  ? "အခု Pattern ကို စီပြီး Save လုပ်ပါ (အနည်းဆုံး 4 dots)"
                  : "Pattern ကို အစဉ်လိုက်နှိပ်ပြီး Unlock လုပ်ပါ"}
              </div>

              <div className="grid grid-cols-3 gap-4 w-[240px] mx-auto">
                {Array.from({ length: 9 }, (_, i) => {
                  const n = i + 1;
                  const active = pattern.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleDot(n)}
                      className={[
                        "h-16 w-16 rounded-2xl border transition",
                        active
                          ? "border-emerald-300 bg-emerald-500/20 shadow-[0_0_20px_rgba(34,255,136,0.25)]"
                          : "border-white/10 bg-white/5 hover:border-emerald-400/40",
                      ].join(" ")}
                    >
                      <span className={active ? "text-emerald-200" : "text-white/40"}>{n}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={resetPattern} className="text-white/55 hover:text-white text-sm">
                  Reset
                </button>

                {isSetup ? (
                  <button
                    onClick={saveLock}
                    className="px-5 py-2 rounded-xl border border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_25px_rgba(34,255,136,0.18)]"
                  >
                    Save Pattern
                  </button>
                ) : (
                  <button
                    onClick={checkUnlock}
                    className="px-5 py-2 rounded-xl border border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_25px_rgba(34,255,136,0.18)]"
                  >
                    Unlock
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-white/60 text-sm mb-3">
                {isSetup ? "PIN/Password ကို ထည့်ပြီး Save လုပ်ပါ (အနည်းဆုံး 4 လုံး)" : "PIN/Password ထည့်ပြီး Unlock လုပ်ပါ"}
              </div>

              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder={isSetup ? "Create PIN..." : "Enter PIN..."}
                className="w-full rounded-2xl bg-black/50 border border-white/10 px-4 py-3 outline-none text-white placeholder-white/30 focus:border-emerald-400/50"
              />

              <div className="mt-4 flex justify-end">
                {isSetup ? (
                  <button
                    onClick={saveLock}
                    className="px-5 py-2 rounded-xl border border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_25px_rgba(34,255,136,0.18)]"
                  >
                    Save PIN
                  </button>
                ) : (
                  <button
                    onClick={checkUnlock}
                    className="px-5 py-2 rounded-xl border border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_25px_rgba(34,255,136,0.18)]"
                  >
                    Unlock
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="mt-6 text-xs text-white/35">
          {hasLock ? "Tip: Lock ကို Sidebar မှာ Reset/Change လုပ်နိုင်အောင် နောက်ထပ်ထည့်မယ်။" : "First time setup: pattern or PIN ရွေးပြီး save လုပ်ပါ။"}
        </div>
      </div>
    </div>
  );
}