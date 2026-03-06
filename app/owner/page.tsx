"use client";

import { useEffect, useMemo, useState } from "react";
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

function statusBadge(status: string, hired: boolean) {
  if (hired) {
    return {
      label: "Hired",
      className:
        "border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.18)]",
    };
  }

  const s = (status || "").toLowerCase();

  if (s === "approved") {
    return {
      label: "Approved",
      className:
        "border border-cyan-400/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.18)]",
    };
  }

  if (s === "rejected") {
    return {
      label: "Rejected",
      className:
        "border border-rose-400/40 bg-rose-500/15 text-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.18)]",
    };
  }

  if (s === "reviewing") {
    return {
      label: "Reviewing",
      className:
        "border border-violet-400/40 bg-violet-500/15 text-violet-300 shadow-[0_0_18px_rgba(168,85,247,0.18)]",
    };
  }

  return {
    label: "Pending",
    className:
      "border border-amber-400/40 bg-amber-500/15 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.18)]",
  };
}

export default function OwnerPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [showList, setShowList] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "hired">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadRequests() {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setRequests(data as RequestRow[]);
    }
  }

  useEffect(() => {
    async function loadOwnerPanel() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const ownerEmail = "koheinkhantko51@gmail.com";

      if (user?.email?.toLowerCase() === ownerEmail) {
        setAllowed(true);
        setEmail(user.email);
        await loadRequests();
      }

      setLoading(false);
    }

    loadOwnerPanel();
  }, []);

  async function updateRequest(
    id: string,
    updates: Partial<Pick<RequestRow, "status" | "hired">>
  ) {
    try {
      setUpdatingId(id);

      const { error } = await supabase.from("requests").update(updates).eq("id", id);

      if (error) {
        alert(error.message);
        return;
      }

      setRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } as RequestRow : item))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const totalRequests = requests.length;
  const pendingCount = requests.filter(
    (r) => !r.hired && (r.status || "").toLowerCase() === "submitted"
  ).length;
  const approvedCount = requests.filter(
    (r) => !r.hired && (r.status || "").toLowerCase() === "approved"
  ).length;
  const hiredCount = requests.filter((r) => r.hired).length;

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();

    return requests.filter((item) => {
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.job_title?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q);

      const status = (item.status || "").toLowerCase();

      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && !item.hired && status === "submitted") ||
        (filter === "approved" && !item.hired && status === "approved") ||
        (filter === "hired" && item.hired);

      return matchesSearch && matchesFilter;
    });
  }, [requests, search, filter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070b] text-white flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.08)]">
          Loading owner panel...
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[#05070b] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-3xl border border-rose-400/20 bg-white/5 p-8 backdrop-blur-2xl shadow-[0_0_60px_rgba(244,63,94,0.08)]">
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="mt-2 text-zinc-400">This page is for owner only.</p>
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

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              TAURUS AI • Owner Command Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Futuristic Admin Dashboard
            </h1>
            <p className="mt-2 text-zinc-400">Signed in as {email}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowList(true)}
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 backdrop-blur-xl transition hover:bg-cyan-400/15 hover:shadow-[0_0_24px_rgba(34,211,238,0.14)]"
            >
              View Registrations
            </button>

            <button
              onClick={loadRequests}
              className="rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200 backdrop-blur-xl transition hover:bg-violet-400/15 hover:shadow-[0_0_24px_rgba(168,85,247,0.14)]"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Requests" value={totalRequests} accent="cyan" />
          <StatCard label="Pending Review" value={pendingCount} accent="violet" />
          <StatCard label="Approved" value={approvedCount} accent="blue" />
          <StatCard label="Hired" value={hiredCount} accent="emerald" />
        </div>

        {showList && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.05)]">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Registrations</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Live recruitment submissions from Taurus AI
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40 focus:shadow-[0_0_20px_rgba(34,211,238,0.12)] sm:w-72"
                />

                <div className="flex gap-2">
                  <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
                    All
                  </FilterButton>
                  <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")}>
                    Pending
                  </FilterButton>
                  <FilterButton active={filter === "approved"} onClick={() => setFilter("approved")}>
                    Approved
                  </FilterButton>
                  <FilterButton active={filter === "hired"} onClick={() => setFilter("hired")}>
                    Hired
                  </FilterButton>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-10 text-center text-zinc-400">
                  No registrations found.
                </div>
              ) : (
                filteredRequests.map((item) => {
                  const badge = statusBadge(item.status, item.hired);
                  const isBusy = updatingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.05)]"
                    >
                      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                              {item.name || "Unnamed Candidate"}
                            </h3>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                            >
                              {badge.label}
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

                      <div className="mt-4 flex flex-wrap gap-3">
                        <ActionButton
                          color="cyan"
                          disabled={isBusy}
                          onClick={() =>
                            updateRequest(item.id, {
                              status: "reviewing",
                              hired: false,
                            })
                          }
                        >
                          {isBusy ? "Updating..." : "Review"}
                        </ActionButton>

                        <ActionButton
                          color="blue"
                          disabled={isBusy}
                          onClick={() =>
                            updateRequest(item.id, {
                              status: "approved",
                              hired: false,
                            })
                          }
                        >
                          {isBusy ? "Updating..." : "Approve"}
                        </ActionButton>

                        <ActionButton
                          color="rose"
                          disabled={isBusy}
                          onClick={() =>
                            updateRequest(item.id, {
                              status: "rejected",
                              hired: false,
                            })
                          }
                        >
                          {isBusy ? "Updating..." : "Reject"}
                        </ActionButton>

                        <ActionButton
                          color="emerald"
                          disabled={isBusy}
                          onClick={() =>
                            updateRequest(item.id, {
                              status: "approved",
                              hired: true,
                            })
                          }
                        >
                          {isBusy ? "Updating..." : "Hire"}
                        </ActionButton>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "cyan" | "violet" | "blue" | "emerald";
}) {
  const map = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.08)]",
    violet:
      "border-violet-400/20 bg-violet-400/10 text-violet-300 shadow-[0_0_40px_rgba(168,85,247,0.08)]",
    blue: "border-sky-400/20 bg-sky-400/10 text-sky-300 shadow-[0_0_40px_rgba(56,189,248,0.08)]",
    emerald:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.08)]",
  } as const;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
      <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs ${map[accent]}`}>
        {label}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-sm text-white">{value}</p>
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

function ActionButton({
  children,
  color,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  color: "cyan" | "blue" | "rose" | "emerald";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const map = {
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15",
    blue: "border-sky-400/30 bg-sky-400/10 text-sky-200 hover:bg-sky-400/15",
    rose: "border-rose-400/30 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15",
    emerald:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15",
  } as const;

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${map[color]}`}
    >
      {children}
    </button>
  );
}