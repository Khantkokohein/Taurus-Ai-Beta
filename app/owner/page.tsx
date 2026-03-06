"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RequestRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  job_title: string | null;
  submitted: boolean;
  status: string;
  hired: boolean;
  created_at: string;
};

export default function OwnerPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    async function loadOwnerPanel() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const ownerEmail = "koheinkhantko51@gmail.com";

      if (user?.email?.toLowerCase() === ownerEmail) {
        setAllowed(true);
        setEmail(user.email);

       const { data, error } = await supabase
  .from("requests")
  .select("*")
  .order("id", { ascending: false });

  console.log("OWNER REQUESTS:", data, error);

        if (!error && data) {
          setRequests(data);
        }
      }

      setLoading(false);
    }

    loadOwnerPanel();
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

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button
          style={{ padding: 10, cursor: "pointer" }}
          onClick={() => setShowList(true)}
        >
          View Registrations
        </button>

        <button style={{ padding: 10 }}>Admin Tools</button>
      </div>

      {showList && (
        <div style={{ marginTop: 30 }}>
          <h2>Requests ({requests.length})</h2>

          {requests.length === 0 ? (
            <p>No registrations yet.</p>
          ) : (
            <div style={{ marginTop: 16 }}>
              {requests.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #444",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <p><b>Type:</b> {item.type}</p>
                  <p><b>Name:</b> {item.name || "-"}</p>
                  <p><b>Email:</b> {item.email || "-"}</p>
                  <p><b>Job Title:</b> {item.job_title || "-"}</p>
                  <p><b>Status:</b> {item.status || "-"}</p>
                  <p><b>Submitted:</b> {item.submitted ? "YES" : "NO"}</p>
                  <p><b>Hired:</b> {item.hired ? "YES" : "NO"}</p>
                  <p><b>Date:</b> {new Date(item.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}