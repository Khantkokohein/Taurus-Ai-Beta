import { NextResponse } from "next/server";

// ⭐ Vercel Timeout Fix (60 Seconds)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt, deviceId, isFree } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Hugging Face API ကို လှမ်းခေါ်ခြင်း
    // မှတ်ချက် - HF_TOKEN ကို .env ထဲမှာ ထည့်ထားဖို့ လိုပါမယ်
    const response = await fetch(
  "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
  {
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ inputs: prompt }),
  }
);

    // Hugging Face က error ပြန်ရင် (ဥပမာ 503 model loading)
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || "Hugging Face API error" },
        { status: response.status }
      );
    }

    // 2. ရလာတဲ့ Image (Blob) ကို 处理 လုပ်ခြင်း
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64Image = buffer.toString("base64");

    // 💡 မှတ်ချက် - Image URL အနေနဲ့ ပြန်ချင်ရင် Supabase Storage ထဲ သိမ်းရပါမယ်။
    // အခုလောလောဆယ် Error မတက်အောင် Base64 နဲ့ပဲ စမ်းပြထားပါတယ်။
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({ url: imageUrl });

  } catch (error: any) {
    console.error("Image Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}