"use client";

import { useState } from "react";

type Lang = "mm" | "en";

const MM_TITLE = "အလုပ်ရှင် သဘောတူညီချက် (Employer Agreement)";
const EN_TITLE = "Employer Agreement";

const META = `Company Name: OMK Technologies Co., Ltd.
Owner: AHKAR MINN
Business Registration Status: Registration in Progress
Last Updated: 2026`;

const MM_TEXT = `
အပိုဒ် (၁) — ရည်ရွယ်ချက်

၁.၁ ဤ Employer Agreement သည် Taurus AI platform ကို အသုံးပြု၍ ဝန်ထမ်းခန့်အပ်လိုသော အလုပ်ရှင်များအတွက် သတ်မှတ်ထားသော စည်းမျဉ်းများနှင့် သဘောတူညီချက်များကို ဖော်ပြပါသည်။

၁.၂ Taurus AI သည် employer နှင့် job seeker များကို ချိတ်ဆက်ပေးသော AI-powered recruitment technology platform ဖြစ်ပါသည်။

၁.၃ Taurus AI သည် employer သို့မဟုတ် employee ၏ တရားဝင်ကိုယ်စားလှယ် မဟုတ်ပါ။

၁.၄ Taurus AI သည် hiring outcome ကို အာမခံမပေးပါ။

--------------------------------------------------

အပိုဒ် (၂) — Platform Role

၂.၁ Taurus AI သည် candidate sourcing, application intake နှင့် matching support များကို အထောက်အကူပြုနိုင်သော platform ဖြစ်ပါသည်။

၂.၂ Final hiring decision ကို employer သာဆုံးဖြတ်ရပါမည်။

၂.၃ Candidate performance သို့မဟုတ် employment success အတွက် Taurus AI သည် အာမခံမပေးပါ။

--------------------------------------------------

အပိုဒ် (၃) — Commission

၃.၁ Employer သည် Taurus AI platform မှတဆင့် candidate hiring success ဖြစ်ပါက commission ပေးချေရမည်။

၃.၂ Commission rate သည် 7% ဖြစ်ပါသည်။

၃.၃ Commission သည် candidate အလုပ်စတင်ပြီး 1 month completed ဖြစ်ပြီးမှသာ payable ဖြစ်ပါသည်။

--------------------------------------------------

အပိုဒ် (၄) — Payment Timing

၄.၁ Candidate သည် employment start date မှစ၍ 1 month completed ဖြစ်ပါက payment obligation ဖြစ်လာပါသည်။

၄.၂ Employer သည် employment confirmation ပြုလုပ်ပြီးနောက် 15 days အတွင်း commission payment ကို Taurus AI သို့ ပေးချေရမည်။

--------------------------------------------------

အပိုဒ် (၅) — 45-Day Protection / Replacement

၅.၁ Candidate သည် အလုပ်စတင်ပြီး 45 days အတွင်း resignation ပြုလုပ်ပါက replacement support ကို platform policy အရ ဆောင်ရွက်နိုင်ပါသည်။

၅.၂ Replacement မဖြစ်နိုင်ပါက refund / adjustment rule ကို platform policy အရ စိစစ်ဆောင်ရွက်နိုင်ပါသည်။

--------------------------------------------------

အပိုဒ် (၆) — Non-Circumvention

၆.၁ Employer သည် Taurus AI platform မှ မိတ်ဆက်ပေးထားသော candidate ကို platform ကိုကျော်၍ တိုက်ရိုက် hire မပြုလုပ်ရပါ။

၆.၂ Commission ကိုရှောင်ရှားရန် off-platform hiring arrangement မပြုလုပ်ရပါ။

--------------------------------------------------

အပိုဒ် (၇) — Employer Responsibilities

၇.၁ Employer သည် job information ကို မှန်ကန်စွာ ပေးရမည်။

၇.၂ Salary range, working hours, job duties နှင့် location များကို ရှင်းလင်းစွာ ဖော်ပြရမည်။

၇.၃ Employer သည် applicable labour rules နှင့် local laws များကို ကိုယ်တိုင်လိုက်နာရမည်။

--------------------------------------------------

အပိုဒ် (၈) — Employment Relationship

၈.၁ Employment contract များသည် employer နှင့် employee အကြားသာ သက်ဆိုင်ပါသည်။

၈.၂ Salary payment, benefits, termination နှင့် labour dispute များအတွက် Taurus AI သည် တာဝန်မယူပါ။

--------------------------------------------------

အပိုဒ် (၉) — Data Protection

၉.၁ Candidate personal data များကို recruitment purpose အတွက်သာ အသုံးပြုရမည်။

၉.၂ Unauthorized sharing မပြုလုပ်ရပါ။

၉.၃ Data handling သည် Taurus AI Privacy Policy နှင့်အညီ ဆောင်ရွက်မည်။

--------------------------------------------------

အပိုဒ် (၁၀) — Limitation of Liability

၁၀.၁ Taurus AI သည် recruitment matching platform တစ်ခုသာ ဖြစ်ပါသည်။

၁၀.၂ Hiring decision, employee conduct, salary dispute သို့မဟုတ် legal dispute များအတွက် Taurus AI သည် တာဝန်မယူပါ။

--------------------------------------------------

အပိုဒ် (၁၁) — Policy Updates

၁၁.၁ Taurus AI သည် ဤ Agreement ကို လိုအပ်သလို update ပြုလုပ်နိုင်ပါသည်။

၁၁.၂ Platform ကို ဆက်လက်အသုံးပြုခြင်းသည် updated terms ကို လက်ခံသည်ဟု မှတ်ယူပါသည်။
`;

const EN_TEXT = `
Section (1) — Purpose

1.1 This Employer Agreement outlines the terms and conditions applicable to employers using the Taurus AI platform.

1.2 Taurus AI is an AI-powered recruitment technology platform that connects employers with job seekers.

1.3 Taurus AI is not the legal representative of either the employer or the employee.

1.4 Taurus AI does not guarantee hiring outcomes.

--------------------------------------------------

Section (2) — Platform Role

2.1 Taurus AI may assist with candidate sourcing, application intake, and matching support.

2.2 Final hiring decisions remain solely with the employer.

2.3 Taurus AI does not guarantee candidate performance or employment success.

--------------------------------------------------

Section (3) — Commission

3.1 The employer agrees to pay Taurus AI a commission upon successful hiring.

3.2 The commission rate is 7%.

3.3 The commission becomes payable only after the candidate successfully completes one (1) month of employment.

--------------------------------------------------

Section (4) — Payment Timing

4.1 Once the candidate completes one month of employment, the commission obligation becomes effective.

4.2 Payment must be made within fifteen (15) days after confirmation.

--------------------------------------------------

Section (5) — 45-Day Protection

5.1 If the candidate resigns within 45 days, replacement support may be provided.

5.2 If replacement is not possible, refund or adjustment rules may apply.

--------------------------------------------------

Section (6) — Non-Circumvention

6.1 Employers must not bypass the Taurus AI platform to hire candidates directly.

6.2 Employers must not avoid commission obligations through off-platform arrangements.

--------------------------------------------------

Section (7) — Employer Responsibilities

7.1 Employers must provide accurate job information.

7.2 Salary, work hours, duties, and location must be clearly disclosed.

7.3 Employers must comply with applicable labour laws.

--------------------------------------------------

Section (8) — Employment Relationship

8.1 Employment contracts exist solely between employer and employee.

8.2 Taurus AI is not responsible for employment disputes or salary matters.

--------------------------------------------------

Section (9) — Data Protection

9.1 Candidate data must only be used for recruitment purposes.

9.2 Unauthorized sharing of candidate data is prohibited.

9.3 Data handling follows the Taurus AI Privacy Policy.

--------------------------------------------------

Section (10) — Limitation of Liability

10.1 Taurus AI operates only as a recruitment matching platform.

10.2 Taurus AI is not responsible for hiring outcomes, employee conduct, or disputes.

--------------------------------------------------

Section (11) — Policy Updates

11.1 Taurus AI may update this agreement when necessary.

11.2 Continued use of the platform constitutes acceptance of updated terms.
`;

export default function EmployerPage() {
  const [lang, setLang] = useState<Lang>("en");
  const isMM = lang === "mm";

  const title = isMM ? MM_TITLE : EN_TITLE;
  const body = isMM ? MM_TEXT : EN_TEXT;

  return (
    <main className="min-h-screen bg-[rgba(246,251,248,0.92)] dark:bg-[#050505] px-4 py-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-3xl border border-emerald-300/60 dark:border-white/15 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl p-8 relative">
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

          <p className="text-sm whitespace-pre-line text-zinc-700 dark:text-zinc-300">
            {META}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200/60 dark:border-white/15 bg-white/60 dark:bg-zinc-900/60 p-6">
          <pre className="text-sm whitespace-pre-wrap leading-relaxed">
            {body}
          </pre>
        </div>
      </div>
    </main>
  );
}