import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 60;

// ---------- Hugging Face (ONLY) ----------
const HF_API_TOKEN = process.env.HF_API_TOKEN || "";
// Vercel Settings ထဲက IMAGE_MODEL ကို ဦးစားပေးယူရန် ပြင်ထားသည်
const HF_MODEL = process.env.IMAGE_MODEL || process.env.HF_MODEL || "black-forest-labs/flux-schnell";
const HF_DAILY_LIMIT = Number(process.env.HF_DAILY_LIMIT || "10");

// ---------- Supabase ----------
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const OWNER_EMAIL = (process.env.OWNER_EMAIL || "koheinkhantko51@gmail.com").toLowerCase();

// ---------- Utils ----------
function getIP(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function supabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getAuthedEmailIfAny(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;

  const token = m[1];
  const sb = supabaseAdmin();
  if (!sb) return null;

  const { data, error } = await sb.auth.getUser(token);
  if (error) return null;

  return (data.user?.email || "").toLowerCase().trim() || null;
}

// ---------- HF Generate (returns dataURL) ----------
async function generateWithHF(prompt: string) {
  if (!HF_API_TOKEN) throw new Error("Missing HF_API_TOKEN");

  // ✅ Vercel Log အရ Router Endpoint ကို အသုံးပြုရန် ပြင်ဆင်ထားသည်
  const endpoint = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify({
      inputs: prompt,
      options: { wait_for_model: true },
    }),
  });

  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      throw new Error(String(j?.error || j?.message || "HF image generation failed"));
    }
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "HF image generation failed");
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const b64 = buf.toString("base64");
  return { url: `data:image/png;base64,${b64}`, provider: "hf" as const };
}

// ---------- Main POST Route ----------
export async function POST(req: Request) {
  try {
    const db = supabaseAdmin();
    if (!db) return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });

    const ip = getIP(req);
    const day = dayKey();
    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();
    const deviceId = String(body?.deviceId || "").trim();

    if (!prompt || !deviceId) {
      return NextResponse.json({ error: "Prompt and deviceId are required" }, { status: 400 });
    }

    const email = await getAuthedEmailIfAny(req);
    const isOwner = !!email && email === OWNER_EMAIL;

    // Limit check logic
    if (!isOwner) {
      const { data: deviceUsed } = await db.from("image_daily_usage").select("id").eq("day", day).eq("device_id", deviceId).maybeSingle();
      const { data: ipUsed } = await db.from("image_daily_usage").select("id").eq("day", day).eq("ip", ip).maybeSingle();

      if (deviceUsed || ipUsed) {
        return NextResponse.json({ error: "Daily limit reached (1/day)" }, { status: 429 });
      }
    }

    // 🔥 Image Generation Call
    const result = await generateWithHF(prompt);

  // Save usage if not owner
    if (!isOwner) {
      try {
        // Main usage log
        await db
          .from("image_daily_usage")
          .insert({ 
            day: day, 
            device_id: deviceId, 
            ip: ip 
          });

        // HF specific log (wrapped to prevent 500 if table missing)
        await db
          .from("hf_image_daily_usage")
          .insert({ 
            day: day, 
            ip: ip 
          });
      } catch (dbErr) {
        console.error("Database Insert Error:", dbErr);
      }
    }

    return NextResponse.json({ url: result.url, provider: result.provider });

  } catch (e: any) {
    console.error("DEBUG ERROR LOG:", e.message);
    const msg = String(e?.message || "Server error");
    const status = msg.includes("limit") ? 429 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}