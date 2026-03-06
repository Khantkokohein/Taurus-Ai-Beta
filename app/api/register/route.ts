import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

   const payload = {
  type: body?.type ?? null,
  name: body?.name ?? null,
  email: body?.email ?? null,
  user_email: body?.email ?? null,
  phone: body?.phone ?? null,
  job_title: body?.job_title ?? null,
  salary_range: body?.salary_range ?? null,
  commission: body?.commission ?? null,
  hours: body?.hours ?? null,
  location: body?.location ?? null,
  urgency: body?.urgency ?? null,
  requirements: body?.requirements ?? null,
  owner_note: null,
  rejection_reason: null,
  read_by_user: false,
  submitted: true,
  status: "submitted",
  hired: false,
};
    const { data, error } = await supabase
      .from("requests")
      .insert([payload])
      .select();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          payload,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "Server error",
      },
      { status: 500 }
    );
  }
}