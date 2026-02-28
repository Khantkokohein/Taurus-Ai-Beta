"use client";

export default function Home() {
  return <MaintenancePage />;
}

function MaintenancePage() {
  return (
    <div className="min-h-[100dvh] w-full bg-black text-white relative overflow-hidden">

      {/* Ambient emerald background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,255,136,0.16),transparent_60%)]" />
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(34,255,136,0.10),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(34,255,136,0.08),transparent_40%)] animate-[taGlow_8s_ease-in-out_infinite]" />
      </div>

      {/* Center Card */}
      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-5">
        <div className="w-full max-w-[760px] rounded-3xl border border-emerald-300/25 bg-white/5 backdrop-blur-2xl shadow-[0_0_70px_rgba(34,255,136,0.14)] overflow-hidden">

          <div className="px-6 md:px-8 py-8">

            {/* Brand Row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 grid place-items-center overflow-hidden">
                <img
                  src="/taurus-icon.png"
                  alt="Taurus icon"
                  className="h-8 w-8 object-contain"
                />
              </div>

              <div>
                <div className="text-emerald-200 font-extrabold tracking-wide text-xl">
                  TAURUS AI
                </div>
                <div className="text-white/55 text-sm">
                  System Maintenance
                </div>
              </div>
            </div>

            {/* Poster Image */}
            <div className="rounded-2xl overflow-hidden border border-emerald-300/25 shadow-[0_0_40px_rgba(34,255,136,0.12)]">
              <img
                src="/maintenance-poster.jpg"
                alt="Taurus AI Maintenance"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Only Two Lines (as you requested) */}
            <div className="mt-6 text-center">
              <div className="text-emerald-100 font-extrabold tracking-wide text-2xl md:text-3xl">
                SYSTEM MAINTENANCE
              </div>

              <div className="mt-2 text-emerald-200/75 font-semibold tracking-wide text-lg">
                UPGRADING IN PROGRESS
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes taGlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}