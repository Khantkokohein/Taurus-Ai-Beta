import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // Replicate polling needs node runtime

// ---------- Providers ----------
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
const IMAGE_MODEL = process.env.IMAGE_MODEL || "black-forest-labs/flux-schnell";

const HF_API_TOKEN = process.env.HF_API_TOKEN || "";
const HF_MODEL = process.env.HF_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";
const HF_DAILY_LIMIT = Number(process.env.HF_DAILY_LIMIT || "10"); // per IP/day (beta)

// ---------- Supabase ----------
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const OWNER_EMAIL = (process.env.OWNER_EMAIL || "koheinkhantko51@gmail.com").toLowerCase();

// ---------- Utils ----------
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getIP(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Create Supabase admin client (server-side only)
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

function isReplicateRetryableStatus(status: string) {
  // statuses from Replicate: starting/processing/succeeded/failed/canceled
  return status === "starting" || status === "processing";
}

function looksLikeReplicateCreditOrRateError(msg: string) {
  const t = msg.toLowerCase();
  return (
    t.includes("rate") ||
    t.includes("429") ||
    t.includes("quota") ||
    t.includes("billing") ||
    t.includes("payment") ||
    t.includes("insufficient") ||
    t.includes("402") ||
    t.includes("credit")
  );
}

// ---------- Replicate ----------
async function generateWithReplicate(prompt: string) {
  if (!REPLICATE_API_TOKEN) throw new Error("Missing REPLICATE_API_TOKEN");

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

  const createData = await createRes.json().catch(() => ({}));
  if (!createRes.ok) {
    const err = String(createData?.detail || createData?.error || "Replicate create failed");
    throw new Error(err);
  }

  let prediction = createData;

  // Poll
  for (let i = 0; i < 45; i++) {
    if (prediction?.status === "succeeded") break;
    if (prediction?.status === "failed" || prediction?.status === "canceled") {
      throw new Error("Replicate image generation failed");
    }
    if (!isReplicateRetryableStatus(prediction?.status)) {
      // unexpected status
      throw new Error("Replicate unexpected status");
    }

    await sleep(1000);

    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
    });

    prediction = await pollRes.json().catch(() => ({}));
  }

  if (prediction?.status !== "succeeded") {
    throw new Error("Replicate image generation timed out");
  }

  const out = prediction?.output;
  const url = Array.isArray(out) ? String(out[0] || "") : String(out || "");
  if (!url) throw new Error("Replicate returned no image URL");

  return { url, provider: "replicate" as const };
}

// ---------- Hugging Face (Inference API -> returns image bytes) ----------
async function generateWithHF(prompt: string) {
  if (!HF_API_TOKEN) throw new Error("Missing HF_API_TOKEN");

  const endpoint = `https://api-inference.huggingface.co/models/${encodeURIComponent(HF_MODEL)}`;

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

  // HF can return JSON error sometimes
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      throw new Error(String(j?.error || j?.message || "HF image generation failed"));
    }
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "HF image generation failed");
  }

  // image bytes -> data URL
  const buf = Buffer.from(await res.arrayBuffer());
  const b64 = buf.toString("base64");
  const dataUrl = `data:image/png;base64,${b64}`;

  return { url: dataUrl, provider: "hf" as const };
}

// ---------- HF Rate Limit (per IP/day) ----------
// Uses table: hf_image_daily_usage(day text, ip text)
// If table missing -> we don't block; just proceed (still protected by your global 1/day device limit).
async function enforceHFDailyLimit(db: any, day: string, ip: string) {
  if (!db) return;

  // count rows for this ip/day
  const { data, error } = await db
    .from("hf_image_daily_usage")
    .select("id", { count: "exact", head: true })
    .eq("day", day)
    .eq("ip", ip);

  if (error) {
    // table not created yet -> don't hard fail (beta)
    return;
  }

  const count = Number((data as any)?.length ?? 0); // fallback
  // Supabase head:true returns no rows; use count if available
  const exact = (error as any)?.count ?? undefined;

  // Best-effort: try read count from response shape
  // If count isn't available, we just won't block here.
  const used = typeof (db as any).__lastCount === "number" ? (db as any).__lastCount : undefined;

  // safer approach: do normal select if head count not reliable in your setup
  const sel = await db.from("hf_image_daily_usage").select("id").eq("day", day).eq("ip", ip);
  if (sel.error) return;
  if ((sel.data?.length || 0) >= HF_DAILY_LIMIT) {
    throw new Error(`HF daily limit reached (${HF_DAILY_LIMIT}/day)`);
  }
}

async function saveHFUsage(db: any, day: string, ip: string) {
  if (!db) return;
  const ins = await db.from("hf_image_daily_usage").insert({ day, ip });
  // If table missing, ignore (beta)
  if (ins.error) return;
}

// ---------- Main ----------
export async function POST(req: Request) {
  try {
    const db = supabaseAdmin();
    if (!db) {
      return NextResponse.json({ error: "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
    }

    const ip = getIP(req);
    const day = dayKey();

    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();
    const deviceId = String(body?.deviceId || "").trim();

    // provider: "auto" | "replicate" | "hf"
    const provider = String(body?.provider || "auto").toLowerCase();

    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    if (!deviceId) return NextResponse.json({ error: "deviceId is required" }, { status: 400 });

    // ✅ Owner unlimited (SERVER) — works only when client sends Bearer token
    const email = await getAuthedEmailIfAny(req);
    const isOwner = !!email && email === OWNER_EMAIL;

    // ✅ 1 device = 1 photo/day (SERVER) + optional IP safety — owner bypasses ALL
    if (!isOwner) {
      const usedByDevice = await db
        .from("image_daily_usage")
        .select("id")
        .eq("day", day)
        .eq("device_id", deviceId)
        .maybeSingle();

      if (usedByDevice.error) return NextResponse.json({ error: "DB error (device usage)" }, { status: 500 });

      const usedByIP = await db.from("image_daily_usage").select("id").eq("day", day).eq("ip", ip).maybeSingle();
      if (usedByIP.error) return NextResponse.json({ error: "DB error (ip usage)" }, { status: 500 });

      if (usedByDevice.data || usedByIP.data) {
        return NextResponse.json({ error: "Daily test limit reached (1/day)" }, { status: 429 });
      }
    }

    // --- Provider switching logic (beta simple) ---
    // auto: prefer Replicate; fallback to HF when Replicate fails (credit/rate/timeout/etc)
    // hf: force HF
    // replicate: force Replicate
    let result: { url: string; provider: "replicate" | "hf" };

    if (provider === "hf") {
      if (!isOwner) await enforceHFDailyLimit(db, day, ip);
      result = await generateWithHF(prompt);
      if (!isOwner) await saveHFUsage(db, day, ip);
    } else if (provider === "replicate") {
      result = await generateWithReplicate(prompt);
    } else {
      // auto
      try {
        result = await generateWithReplicate(prompt);
      } catch (e: any) {
        const msg = String(e?.message || "Replicate failed");
        // fallback to HF for common replicate issues
        if (!HF_API_TOKEN) throw new Error(`Replicate failed and HF_API_TOKEN missing: ${msg}`);

        // always fallback in auto mode (keep beta simple)
        if (!isOwner) await enforceHFDailyLimit(db, day, ip);
        result = await generateWithHF(prompt);
        if (!isOwner) await saveHFUsage(db, day, ip);
      }
    }

    // ✅ save global usage (only if not owner)
    if (!isOwner) {
      const ins = await db.from("image_daily_usage").insert({ day, device_id: deviceId, ip });
      if (ins.error) return NextResponse.json({ error: "DB error (save usage)" }, { status: 500 });
    }

    return NextResponse.json({ url: result.url, provider: result.provider });
  } catch (e: any) {
    const msg = String(e?.message || "Server error");
    const status =
      msg.includes("daily limit") ? 429 :
      msg.includes("Missing") ? 500 :
      500;
    return NextResponse.json({ error: msg }, { status });
  }
}