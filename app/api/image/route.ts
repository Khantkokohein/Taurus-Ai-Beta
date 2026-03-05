// app/api/image/route.ts
import { NextResponse } from "next/server";

// ✅ 60s timeout
export const maxDuration = 60;
// ✅ Always run dynamically
export const dynamic = "force-dynamic";
// ✅ Ensure Node.js runtime (needed for Buffer)
export const runtime = "nodejs";

const DEFAULT_MODEL = "black-forest-labs/FLUX.1-schnell";
// Hugging Face Inference API endpoint
const HF_BASE = "https://api-inference.huggingface.co/models/";

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body?.prompt ?? "").toString().trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Missing HF_TOKEN in environment variables" },
        { status: 500 }
      );
    }

    // Allow optional override via env
    const model = process.env.HF_IMAGE_MODEL?.trim() || DEFAULT_MODEL;
    const url = `${HF_BASE}${model}`;

    // ✅ Robust warm-up handling:
    // FLUX/SDXL sometimes returns 503 "model loading"
    // We'll retry a few times with short delays.
    const maxAttempts = 4;
    let lastStatus = 0;
    let lastText = "";

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "image/*",
        },
        body: JSON.stringify({
          inputs: prompt,
          
          // Optional: some models accept parameters
          // parameters: { guidance_scale: 3.5, num_inference_steps: 28 },
        }),
      });
console.log("HF status:", r.status);
console.log("HF type:", r.headers.get("content-type"));
      lastStatus = r.status;

      // Success: usually image blob
      if (r.ok) {
        const contentType = r.headers.get("content-type") || "";

        // If HF returns JSON despite ok (rare), handle it
        if (contentType.includes("application/json")) {
          const j: any = await r.json().catch(() => ({}));
          return NextResponse.json(
            { error: j?.error || "Hugging Face returned JSON unexpectedly", detail: j },
            { status: 502 }
          );
        }

        const blob = await r.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        // Determine mime type
        const mime =
          blob.type ||
          (contentType.startsWith("image/") ? contentType : "image/png");

        const dataUrl = `data:${mime};base64,${base64}`;

        return NextResponse.json(
          { url: dataUrl, model },
          {
            status: 200,
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }

      // Not OK: parse HF error message if possible
      const ct = r.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j: any = await r.json().catch(() => ({}));
        lastText = j?.error ? String(j.error) : JSON.stringify(j);

        // If model is loading, wait and retry
        if (r.status === 503) {
          // HF often includes estimated_time
          const waitSec =
            typeof j?.estimated_time === "number" ? Math.ceil(j.estimated_time) : 6;
          await sleep(Math.min(waitSec, 12) * 1000);
          continue;
        }

        // Other HF errors: stop immediately
        return NextResponse.json(
          { error: "Hugging Face API error", status: r.status, detail: j, model },
          { status: 502 }
        );
      } else {
        // Non-JSON error (rare)
        lastText = await r.text().catch(() => "");

        if (r.status === 503) {
          await sleep(6000);
          continue;
        }

        return NextResponse.json(
          { error: "Hugging Face API error", status: r.status, detail: lastText, model },
          { status: 502 }
        );
      }
    }

    // After retries failed
    return NextResponse.json(
      {
        error: "Model is still loading or request failed after retries",
        status: lastStatus,
        detail: lastText,
        model: process.env.HF_IMAGE_MODEL?.trim() || DEFAULT_MODEL,
      },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Image route error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}