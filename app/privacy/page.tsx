"use client";

import { useState } from "react";

type Lang = "mm" | "en";

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>("mm");
  const isMM = lang === "mm";

  return (
    <main className="min-h-screen bg-white text-zinc-900 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-emerald-300/60 bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(16,185,129,0.08)] p-8 relative">
          <div className="absolute top-6 right-6 flex gap-2">
            <button
              onClick={() => setLang("mm")}
              className={`px-3 py-1 rounded-full text-xs border ${
                isMM ? "border-emerald-400 text-emerald-800" : "border-zinc-200 text-zinc-500"
              }`}
            >
              🇲🇲 MM
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs border ${
                !isMM ? "border-emerald-400 text-emerald-800" : "border-zinc-200 text-zinc-500"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <h1 className="text-2xl font-extrabold mb-4">
            {isMM ? "Taurus AI ကိုယ်ရေးကိုယ်တာမူဝါဒ (Privacy Policy)" : "Taurus AI Privacy Policy"}
          </h1>

          <p className="text-sm leading-relaxed">

Company Name: OMK Technologies Co., Ltd.
<br />

Founder: Mr. Khant Ko Ko Hein
<br />

Co-Founder: Moe Thazin Oo
<br />

{isMM
  ? "Business Registration Status: Registration in Progress"
  : "Business Registration Status: Registration in Progress"}

<br />

{isMM
  ? "Last Updated: 2026"
  : "Last Updated: 2026"}

</p>
        </div>

        <Section
          title={isMM ? "1. စုဆောင်းနိုင်သော အချက်အလက်များ" : "1. Data We May Collect"}
          content={
            isMM
              ? `Taurus AI သည် လုံခြုံရေးနှင့် စနစ်တည်ငြိမ်မှုအတွက် အနည်းဆုံး technical data များကိုသာ စုဆောင်းနိုင်ပါသည်။
- Device ID (သို့) Device identifier
- IP address / request logs
- Usage counts (rate limit အတွက်)
(မှတ်ချက်) သုံးစွဲသူ၏ private personal content များကို တိုက်ရိုက်ဖတ်ရှုခြင်းမလုပ်ပါ။`
              : `Taurus AI may collect minimal technical data for security and stability:
- Device ID (or device identifier)
- IP address / request logs
- Usage counts (for rate limiting)
Note: We do not directly read private personal content.`
          }
        />

        <Section
          title={isMM ? "2. Data အသုံးပြုရည်ရွယ်ချက်" : "2. How We Use Data"}
          content={
            isMM
              ? `စုဆောင်းထားသော data များကို အောက်ပါအတွက်သာ အသုံးပြုပါသည်။
- Security (abuse / attack ကာကွယ်)
- Rate limiting & system integrity
- Service improvement (bug fix / performance)
Taurus AI သည် သုံးစွဲသူ data များကို third-party များထံ ရောင်းချခြင်း မလုပ်ပါ။`
              : `We use collected data only for:
- Security (prevent abuse/attacks)
- Rate limiting & system integrity
- Service improvement (bug fixes/performance)
Taurus AI does not sell user data to third parties.`
          }
        />

        <Section
          title={isMM ? "3. Google Login (Gmail non-access)" : "3. Google Login (Gmail Non-Access)"}
          content={
            isMM
              ? `Google authentication ကို login အတွက်သာ အသုံးပြုပါသည်။
- Gmail message/content ကို ဖတ်ရှုမည်မဟုတ်ပါ
- Inbox, email body, attachments များကို access မလုပ်ပါ
(Login identity verification အတွက်သာ)`
              : `Google authentication is used only for login.
- We do NOT read Gmail content
- No access to inbox, email body, or attachments
(Identity verification only)`
          }
        />

        <Section
          title={isMM ? "4. Data Retention (သိမ်းဆည်းကာလ)" : "4. Data Retention"}
          content={
            isMM
              ? `Applicant/Employer related data များကို အများဆုံး (၃) လအထိသာ သိမ်းဆည်းထားပြီး သတ်မှတ်ကာလကျော်လွန်ပါက အလိုအလျောက် ဖျက်သိမ်းနိုင်ပါသည်။`
              : `Applicant/employer-related data may be retained for up to three (3) months, after which it may be automatically deleted.`
          }
        />

        <Section
          title={isMM ? "5. Security" : "5. Security"}
          content={
            isMM
              ? `Taurus AI သည် secure authentication နှင့် rate-limiting mechanisms များအသုံးပြုထားပြီး unauthorized access ကို ကာကွယ်ရန် စနစ်တကျ ဆောင်ရွက်ထားပါသည်။`
              : `Taurus AI uses secure authentication and rate-limiting mechanisms to help prevent unauthorized access and protect system integrity.`
          }
        />

        <Section
          title={isMM ? "6. မူဝါဒပြောင်းလဲမှု" : "6. Policy Updates"}
          content={
            isMM
              ? `Company သည် လိုအပ်သလို privacy policy ကို ပြင်ဆင်နိုင်ပါသည်။ Update လုပ်ထားသော version သည် ဒီစာမျက်နှာတွင် အမြဲအတည်ပြုထားမည်ဖြစ်ပါသည်။`
              : `The company may update this policy as needed. The latest version will be maintained on this page.`
          }
        />
      </div>
    </main>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-white/60 backdrop-blur-xl p-6 shadow-[0_6px_25px_rgba(16,185,129,0.05)]">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <p className="text-sm leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}