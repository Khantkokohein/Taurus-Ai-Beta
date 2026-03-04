"use client";

import { useState } from "react";

type Lang = "mm" | "en";

export default function EmployerAgreementPage() {
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
                isMM
                  ? "border-emerald-400 text-emerald-800"
                  : "border-zinc-200 text-zinc-500"
              }`}
            >
              🇲🇲 MM
            </button>

            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs border ${
                !isMM
                  ? "border-emerald-400 text-emerald-800"
                  : "border-zinc-200 text-zinc-500"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <h1 className="text-2xl font-extrabold mb-4">
            {isMM
              ? "Employer Agreement (လုပ်ငန်းရှင် သဘောတူညီချက်)"
              : "Employer Agreement"}
          </h1>

         <p className="text-sm leading-relaxed">

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

        {/* Section Blocks */}

        <Section
          title={isMM ? "1. Commission (ဝန်ဆောင်ခ)" : "1. Commission"}
          content={
            isMM
              ? `Taurus AI recruitment service အတွက် commission rate သည် 7% ဖြစ်ပါသည်။`
              : `The service commission for Taurus AI recruitment platform is 7%.`
          }
        />

        <Section
          title={isMM ? "2. Payment Terms (ပေးချေမှု)" : "2. Payment Terms"}
          content={
            isMM
              ? `Candidate အလုပ်စတင်ပြီး (၁) လ ပြည့်စုံစွာ လုပ်ဆောင်ပြီးမှသာ commission ကို ပေးချေရမည် ဖြစ်ပါသည်။`
              : `Commission becomes payable only after the hired candidate successfully completes one full month of employment.`
          }
        />

        <Section
          title={isMM ? "3. 45-Day Protection" : "3. 45-Day Protection"}
          content={
            isMM
              ? `Candidate အလုပ်ခန့်ပြီးနောက် 45 ရက်အတွင်း အလုပ်မကိုက်ညီခြင်း သို့မဟုတ် ထွက်ခွာခြင်း ဖြစ်ပါက replacement candidate ကို ပေးနိုင်ပါသည်။`
              : `Within 45 days after hiring, if the candidate leaves or is unsuitable, a replacement candidate may be provided.`
          }
        />

        <Section
          title={isMM ? "4. Employment Contract Responsibility" : "4. Employment Contract Responsibility"}
          content={
            isMM
              ? `၀န်ထမ်းနှင့် company အကြား လစာ၊ အလုပ်ခန့်စာချုပ်နှင့် အလုပ်အကိုင်ဆိုင်ရာ သဘောတူညီမှုများသည် employer နှင့် employee နှစ်ဖက်အကြား တိုက်ရိုက်ပြုလုပ်သည့် သဘောတူညီမှုများဖြစ်ပြီး Taurus AI သည် ထိုသဘောတူညီမှုများတွင် ပါဝင်ခြင်းမရှိပါ။`
              : `Salary agreements, employment contracts, and job-related terms between employer and employee are solely the responsibility of those parties. Taurus AI is not involved in these agreements.`
          }
        />

        <Section
          title={isMM ? "5. Non-Circumvention" : "5. Non-Circumvention"}
          content={
            isMM
              ? `Taurus AI မှ မိတ်ဆက်ပေးသော candidate များကို platform ကို ဖြတ်ကျော်ပြီး တိုက်ရိုက်ခန့်အပ်ခြင်း မပြုလုပ်ရပါ။`
              : `Employers must not bypass Taurus AI by directly hiring candidates introduced through the platform outside the service process.`
          }
        />

        <Section
          title={isMM ? "6. Employer Responsibilities" : "6. Employer Responsibilities"}
          content={
            isMM
              ? `Employer များသည် job details (salary, role, location) ကို မှန်ကန်စွာ ဖော်ပြရန် တာဝန်ရှိပါသည်။`
              : `Employers are responsible for providing accurate job information including salary, role, and location.`
          }
        />

        <Section
          title={isMM ? "7. Data Protection" : "7. Data Protection"}
          content={
            isMM
              ? `Candidate နှင့် employer data များကို recruitment purpose အတွက်သာ အသုံးပြုရမည်ဖြစ်ပါသည်။`
              : `Candidate and employer data must only be used for recruitment purposes.`
          }
        />

        {/* Legal Protection Clauses */}

        <Section
          title={isMM ? "8. Platform Liability Limitation" : "8. Platform Liability Limitation"}
          content={
            isMM
              ? `Taurus AI သည် recruitment matching platform ဖြစ်ပြီး employer နှင့် employee အကြား ဖြစ်ပေါ်သော dispute များအတွက် တာဝန်မယူပါ။`
              : `Taurus AI functions solely as a recruitment matching platform and is not liable for disputes between employers and employees.`
          }
        />

        <Section
          title={isMM ? "9. Platform Misuse Policy" : "9. Platform Misuse Policy"}
          content={
            isMM
              ? `Platform abuse၊ scam၊ false job postings များကို Taurus AI မှ account suspension သို့မဟုတ် removal ပြုလုပ်နိုင်ပါသည်။`
              : `Accounts may be suspended or removed if platform abuse, scams, or false job postings are detected.`
          }
        />

        <Section
          title={isMM ? "10. Service Availability" : "10. Service Availability"}
          content={
            isMM
              ? `Platform သည် maintenance သို့မဟုတ် system updates အတွက် အချိန်အလိုက် unavailable ဖြစ်နိုင်ပါသည်။`
              : `The platform may occasionally be unavailable due to maintenance or system updates.`
          }
        />

        <Section
          title={isMM ? "11. Legal Compliance" : "11. Legal Compliance"}
          content={
            isMM
              ? `Employers သည် local employment laws များနှင့် လိုက်နာရန် တာဝန်ရှိပါသည်။`
              : `Employers are responsible for complying with local employment laws and regulations.`
          }
        />

        <Section
          title={isMM ? "12. Amendments" : "12. Amendments"}
          content={
            isMM
              ? `Company သည် Employer Agreement ကို လိုအပ်သလို ပြင်ဆင်နိုင်ပါသည်။`
              : `The company reserves the right to update this agreement when necessary.`
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