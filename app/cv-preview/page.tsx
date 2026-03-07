"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 border-b border-zinc-200 py-2">
      <div className="font-semibold text-zinc-700">{label}</div>
      <div className="text-zinc-900 break-words">{value || "-"}</div>
    </div>
  );
}

function CvPreviewContent() {
  const params = useSearchParams();

  const name = params.get("name") || "";
  const nrc = params.get("nrc") || "";
  const age = params.get("age") || "";
  const phone = params.get("phone") || "";
  const address = params.get("address") || "";
  const exp = params.get("exp") || "";
  const salary = params.get("salary") || "";
  const availability = params.get("availability") || "";
  const cvPhoto = (params.get("cv_photo") || "").trim();

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-start gap-6">
          <div className="h-40 w-32 overflow-hidden rounded-2xl border border-zinc-300 bg-zinc-100 flex items-center justify-center text-center text-sm text-zinc-500">
            {cvPhoto ? (
              <img
                src={cvPhoto}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector(".photo-fallback")) {
                    const span = document.createElement("span");
                    span.className = "photo-fallback";
                    span.textContent = "Photo not available";
                    parent.appendChild(span);
                  }
                }}
              />
            ) : (
              <span>No photo</span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {name || "CV Form"}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Taurus AI Recruitment CV Preview
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold"
              >
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-zinc-200 p-5">
          <h2 className="mb-4 text-xl font-bold">Personal Information</h2>

          <InfoRow label="Full Name" value={name} />
          <InfoRow label="NRC" value={nrc} />
          <InfoRow label="Age" value={age} />
          <InfoRow label="Phone Number" value={phone} />
          <InfoRow label="Address" value={address} />
          <InfoRow label="Work Experience" value={exp} />
          <InfoRow label="Expected Salary" value={salary} />
          <InfoRow label="Available Start Date" value={availability} />
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 p-5">
          <h2 className="mb-3 text-lg font-bold">Photo URL</h2>
          <div className="break-all text-xs text-zinc-500">
            {cvPhoto || "No photo URL"}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CvPreviewPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading CV preview...</div>}>
      <CvPreviewContent />
    </Suspense>
  );
}