"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type RequestRow = {
  id: string;
  type: string | null;
  name: string | null;
  email: string | null;
  user_email: string | null;
  phone: string | null;
  job_title: string | null;
  salary_range: string | null;
  commission: string | null;
  hours: string | null;
  location: string | null;
  urgency: string | null;
  requirements: string | null;
  submitted: boolean;
  status: string | null;
  hired: boolean;
  created_at: string | null;
  owner_note: string | null;
  rejection_reason: string | null;
  read_by_user: boolean;
};

function getStatusBadge(status: string | null, hired: boolean) {
  if (hired) {
    return "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
  }

  const s = (status || "").toLowerCase();

  if (s === "approved") {
    return "border border-cyan-400/30 bg-cyan-500/10 text-cyan-300";
  }

  if (s === "rejected") {
    return "border border-rose-400/30 bg-rose-500/10 text-rose-300";
  }

  if (s === "reviewing") {
    return "border border-violet-400/30 bg-violet-500/10 text-violet-300";
  }

  return "border border-amber-400/30 bg-amber-500/10 text-amber-300";
}

function getStatusLabel(status: string | null, hired: boolean) {
  if (hired) return "Hired";

  const s = (status || "").toLowerCase();
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  if (s === "reviewing") return "Reviewing";
  return "Pending";
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "hired">("all");

  useEffect(() => {
    async function loadHistory() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userEmail = user?.email?.toLowerCase() || "";
      setEmail(userEmail);

      if (!userEmail) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("email", userEmail)
        .order("id", { ascending: false });

      if (!error && data) {
        const rows = data as RequestRow[];
        setRequests(rows);

        const unreadIds = rows.filter((r) => !r.read_by_user).map((r) => r.id);

        if (unreadIds.length > 0) {
          await supabase.from("requests").update({ read_by_user: true }).in("id", unreadIds);

          setRequests((prev) =>
            prev.map((r) => (unreadIds.includes(r.id) ? { ...r, read_by_user: true } : r))
          );
        }
      }

      setLoading(false);
    }

    loadHistory();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((item) => {
      const s = (item.status || "").toLowerCase();

      if (filter === "all") return true;
      if (filter === "pending") return !item.hired && s === "submitted";
      if (filter === "approved") return !item.hired && s === "approved";
      if (filter === "rejected") return s === "rejected";
      if (filter === "hired") return item.hired;

      return true;
    });
  }, [requests, filter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070b] text-white flex items-center justify-center">
        Loading history...
      </main>
    );
  }

  if (!email) {
    return (
      <main className="min-h-screen bg-[#05070b] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <h1 className="text-2xl font-bold">Please log in</h1>
          <p className="mt-2 text-zinc-400">You need to log in to view your request history.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.10),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.08),transparent_22%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            TAURUS AI • My Request History
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Request History</h1>
          <p className="mt-2 text-zinc-400">Signed in as {email}</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>All</FilterButton>
          <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")}>Pending</FilterButton>
          <FilterButton active={filter === "approved"} onClick={() => setFilter("approved")}>Approved</FilterButton>
          <FilterButton active={filter === "rejected"} onClick={() => setFilter("rejected")}>Rejected</FilterButton>
          <FilterButton active={filter === "hired"} onClick={() => setFilter("hired")}>Hired</FilterButton>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl text-zinc-400">
            No history found.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.05)]"
              >
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {item.name || (item.type === "hire" ? "Employer Request" : "Job Request")}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(
                          item.status,
                          item.hired
                        )}`}
                      >
                        {getStatusLabel(item.status, item.hired)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-zinc-400">
                      {item.type === "hire" ? "Employer Request" : "Job Registration"}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-500">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : "-"}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoBox label="Email" value={item.email || "-"} />
                  <InfoBox label="Phone" value={item.phone || "-"} />
                  <InfoBox label="Job Title / Exp" value={item.job_title || "-"} />
                  <InfoBox label="Submitted" value={item.submitted ? "YES" : "NO"} />
                </div>

                {item.type === "hire" && (
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoBox label="Salary Range" value={item.salary_range || "-"} />
                    <InfoBox label="Commission" value={item.commission || "-"} />
                    <InfoBox label="Working Hours" value={item.hours || "-"} />
                    <InfoBox label="Location" value={item.location || "-"} />
                    <InfoBox label="Urgency Level" value={item.urgency || "-"} />
                    <InfoBox label="Requirements" value={item.requirements || "-"} />
                  </div>
                )}

                {(item.owner_note || item.rejection_reason) && (
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoBox label="Owner Note" value={item.owner_note || "-"} />
                    <InfoBox label="Reject Reason" value={item.rejection_reason || "-"} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-sm text-white whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
          : "rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
      }
    >
      {children}
    </button>
  );
}