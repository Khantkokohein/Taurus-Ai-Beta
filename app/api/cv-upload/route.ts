import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const mime = file.type || "";
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(mime)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP files are allowed" },
        { status: 400 }
      );
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "File size must be 5MB or less" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const fileName = `cv_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("cv-uploads")
      .upload(fileName, buffer, {
        contentType: mime,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("cv-uploads")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: fileName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}