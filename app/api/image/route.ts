import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // ၁။ Cookies ကို await လုပ်ပြီး ဖတ်မယ် (Next.js 15 Fix)
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // ၂။ Session စစ်ဆေးခြင်း
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "ကျေးဇူးပြု၍ Login အရင်ဝင်ပေးပါ။" }, 
        { status: 401 }
      );
    }

    const user = session.user;
    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt လိုအပ်ပါသည်။" }, { status: 400 });
    }

    // ၃။ Hugging Face AI ဆီက ပုံတောင်းမယ်
    const HF_TOKEN = process.env.HF_API_TOKEN;
    const HF_MODEL = process.env.IMAGE_MODEL || "black-forest-labs/flux-schnell";

    const hfResponse = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: prompt,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!hfResponse.ok) {
      return NextResponse.json({ error: `AI Error: ${hfResponse.status}` }, { status: hfResponse.status });
    }

    const arrayBuffer = await hfResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64}`;

    // ၄။ Database Tracking (Error 2551 Fix: await အရင်သုံးရပါမယ်)
    const { error: dbError } = await supabase.from('hf_image_daily_usage').insert({
      user_id: user.id,
      prompt: prompt,
      day: new Date().toISOString().slice(0, 10)
    });

    if (dbError) {
      console.error("DB Error:", dbError.message);
    }

    return NextResponse.json({ url: imageUrl });

  } catch (error: any) {
    console.error("SERVER ERROR:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}