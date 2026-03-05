// app/owner/page.tsx
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function getOwnerEmails(): string[] {
  const raw = process.env.OWNER_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export default async function OwnerPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseUrl || !supabaseAnonKey) notFound();

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = (user?.email || "").toLowerCase();
  const owners = getOwnerEmails();
  if (!email || !owners.includes(email)) notFound();

  // ✅ Load requests (owner only, via RLS)
  const { data: requests, error } = await supabase
    .from("requests")
    .select("id,type,name,email,job_title,submitted,status,hired,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Owner Dashboard</h1>
        <p style={{ marginTop: 8 }}>Logged in as: <b>{email}</b></p>
        <p style={{ marginTop: 16, color: "crimson" }}>
          Failed to load requests: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Owner Dashboard</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Logged in as: <b>{email}</b>
      </p>

      <h2 style={{ marginTop: 20, fontSize: 16, fontWeight: 700 }}>
        Requests ({requests?.length || 0})
      </h2>

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Date", "Type", "Name", "Email", "Job", "Status", "Hired"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 8px",
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(requests || []).map((r: any) => (
              <tr key={r.id}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  {r.type}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  {r.name}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  {r.email}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  {r.job_title || "-"}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  {r.status}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  {r.hired ? "YES" : "NO"}
                </td>
              </tr>
            ))}
            {!requests?.length && (
              <tr>
                <td colSpan={7} style={{ padding: 12, opacity: 0.7 }}>
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}