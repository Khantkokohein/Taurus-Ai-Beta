"use client";

import { useState } from "react";

type Lang = "mm" | "en";

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

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>("en");
  const isMM = lang === "mm";

  return (
    <main className="min-h-screen bg-[rgba(246,251,248,0.92)] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="rounded-3xl border border-emerald-300/60 dark:border-white/15 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_10px_40px_rgba(16,185,129,0.08)] p-8 relative">

          <div className="absolute top-5 right-5 flex gap-2">
            <button
              onClick={() => setLang("mm")}
              className={`px-3 py-1 rounded-full text-xs border ${
                isMM
                  ? "border-emerald-400 text-emerald-800 dark:text-emerald-200"
                  : "border-zinc-200 text-zinc-500 dark:border-white/15 dark:text-zinc-300"
              }`}
            >
              🇲🇲 MM
            </button>

            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs border ${
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
              ? "Taurus AI ကိုယ်ရေးကိုယ်တာမူဝါဒ (Privacy Policy)"
              : "Taurus AI Privacy Policy"}
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

        <Section
          title={isMM ? "1. စုဆောင်းနိုင်သော Data များ" : "1. Data We May Collect"}
          content={
            isMM
              ? `Taurus AI သည် service ကို ထိန်းသိမ်းရန်နှင့် လုံခြုံရေးအတွက် အနည်းဆုံး technical data များကို စုဆောင်းနိုင်ပါသည်။

• Device ID / device identifier
• IP address / request logs
• Usage statistics
• Authentication information

သုံးစွဲသူ၏ private conversation များကို တိုက်ရိုက်ဖတ်ရှုခြင်းမလုပ်ပါ။`
              : `Taurus AI may collect limited technical information to maintain service security and performance.

• Device identifier
• IP address / request logs
• Usage statistics
• Authentication information

Private conversations are not manually accessed.`
          }
        />

        <Section
          title={isMM ? "2. Data အသုံးပြုရည်ရွယ်ချက်" : "2. How We Use Data"}
          content={
            isMM
              ? `စုဆောင်းထားသော data များကို အောက်ပါရည်ရွယ်ချက်များအတွက်သာ အသုံးပြုပါသည်။

• Platform security
• Abuse prevention
• Rate limiting
• System performance improvement
• Bug fixing

Taurus AI သည် user data များကို third-party များထံ ရောင်းချခြင်း မပြုလုပ်ပါ။`
              : `Collected data is used only for:

• Platform security
• Abuse prevention
• Rate limiting
• System performance improvements
• Bug fixing

Taurus AI does not sell user data to third parties.`
          }
        />

        <Section
          title={isMM ? "3. Google Login အသုံးပြုမှု" : "3. Google Login"}
          content={
            isMM
              ? `Google authentication ကို login verification အတွက်သာ အသုံးပြုပါသည်။

Taurus AI သည်
• Gmail message
• Email body
• Attachments
• Inbox data

များကို ဖတ်ရှုခွင့် မရှိပါ။`
              : `Google authentication is used only for login verification.

Taurus AI does NOT access:

• Gmail messages
• Email body
• Attachments
• Inbox content`
          }
        />

        <Section
          title={isMM ? "4. Data သိမ်းဆည်းကာလ" : "4. Data Retention"}
          content={
            isMM
              ? `Applicant နှင့် Employer intake data များကို အများဆုံး (၃) လအထိသာ သိမ်းဆည်းနိုင်ပါသည်။

သတ်မှတ်ကာလကျော်လွန်ပါက data များကို အလိုအလျောက် ဖျက်သိမ်းနိုင်ပါသည်။`
              : `Applicant and employer intake data may be retained for up to three (3) months before automatic deletion.`
          }
        />

        <Section
          title={isMM ? "5. Security" : "5. Security"}
          content={
            isMM
              ? `Taurus AI သည် secure authentication, rate limiting နှင့် system monitoring များကို အသုံးပြု၍ platform security ကို ကာကွယ်ထားပါသည်။`
              : `Taurus AI uses secure authentication, monitoring, and rate limiting mechanisms to protect platform integrity.`
          }
        />

        <Section
          title={isMM ? "6. Policy Updates" : "6. Policy Updates"}
          content={
            isMM
              ? `Company သည် privacy policy ကို အချိန်နှင့်အမျှ ပြင်ဆင်နိုင်ပါသည်။

Update လုပ်ထားသော version ကို ဒီစာမျက်နှာတွင် အမြဲပြသပါမည်။`
              : `This privacy policy may be updated from time to time. The latest version will always be available on this page.`
          }
        />

        <div className="text-sm text-center text-zinc-600 dark:text-zinc-400">
          Contact: koheinkhantko51@gmail.com
          <br />
          TAURUS AI — Born in Myanmar, Built for the World
        </div>
      </div>
    </main>
  );
}