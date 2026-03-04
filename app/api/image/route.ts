import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"
export const maxDuration = 60

// ---------- Hugging Face (ONLY) ----------
const HF_API_TOKEN = process.env.HF_API_TOKEN || "";
const HF_MODEL = process.env.IMAGE_MODEL || "black-forest-labs/flux-schnell";
const HF_DAILY_LIMIT = Number(process.env.HF_DAILY_LIMIT || "10"); // per IP/day (beta)

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

  const email = (data.user?.email || "").toLowerCase().trim();
  return email || null;
}

// ---------- HF Generate (returns dataURL) ----------
async function generateWithHF(prompt: string) {
  if (!HF_API_TOKEN) throw new Error("Missing HF_API_TOKEN");

 // router.huggingface.co အစား api-inference.huggingface.co ကို သုံးပါ
const endpoint = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

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

  // HF image bytes -> data URL
  const buf = Buffer.from(await res.arrayBuffer());
  const b64 = buf.toString("base64");
  const dataUrl = `data:image/png;base64,${b64}`;

  return { url: dataUrl, provider: "hf" as const };
}

// ---------- HF Rate Limit (per IP/day) ----------
// Table: hf_image_daily_usage(day text, ip text)
// If table missing -> ignore (beta)
async function enforceHFDailyLimit(db: any, day: string, ip: string) {
  if (!db) return;

  const { count, error } = await db
    .from("hf_image_daily_usage")
    .select("id", { count: "exact" })
    .eq("day", day)
    .eq("ip", ip);

  if (error) {
    // table not created yet -> don't hard fail (beta)
    return;
  }

  const used = Number(count || 0);
  if (used >= HF_DAILY_LIMIT) {
    throw new Error(`HF daily limit reached (${HF_DAILY_LIMIT}/day)`);
  }
}

async function saveHFUsage(db: any, day: string, ip: string) {
  if (!db) return;
  const ins = await db.from("hf_image_daily_usage").insert({ day, ip });
  if (ins.error) return; // table missing -> ignore (beta)
}

// ---------- Main ----------
export async function POST(req: Request) {
  try {
    const db = supabaseAdmin();
    if (!db) {
      return NextResponse.json(
        { error: "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const ip = getIP(req);
    const day = dayKey();

    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();
    const deviceId = String(body?.deviceId || "").trim();
    const provider = String(body?.provider || "hf").toLowerCase(); // default hf

    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    if (!deviceId) return NextResponse.json({ error: "deviceId is required" }, { status: 400 });

    // ✅ Owner unlimited (SERVER) — works only when client sends Bearer token
    const email = await getAuthedEmailIfAny(req);
    const isOwner = !!email && email === OWNER_EMAIL;

    // ✅ Replicate disabled (Coming Soon)
    if (provider === "replicate" || provider === "auto") {
      return NextResponse.json(
        { error: "Advanced Image Generation (Replicate) is Coming Soon." },
        { status: 503 }
      );
    }

    // ✅ 1 device = 1 photo/day (SERVER) + IP safety — owner bypasses ALL
    if (!isOwner) {
      const usedByDevice = await db
        .from("image_daily_usage")
        .select("id")
        .eq("day", day)
        .eq("device_id", deviceId)
        .maybeSingle();

      if (usedByDevice.error) return NextResponse.json({ error: "DB error (device usage)" }, { status: 500 });

      const usedByIP = await db
        .from("image_daily_usage")
        .select("id")
        .eq("day", day)
        .eq("ip", ip)
        .maybeSingle();

      if (usedByIP.error) return NextResponse.json({ error: "DB error (ip usage)" }, { status: 500 });

      if (usedByDevice.data || usedByIP.data) {
        return NextResponse.json({ error: "Daily test limit reached (1/day)" }, { status: 429 });
      }
    }

    // ✅ HF daily limit (beta) — owner bypasses
    if (!isOwner) await enforceHFDailyLimit(db, day, ip);

    const result = await generateWithHF(prompt);

    if (!isOwner) {
      await saveHFUsage(db, day, ip);

      // save global usage (only if not owner)
      const ins = await db.from("image_daily_usage").insert({ day, device_id: deviceId, ip });
      if (ins.error) return NextResponse.json({ error: "DB error (save usage)" }, { status: 500 });
    }

    return NextResponse.json({ url: result.url, provider: result.provider });
  } catch (e: any) {
    const msg = String(e?.message || "Server error");
    const status = msg.includes("limit") ? 429 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}