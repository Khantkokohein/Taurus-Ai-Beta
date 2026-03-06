"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RequestRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
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
      <main className="flex items-center justify-center h-screen text-white">
        Loading owner panel...
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex flex-col items-center justify-center h-screen text-white">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>This page is for owner only.</p>
      </main>
    );
  }

  const pending = requests.filter((r) => r.status === "submitted").length;
  const hired = requests.filter((r) => r.hired).length;

  return (
    <main className="min-h-screen bg-black text-white p-10">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Taurus AI Admin</h1>
        <p className="text-gray-400">Welcome {email}</p>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Total Requests</p>
          <h2 className="text-3xl font-bold">{requests.length}</h2>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Pending Review</p>
          <h2 className="text-3xl font-bold">{pending}</h2>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Hired</p>
          <h2 className="text-3xl font-bold text-green-400">{hired}</h2>
        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 mb-8">

        <button
          onClick={() => setShowList(true)}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500"
        >
          View Registrations
        </button>

        <button className="px-4 py-2 rounded-lg border border-gray-600">
          Admin Tools
        </button>

      </div>

      {/* REQUESTS LIST */}
      {showList && (
        <div className="space-y-6">

          {requests.map((item) => (
            <div
              key={item.id}
              className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl"
            >

              <div className="grid grid-cols-2 gap-4">

                <p><b>Name:</b> {item.name || "-"}</p>
                <p><b>Phone:</b> {item.phone || "-"}</p>

                <p><b>Email:</b> {item.email || "-"}</p>
                <p><b>Job Title:</b> {item.job_title || "-"}</p>

                <p><b>Status:</b> {item.status}</p>
                <p><b>Submitted:</b> {item.submitted ? "YES" : "NO"}</p>

                <p><b>Hired:</b> {item.hired ? "YES" : "NO"}</p>
                <p>
                  <b>Date:</b>{" "}
                  {new Date(item.created_at).toLocaleString()}
                </p>

              </div>

              {/* ACTION BUTTONS */}

              <div className="flex gap-3 mt-5">

                <button className="px-3 py-1 text-sm bg-blue-600 rounded">
                  Review
                </button>

                <button className="px-3 py-1 text-sm bg-green-600 rounded">
                  Approve
                </button>

                <button className="px-3 py-1 text-sm bg-red-600 rounded">
                  Reject
                </button>

                <button className="px-3 py-1 text-sm bg-purple-600 rounded">
                  Hire
                </button>

              </div>

            </div>
          ))}

        </div>
      )}
    </main>
  );
}