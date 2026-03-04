"use client";

import { useState } from "react";

type Lang = "mm" | "en";

const MM_TITLE = "အလုပ်ရှင် သဘောတူညီချက် (Employer Agreement)";
const EN_TITLE = "Employer Agreement";

const META_MM = `Company Name: OMK Technologies Co., Ltd.
Founder: Mr. Khant Ko Ko Hein
Co-Founder: Moe Thazin Oo
Business Registration Status: Registration in Progress
Last Updated: 2026`;

const META_EN = `Company Name: OMK Technologies Co., Ltd.
Founder: Mr. Khant Ko Ko Hein
Co-Founder: Moe Thazin Oo
Business Registration Status: Registration in Progress
Last Updated: 2026`;

/** ✅ Paste your REAL Employer Agreement content here */
const MM_TEXT = `အပိုဒ် (၁) — ရည်ရွယ်ချက်
Taurus AI သည် Employer နှင့် Job Seeker များကို ချိတ်ဆက်ပေးသော platform ဖြစ်ပါသည်။

အပိုဒ် (၂) — ကော်မရှင်
Commission: 7% (အလုပ်စတင်ပြီး 1 month completed ဖြစ်ပြီးမှ ပေးချေမည်)

အပိုဒ် (၃) — Payment Timing
1 month completed ပြီးနောက် payment confirmation ရယူပြီး 15 days အတွင်းပေးချေရမည်။

အပိုဒ် (၄) — Replacement / Protection
45-day protection: Candidate အလုပ်ထွက်ပါက replacement (or refund rule) ကို အညီလုပ်ဆောင်မည်။

အပိုဒ် (၅) — Non-circumvention
Employer သည် platform ကိုကျော်၍ candidate ကို တိုက်ရိုက်ခေါ်ယူခြင်းကို မပြုလုပ်ရ။

အပိုဒ် (၆) — Data Protection
Personal data ကို privacy policy နှင့်အညီသာ အသုံးပြုမည်။`;

const EN_TEXT = `Section (1) — Purpose
Taurus AI is a platform that connects employers and job seekers.

Section (2) — Commission
Commission: 7% (Payable only after 1 month of successful employment completion)

Section (3) — Payment Timing
After 1 month completion and confirmation, payment must be made within 15 days.

Section (4) — Replacement / Protection
45-day protection: If the candidate leaves, replacement (or refund rule) applies per policy.

Section (5) — Non-circumvention
Employers must not bypass the platform to hire candidates directly.

Section (6) — Data Protection
Personal data will be handled according to the privacy policy.`;

export default function EmployerPage() {
  const [lang, setLang] = useState<Lang>("mm");
  const isMM = lang === "mm";

  const title = isMM ? MM_TITLE : EN_TITLE;
  const meta = isMM ? META_MM : META_EN;
  const body = isMM ? MM_TEXT : EN_TEXT;

  return (
    <main className="min-h-screen bg-[rgba(246,251,248,0.92)] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="rounded-3xl border border-emerald-300/60 dark:border-white/15 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_10px_40px_rgba(16,185,129,0.08)] p-8 relative">
          {/* Translate Buttons (✅ spacing fix) */}
          <div className="absolute top-5 right-5 flex gap-2">
            <button
              onClick={() => setLang("mm")}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                isMM
                  ? "border-emerald-400 text-emerald-800 dark:text-emerald-200"
                  : "border-zinc-200 text-zinc-500 dark:border-white/15 dark:text-zinc-300"
              }`}
            >
              🇲🇲 MM
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                !isMM
                  ? "border-emerald-400 text-emerald-800 dark:text-emerald-200"
                  : "border-zinc-200 text-zinc-500 dark:border-white/15 dark:text-zinc-300"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <h1 className="text-2xl font-extrabold mb-4">{title}</h1>

          <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
            {meta}
          </p>
        </div>

        {/* Agreement Body */}
        <Section
          title={isMM ? "အကြောင်းအရာ" : "Agreement Content"}
          content={body}
        />

        {/* Footer Note */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {isMM
            ? "မှတ်ချက်: ဤစာရွက်စာတမ်းသည် beta အဆင့်တွင်ရှိပြီး လိုအပ်သလို ပြင်ဆင်နိုင်ပါသည်။"
            : "Note: This document is in beta and may be updated when necessary."}
        </div>
      </div>
    </main>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200/60 dark:border-white/15 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-6 shadow-[0_6px_25px_rgba(16,185,129,0.05)]">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
        {content}
      </p>
    </div>
  );
}