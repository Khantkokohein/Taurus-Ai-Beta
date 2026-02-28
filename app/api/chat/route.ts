import { NextResponse } from "next/server";

type Counter = { count: number; date: string };

// In-memory (Vercel serverless: may reset on cold start)
const dailyLimits: Record<string, Counter> = {}; // per IP
const dailyUsers: Record<string, Set<string>> = {}; // key=YYYY-MM-DD

// Cloudflare AI model
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

// Defaults (override via env)
const DEFAULT_DAILY_LIMIT = 50; // per IP per day
const DEFAULT_MAX_USERS_PER_DAY = 30; // unique IPs/day
const DEFAULT_MAX_TOKENS = 1000;

// Maintenance message (Ko Kyaw caption)
const MAINTENANCE_MESSAGE =
  "TAURUS AI — System Upgrade in Progress\n" +
  "We’re currently performing system maintenance to refine performance, strengthen security, and improve the overall user experience.\n" +
  "Thank you for your patience — Taurus AI will be back shortly.";

// Persona prompts (Choice AI Assistant)
const BASE_RULES = [
  "You are Taurus AI.",
  "Understand Burmese and English.",
  "Reply in the SAME language as the user.",
  "Be accurate, clear, and professional.",
  "If unsure, ask ONE short clarification question.",
  "Do not invent facts. If you don't know, say you don't know.",
].join("\n");

const PERSONA_PROMPTS: Record<string, string> = {
  // Main
  taurus: `${BASE_RULES}\nRole: All-in-one assistant for strategy, brand, and business growth.`,

  // Content
  tiktok_creator: `${BASE_RULES}\nRole: TikTok / Short Video Expert. Give hooks, scripts, captions, trend angles, and posting plan.`,

  facebook_writer: `${BASE_RULES}\nRole: Facebook Content Writer. Write marketplace-ready, persuasive posts, short and punchy.`,

  // Doctor (per your rule: no “ဗျ/ရှင့်”, clinical intake, structured)
  doctor: [
    "You are Doctor AI.",
    "You are calm, clinical, and helpful. Not rude.",
    "Do NOT use polite particles like 'ဗျ', 'ရှင့်'.",
    "Start with structured intake questions first:",
    "1) Name 2) Age 3) Main symptom 4) Duration 5) Severity(0-10) 6) Other symptoms 7) Medical history 8) Meds/allergies",
    "Then give likely causes, what to do now, red flags, and when to seek urgent care.",
    "If the user returns later, greet using their name and ask if they improved.",
  ].join("\n"),

  // Coding
  dev_pro: `${BASE_RULES}\nRole: Coding & Tech Specialist. Provide step-by-step fixes, minimal but correct, ask for logs if needed.`,

  // Emergency
  emergency: [
    "You are Emergency AI.",
    "Be urgent and direct. This is serious.",
    "Give immediate safety steps and when to call emergency services.",
    "No jokes.",
  ].join("\n"),

  // Friend
  friend: `${BASE_RULES}\nRole: Friendly buddy tone. Short, supportive, simple.`,
};

function getEnvNumber(key: string, fallback: number) {
  const v = process.env[key];
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

export async function POST(req: Request) {
  try {
    // 0) Maintenance mode (API-level lock)
    const maintenance = (process.env.MAINTENANCE_MODE || "").toLowerCase() === "true";
    if (maintenance) {
      return NextResponse.json({ reply: MAINTENANCE_MESSAGE }, { status: 503 });
    }

    // 1) Parse body
    const body = await req.json().catch(() => ({}));
    const message = String(body?.message ?? "");
    const personaKeyRaw = String(body?.persona ?? "taurus").toLowerCase().trim();

    if (!message) {
      return NextResponse.json({ reply: "Message is empty." }, { status: 400 });
    }

    // 2) Limits config
    const DAILY_LIMIT = getEnvNumber("DAILY_LIMIT", DEFAULT_DAILY_LIMIT); // per IP/day
    const MAX_USERS_PER_DAY = getEnvNumber("MAX_USERS_PER_DAY", DEFAULT_MAX_USERS_PER_DAY);
    const MAX_TOKENS = getEnvNumber("MAX_TOKENS", DEFAULT_MAX_TOKENS);

    // 3) IP + date
    const ip = getClientIp(req);
    const today = new Date().toISOString().split("T")[0];

    // 4) Unique users/day cap
    if (!dailyUsers[today]) dailyUsers[today] = new Set<string>();
    dailyUsers[today].add(ip);
    if (dailyUsers[today].size > MAX_USERS_PER_DAY) {
      return NextResponse.json(
        { reply: `Today's public beta is full (max ${MAX_USERS_PER_DAY} users/day). Please try again tomorrow.` },
        { status: 429 }
      );
    }

    // 5) Per-IP daily limit
    if (!dailyLimits[ip] || dailyLimits[ip].date !== today) {
      dailyLimits[ip] = { count: 0, date: today };
    }
    if (dailyLimits[ip].count >= DAILY_LIMIT) {
      return NextResponse.json(
        { reply: `Daily limit reached (${DAILY_LIMIT}/day). Please try again tomorrow.` },
        { status: 429 }
      );
    }
    dailyLimits[ip].count += 1;

    // 6) Persona prompt
    const personaKey = PERSONA_PROMPTS[personaKeyRaw] ? personaKeyRaw : "taurus";
    const systemPrompt = PERSONA_PROMPTS[personaKey];

    // 7) Call Cloudflare AI
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.2,
          max_tokens: MAX_TOKENS,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { reply: `Cloudflare error (${response.status}): ${errText}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    const reply =
      data?.result?.response ??
      data?.result?.outputs?.[0]?.text ??
      data?.result?.output_text ??
      data?.response ??
      "No response";

    return NextResponse.json({
      reply,
      meta: {
        persona: personaKey,
        dailyUsed: dailyLimits[ip]?.count ?? 0,
        dailyLimit: DAILY_LIMIT,
        usersToday: dailyUsers[today]?.size ?? 0,
        usersCap: MAX_USERS_PER_DAY,
        maxTokens: MAX_TOKENS,
      },
    });
  } catch (e) {
    return NextResponse.json({ reply: "Server error" }, { status: 500 });
  }
}