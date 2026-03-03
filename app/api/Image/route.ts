import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // Replicate polling needs node runtime

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
const IMAGE_MODEL = process.env.IMAGE_MODEL || "black-forest-labs/flux-schnell";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const OWNER_EMAIL = (process.env.OWNER_EMAIL || "koheinkhantko51@gmail.com").toLowerCase();

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

export async function POST(req: Request) {
  try {
    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN" }, { status: 500 });
    }

    const db = supabaseAdmin();
    if (!db) {
      return NextResponse.json({ error: "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
    }

    const ip = getIP(req);
    const day = dayKey();

    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();
    const deviceId = String(body?.deviceId || "").trim();

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

      if (usedByDevice.error) {
        return NextResponse.json({ error: "DB error (device usage)" }, { status: 500 });
      }

      const usedByIP = await db
        .from("image_daily_usage")
        .select("id")
        .eq("day", day)
        .eq("ip", ip)
        .maybeSingle();

      if (usedByIP.error) {
        return NextResponse.json({ error: "DB error (ip usage)" }, { status: 500 });
      }

      if (usedByDevice.data || usedByIP.data) {
        return NextResponse.json({ error: "Daily test limit reached (1/day)" }, { status: 429 });
      }
    }

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

    const createData = await createRes.json().catch(() => ({}));
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

      prediction = await pollRes.json().catch(() => ({}));
    }

    if (prediction?.status !== "succeeded") {
      return NextResponse.json({ error: "Image generation timed out" }, { status: 504 });
    }

    const out = prediction?.output;
    const url = Array.isArray(out) ? String(out[0] || "") : String(out || "");
    if (!url) return NextResponse.json({ error: "No image URL returned" }, { status: 500 });

    // ✅ save usage (only if not owner)
    if (!isOwner) {
      const ins = await db.from("image_daily_usage").insert({ day, device_id: deviceId, ip });
      if (ins.error) {
        return NextResponse.json({ error: "DB error (save usage)" }, { status: 500 });
      }
    }

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}