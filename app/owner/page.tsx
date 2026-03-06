import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"

export default async function OwnerPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const ownerEmails = (process.env.OWNER_EMAILS || "").split(",")

  if (!ownerEmails.includes(user.email || "")) {
    notFound()
  }

  return (
    <main style={{ padding: 40, color: "white" }}>
      <h1>Taurus AI Owner Panel</h1>
      <p>Welcome {user.email}</p>

      <div style={{ marginTop: 20 }}>
        <button style={{ padding: 10 }}>View Registrations</button>
        <button style={{ padding: 10, marginLeft: 10 }}>Admin Tools</button>
      </div>
    </main>
  )
}