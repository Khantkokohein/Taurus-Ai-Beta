import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    
    // Supabase Client ကို ပိုမိုခိုင်မာတဲ့ Cookie handling နဲ့ တည်ဆောက်မယ်
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component ကနေ ခေါ်ရင် ignore လုပ်မယ်
            }
          },
        },
      }
    );

    // Session စစ်ဆေးခြင်း
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (!session || authError) {
      return NextResponse.json(
        { error: "ကျေးဇူးပြု၍ Login အရင်ဝင်ပေးပါ။ (Session not found)" }, 
        { status: 401 }
      );
    }

    const user = session.user;
    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt လိုအပ်ပါသည်။" }, { status: 400 });
    }

    // Hugging Face API Call
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
    
    // Database Tracking
    await supabase.from('hf_image_daily_usage').insert({
      user_id: user.id,
      prompt: prompt,
      day: new Date().toISOString().slice(0, 10)
    });

    return NextResponse.json({ url: `data:image/png;base64,${base64}` });

  } catch (error: any) {
    console.error("SERVER ERROR:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}