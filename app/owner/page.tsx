"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function OwnerPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkOwner() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const ownerEmail = "koheinkhantko51@gmail.com";

      if (user?.email?.toLowerCase() === ownerEmail) {
        setAllowed(true);
        setEmail(user.email);
      }

      setLoading(false);
    }

    checkOwner();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: 40, color: "white" }}>
        <p>Loading owner panel...</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main style={{ padding: 40, color: "white" }}>
        <h1>Access Denied</h1>
        <p>This page is for owner only.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, color: "white" }}>
      <h1>Taurus AI Owner Panel</h1>
      <p>Welcome {email}</p>

      <div style={{ marginTop: 20 }}>
        <button style={{ padding: 10 }}>View Registrations</button>
        <button style={{ padding: 10, marginLeft: 10 }}>Admin Tools</button>
      </div>
    </main>
  );
}