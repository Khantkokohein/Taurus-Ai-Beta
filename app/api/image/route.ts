export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt missing" }, { status: 400 });
    }

    // ✅ ENV: Use HF_TOKEN (match Vercel)
    const hfToken = process.env.HF_TOKEN;
    const model = process.env.HF_IMAGE_MODEL || "runwayml/stable-diffusion-v1-5";

    if (!hfToken) {
      return Response.json({ error: "Missing HF_TOKEN in Vercel env" }, { status: 500 });
    }

    const url = `https://api-inference.huggingface.co/models/${model}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
        Accept: "image/png",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const contentType = response.headers.get("content-type") || "";

    // ✅ HF returns JSON when model loading / error / rate-limit
    if (contentType.includes("application/json")) {
      const text = await response.text();
      return Response.json(
        { error: "HF returned JSON (not an image)", detail: text, model },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return Response.json({ error: text || "HF request failed", model }, { status: 502 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return Response.json({ url: dataUrl, model });
  } catch (err: any) {
    return Response.json(
      { error: "Image generation failed", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}