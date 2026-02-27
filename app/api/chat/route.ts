import { NextResponse } from "next/server";

type Counter = { count: number; date: string };

// Per-IP daily usage
const dailyLimits: Record<string, Counter> = {};

// Track unique users/day (IP-based)
const dailyUsers: Record<string, Set<string>> = {}; // key = YYYY-MM-DD

// ✅ Config
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"; // Cloudflare supported 70B
const PER_USER_LIMIT = 20; // ✅ 20/day per user
const MAX_USERS_PER_DAY = 6; // ✅ 6 users/day (unique IPs)
const SYS_PROMPT = `You are Taurus AI.
Understand Burmese and English.
Reply in the same language as the user.
Do not change topic.
If unsure, ask a short clarification question.
Keep answers accurate and professional.`;

export async function POST(req: Request) {
  try {
    const { message, promoCode } = await req.json();

    // ✅ Promo code required (No Code / No Use)
    const expected = (process.env.TAURUS_DAILY_CODE || "").trim();
    const provided = typeof promoCode === "string" ? promoCode.trim() : "";

    if (!expected || provided.toUpperCase() !== expected.toUpperCase()) {
      return NextResponse.json(
        { reply: "Promo code required. Please enter today's code to use Taurus AI." },
        { status: 403 }
      );
    }

    // ✅ IP fallback (localhost မှာ header မရှိနိုင်)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "local";

    const today = new Date().toISOString().split("T")[0];

    // ✅ Unique users/day limit (6/day)
    if (!dailyUsers[today]) dailyUsers[today] = new Set<string>();
    dailyUsers[today].add(ip);

    if (dailyUsers[today].size > MAX_USERS_PER_DAY) {
      return NextResponse.json(
        {
          reply: `Today's beta is full (max ${MAX_USERS_PER_DAY} users/day). Please try again tomorrow.`,
        },
        { status: 429 }
      );
    }

    // ✅ Reset per-user counter daily
    if (!dailyLimits[ip] || dailyLimits[ip].date !== today) {
      dailyLimits[ip] = { count: 0, date: today };
    }

    // ✅ Per-user daily limit (20/day)
    if (dailyLimits[ip].count >= PER_USER_LIMIT) {
      return NextResponse.json(
        { reply: `Daily limit reached (${PER_USER_LIMIT}/day). Please try again tomorrow.` },
        { status: 429 }
      );
    }

    dailyLimits[ip].count += 1;

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
            { role: "system", content: SYS_PROMPT },
            { role: "user", content: String(message || "") },
          ],
          temperature: 0.2,
          max_tokens: 700,
        }),
      }
    );

    // ✅ Cloudflare error handling
    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { reply: `Cloudflare error (${response.status}): ${errText}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    // ✅ Safe reply extraction (structure မတူနိုင်)
    const reply =
      data?.result?.response ??
      data?.result?.outputs?.[0]?.text ??
      data?.result?.output_text ??
      data?.response ??
      "No response";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}