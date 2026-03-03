import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Replicate polling needs node runtime

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
const IMAGE_MODEL = process.env.IMAGE_MODEL || "black-forest-labs/flux-schnell";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const dayKey = () => new Date().toISOString().slice(0, 10);
const usage = new Map<string, { day: string; count: number }>();

function getIP(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

export async function POST(req: Request) {
  try {
    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN" }, { status: 500 });
    }

    const ip = getIP(req);
    const limit = Number(process.env.IMAGE_DAILY_LIMIT || "5");
    const today = dayKey();
    const rec = usage.get(ip);

    if (!rec || rec.day !== today) usage.set(ip, { day: today, count: 0 });
    const cur = usage.get(ip)!;
    if (cur.count >= limit) {
      return NextResponse.json({ error: "Daily image limit reached" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    // 1) Create prediction
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        input: { prompt },
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      return NextResponse.json(
        { error: createData?.detail || createData?.error || "Replicate create failed" },
        { status: 500 }
      );
    }

    let prediction = createData;

    // 2) Poll until completed
    for (let i = 0; i < 45; i++) {
      if (prediction?.status === "succeeded") break;
      if (prediction?.status === "failed" || prediction?.status === "canceled") {
        return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
      }

      await sleep(1000);

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
      });
      prediction = await pollRes.json();
    }

    if (prediction?.status !== "succeeded") {
      return NextResponse.json({ error: "Image generation timed out" }, { status: 504 });
    }

    const out = prediction?.output;
    const url = Array.isArray(out) ? String(out[0] || "") : String(out || "");
    if (!url) return NextResponse.json({ error: "No image URL returned" }, { status: 500 });

    cur.count += 1;

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}