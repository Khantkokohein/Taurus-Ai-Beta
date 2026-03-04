"use client";

import { useState } from "react";

type Lang = "mm" | "en";

export default function TermsPage() {
  const [lang, setLang] = useState<Lang>("mm");
  const isMM = lang === "mm";

  return (
    <main className="min-h-screen bg-[rgba(246,251,248,0.92)] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 🔷 Header Highlight Section */}
        <div className="rounded-3xl border border-emerald-300/60 dark:border-white/15 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_10px_40px_rgba(16,185,129,0.08)] p-8 relative">
          {/* Translate Button (Bonus: less “stuck” to edge) */}
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

          <h1 className="text-2xl font-extrabold mb-4">
            {isMM
              ? "Taurus AI စည်းမျဉ်းများ (Terms & Conditions)"
              : "Taurus AI Terms & Conditions"}
          </h1>

          <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            Company Name: OMK Technologies Co., Ltd.
            <br />
            Founder: Mr. Khant Ko Ko Hein
            <br />
            Co-Founder: Moe Thazin Oo
            <br />
            Business Registration Status: Registration in Progress
            <br />
            Last Updated: 2026
          </p>
        </div>

        {/* Sections */}
        <Section
          title={isMM ? "1. App ရဲ့ ရည်ရွယ်ချက်" : "1. Platform Purpose"}
          content={
            isMM
              ? `Taurus AI သည် မြန်မာနိုင်ငံအတွင်း လုပ်ငန်းရှင်များနှင့် အလုပ်ရှာဖွေနေသော လူများကို လွယ်ကူစွာ ချိတ်ဆက်ပေးရန် ဖန်တီးထားသော Digital Matching Platform ဖြစ်ပါသည်။

အလုပ်ရှာဖွေသူများအနေဖြင့် CV ဖိုး၊ ဓာတ်ပုံဖိုး၊ ဆိုင်ကယ်ဆီဖိုး၊ အချိန်စရိတ် မကုန်ဘဲ Taurus AI မှတစ်ဆင့် လွယ်ကူစွာ လျှောက်ထားနိုင်ပါသည်။`
              : `Taurus AI is a digital matching platform designed to connect employers and job seekers in Myanmar efficiently.

Applicants can apply easily without spending money on CV printing, photos, transportation, or excessive time.`
          }
        />

        <Section
          title={isMM ? "2. User Responsibilities" : "2. User Responsibilities"}
          content={
            isMM
              ? `အသုံးပြုသူများသည် မှန်ကန်သော အချက်အလက်များကိုသာ ပေးပို့ရန် တာဝန်ရှိပါသည်။ မမှန်ကန်သော အချက်အလက်များကြောင့် ဖြစ်ပေါ်လာသည့် ပြဿနာများအတွက် Taurus AI တာဝန်မယူပါ။`
              : `Users are responsible for providing accurate and truthful information. Taurus AI is not liable for issues arising from false or misleading submissions.`
          }
        />

        <Section
          title={isMM ? "3. Data Retention Policy" : "3. Data Retention Policy"}
          content={
            isMM
              ? `Applicant နှင့် Employer data များကို အများဆုံး (၃) လအထိသာ သိမ်းဆည်းထားမည်ဖြစ်ပြီး၊ သတ်မှတ်ကာလကျော်လွန်ပါက အလိုအလျောက် ဖျက်သိမ်းမည်ဖြစ်ပါသည်။`
              : `Applicant and employer data will be retained for a maximum period of three (3) months. Data exceeding this period will be automatically deleted.`
          }
        />

        <Section
          title={isMM ? "4. AI Usage Policy" : "4. AI Usage Policy"}
          content={
            isMM
              ? `AI Chat Intelligence feature များကို စနစ်တကျ သတ်မှတ်ထားသော usage structure အတိုင်း အသုံးပြုရမည်ဖြစ်ပြီး၊ abuse ဖြစ်စေသော automated activity များကို ခွင့်မပြုပါ။`
              : `AI Chat Intelligence features are governed by structured usage policies. Automated abuse or system manipulation is strictly prohibited.`
          }
        />

        <Section
          title={isMM ? "5. Beta Notice" : "5. Beta Notice"}
          content={
            isMM
              ? `Taurus AI သည် Beta အဆင့်တွင် ရှိနေဆဲဖြစ်ပါသည်။ Feature များနှင့် Limit များသည် အချိန်မရွေး ပြောင်းလဲနိုင်ပါသည်။`
              : `Taurus AI is currently in beta stage. Features and usage limits may change at any time without prior notice.`
          }
        />

        <Section
          title={isMM ? "6. Security Statement" : "6. Security Statement"}
          content={
            isMM
              ? `Platform သည် secure authentication နှင့် rate-limiting mechanisms များအသုံးပြုထားပါသည်။`
              : `The platform uses secure authentication and rate-limiting mechanisms to maintain system integrity.`
          }
        />

        <Section
          title={isMM ? "7. Amendments" : "7. Amendments"}
          content={
            isMM
              ? `Company သည် စည်းမျဉ်းများကို လိုအပ်သလို ပြင်ဆင်နိုင်ပါသည်။`
              : `The company reserves the right to amend these terms when necessary.`
          }
        />
      </div>
    </main>
  );
}

/* 🔷 Reusable Section Component */
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