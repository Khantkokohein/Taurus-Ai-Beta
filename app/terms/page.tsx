"use client";

import { useState } from "react";

type Lang = "mm" | "en";

export default function TermsPage() {

const [lang,setLang] = useState<Lang>("mm");
const isMM = lang === "mm";

return(

<main className="min-h-screen bg-[rgba(246,251,248,0.92)] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 px-4 py-8">

<div className="max-w-4xl mx-auto space-y-8">

{/* Header */}

<div className="rounded-3xl border border-emerald-300/60 dark:border-white/15 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_10px_40px_rgba(16,185,129,0.08)] p-8 relative">

<div className="absolute top-5 right-5 flex gap-2">

<button
onClick={()=>setLang("mm")}
className={`px-3 py-1 rounded-full text-xs border transition ${
isMM
? "border-emerald-400 text-emerald-800 dark:text-emerald-200"
: "border-zinc-200 text-zinc-500 dark:border-white/15 dark:text-zinc-300"
}`}
>
🇲🇲 MM
</button>

<button
onClick={()=>setLang("en")}
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
{isMM ? "Taurus AI အသုံးပြုမှု စည်းမျဉ်းများ (Terms & Conditions)" : "Taurus AI Terms & Conditions"}
</h1>

<p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">

Company Name: OMK Technologies Co., Ltd.
<br/>
Founder: Mr. Khant Ko Ko Hein
<br/>
Co-Founder: Moe Thazin Oo
<br/>
Business Registration Status: Registration in Progress
<br/>
Last Updated: 2026

</p>

</div>

{/* Section 1 */}

<Section
title={isMM ? "1. Platform အကြောင်း" : "1. Platform Overview"}
content={
isMM
? `TAURUS AI သည် Global SaaS AI platform တစ်ခုဖြစ်ပြီး AI အခြေပြု tool များ၊ အချက်အလက်အကူအညီများနှင့် recruitment support service များကို ပံ့ပိုးပေးရန် ရည်ရွယ်ထားပါသည်။

User များသည် AI နှင့် အပြန်အလှန် ဆက်သွယ်နိုင်သကဲ့သို့ အလုပ်ရှာဖွေသူများနှင့် အလုပ်ရှင်များကိုလည်း ပိုမိုလွယ်ကူစွာ ချိတ်ဆက်ပေးနိုင်ပါသည်။`
: `TAURUS AI is a global SaaS AI platform designed to provide AI-powered tools, information assistance, and recruitment support services.

Users can interact with AI tools and the platform may help connect job seekers and employers more efficiently.`
}
/>

{/* Section 2 */}

<Section
title={isMM ? "2. Beta ဝန်ဆောင်မှု" : "2. Beta Service"}
content={
isMM
? `TAURUS AI သည် လက်ရှိတွင် Beta version အဖြစ် စမ်းသပ်ဆောင်ရွက်နေဆဲဖြစ်ပါသည်။

Platform ကို ဆက်လက်တိုးတက်အောင် ပြုပြင်ဖွံ့ဖြိုးနေသောကြောင့် feature များကို အချိန်နှင့်အမျှ တိုးချဲ့သို့မဟုတ် ပြင်ဆင်နိုင်ပါသည်။`
: `TAURUS AI is currently operating as a beta version.

Features may evolve or improve over time as the platform continues to develop.`
}
/>

{/* Section 3 */}

<Section
title={isMM ? "3. AI ဖြေဆိုချက် အကြောင်းကြားချက်" : "3. AI Disclaimer"}
content={
isMM
? `AI ဖြေဆိုချက်များသည် အလိုအလျောက်စနစ်မှ ထုတ်လုပ်သောအချက်အလက်များဖြစ်ပါသည်။

အရေးကြီးသော ဆုံးဖြတ်ချက်များကို ပြုလုပ်ရာတွင် မိမိကိုယ်တိုင် ထပ်မံစစ်ဆေးအသုံးပြုသင့်ပါသည်။`
: `AI responses are generated automatically.

Users should independently verify important decisions before relying on AI outputs.`
}
/>

{/* Section 4 */}

<Section
title={isMM ? "4. Recruitment Platform အကျိုးကျေးဇူး" : "4. Recruitment Platform Benefits"}
content={
isMM
? `TAURUS AI platform မှတဆင့် အလုပ်ရှာဖွေသူများသည် အလုပ်အကိုင်များကို ရှာဖွေရန်နှင့် လွယ်ကူစွာ အလုပ်လျှောက်ရန် အထောက်အကူပြု tool များကို အသုံးပြုနိုင်ပါသည်။

အလုပ်ရှင်များအတွက်လည်း ဝန်ထမ်းရွေးချယ်မှုလုပ်ငန်းစဉ်ကို ပိုမိုထိရောက်စွာ စီမံခန့်ခွဲနိုင်ရန် ကူညီပေးပါသည်။`
: `TAURUS AI may provide tools that help job seekers discover opportunities and apply for jobs more easily.

Employers may also manage recruitment workflows more efficiently using supported features.`
}
/>

{/* Section 5 */}

<Section
title={isMM ? "5. အလုပ်အကိုင်ဆိုင်ရာ တာဝန်မရှိကြောင်း" : "5. Employment Responsibility Disclaimer"}
content={
isMM
? `TAURUS AI သည် အလုပ်ရှာဖွေသူများနှင့် အလုပ်ရှင်များကို ချိတ်ဆက်ပေးသော technology platform တစ်ခုသာဖြစ်ပါသည်။

ဝန်ထမ်းနှင့် အလုပ်ရှင်များကြား
- အလုပ်ခန့်အပ်မှု
- လစာငွေကြေး
- စာချုပ်ချုပ်ဆိုမှု
- အလုပ်ခန့်အပ်ရေးဆိုင်ရာ ဆုံးဖြတ်ချက်များ
- အလုပ်ခွင်အခြေအနေများ

သည် သက်ဆိုင်ရာပါတီများအကြားသာ ဖြစ်ပါသည်။

TAURUS AI သည် အလုပ်အကိုင်အာမခံခြင်း၊ လစာပေးချေမှုအာမခံခြင်း သို့မဟုတ် ပါတီနှစ်ဖက်အကြား ဖြစ်ပေါ်လာသော အငြင်းပွားမှုများအတွက် တာဝန်မယူပါ။`
: `TAURUS AI acts only as a technology platform connecting job seekers and employers.

Employment contracts, salary negotiations, payments, and employment decisions are strictly between the employer and the employee.

TAURUS AI is not responsible for employment agreements, salary payments, or disputes between parties.`
}
/>

{/* Section 6 */}

<Section
title={isMM ? "6. အသုံးပြုမှု စည်းမျဉ်း" : "6. Acceptable Use"}
content={
isMM
? `Platform ကို တရားမဝင်လုပ်ငန်းများ၊ scam များ၊ system exploit များအတွက် အသုံးမပြုရပါ။`
: `The platform must not be used for illegal activities, scams, abuse, or system exploitation.`
}
/>

{/* Section 7 */}

<Section
title={isMM ? "7. Data နှင့် Privacy" : "7. Data & Privacy"}
content={
isMM
? `Service ကို ထိန်းသိမ်းရန်နှင့် တိုးတက်အောင်ပြုလုပ်ရန်အတွက် limited technical data များကို စုဆောင်းအသုံးပြုနိုင်ပါသည်။`
: `Limited technical data may be collected to maintain service stability and improve platform performance.`
}
/>

{/* Section 8 */}

<Section
title={isMM ? "8. Service Update" : "8. Service Updates"}
content={
isMM
? `Platform ကို ပိုမိုကောင်းမွန်စေရန် update များနှင့် maintenance များ ပြုလုပ်နိုင်ပါသည်။`
: `The platform may receive updates and maintenance improvements over time.`
}
/>

{/* Section 9 */}

<Section
title={isMM ? "9. Intellectual Property" : "9. Intellectual Property"}
content={
isMM
? `TAURUS AI ၏ design၊ branding နှင့် software system များသည် platform ပိုင်ဆိုင်မှုဖြစ်ပြီး ခွင့်ပြုချက်မရှိဘဲ ကူးယူအသုံးပြုခြင်းမပြုရပါ။`
: `TAURUS AI branding, platform systems, and design elements are protected intellectual property.`
}
/>

{/* Section 10 */}

<Section
title={isMM ? "10. တာဝန်ကန့်သတ်ချက်" : "10. Limitation of Liability"}
content={
isMM
? `TAURUS AI သည် AI tool နှင့် information platform တစ်ခုဖြစ်ပြီး user များ၏ ဆုံးဖြတ်ချက်များနှင့် လုပ်ဆောင်ချက်များအတွက် တာဝန်မယူပါ။`
: `TAURUS AI provides tools and information services. Users remain responsible for their own decisions.`
}
/>

{/* Contact */}

<div className="text-sm text-center text-zinc-600 dark:text-zinc-400">

Contact: koheinkhantko51@gmail.com

<br/>

TAURUS AI — Born in Myanmar, Built for the World

</div>

</div>

</main>

)

}

function Section({title,content}:{title:string,content:string}){

return(

<div className="rounded-2xl border border-emerald-200/60 dark:border-white/15 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-6 shadow-[0_6px_25px_rgba(16,185,129,0.05)]">

<h2 className="text-lg font-bold mb-3">{title}</h2>

<p className="text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">

{content}

</p>

</div>

)

}