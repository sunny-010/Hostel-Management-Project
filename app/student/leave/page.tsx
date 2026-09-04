"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Leave = {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function StudentLeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadLeaves() {
    try {
      const response = await fetch("/api/student/leave");

      if (!response.ok) {
        throw new Error("Failed to load leave applications");
      }

      const data = await response.json();

      setLeaves(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load leave applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/student/leave",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromDate,
            toDate,
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to submit application"
        );
        return;
      }

      setMessage(
        "Leave application submitted successfully!"
      );

      setFromDate("");
      setToDate("");
      setReason("");

      await loadLeaves();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusClass(
    status: Leave["status"]
  ) {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/10 text-green-400";

      case "REJECTED":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-yellow-500/10 text-yellow-400";
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#030712]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-gradient shadow-lg text-xl">
              🏠
            </div>

            <div>
              <h1 className="font-bold">
                HostelHub
              </h1>

              <p className="text-xs text-slate-400">
                Hostel Management System
              </p>
            </div>
          </Link>

          <Link
            href="/student/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            STUDENT PORTAL
          </p>

          <h2 className="text-3xl font-bold">
            Leave Applications
          </h2>

          <p className="mt-2 text-slate-400">
            Apply for leave and track your application status.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Application Form */}
        <div className="mb-10 rounded-2xl glass-card shadow-xl p-6">
          <h3 className="mb-6 text-xl font-bold">
            Apply for Leave
          </h3>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  From Date
                </label>

                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  To Date
                </label>

                <input
                  type="date"
                  required
                  min={fromDate || undefined}
                  value={toDate}
                  onChange={(e) =>
                    setToDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Reason
              </label>

              <textarea
                required
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                placeholder="Enter the reason for your leave..."
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl btn-gradient shadow-lg px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Leave Application"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="overflow-hidden rounded-2xl glass-card shadow-xl">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-bold">
              Application History
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              View the status of your leave applications.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading applications...
            </div>
          ) : leaves.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mb-4 text-5xl">
                📝
              </div>

              <h4 className="font-semibold">
                No applications
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                You haven't submitted any leave applications yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap gap-2 text-sm">
                        <span className="rounded-lg bg-white/5 px-3 py-1">
                          {new Date(
                            leave.fromDate
                          ).toLocaleDateString()}
                        </span>

                        <span className="text-slate-500">
                          →
                        </span>

                        <span className="rounded-lg bg-white/5 px-3 py-1">
                          {new Date(
                            leave.toDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-400">
                        {leave.reason}
                      </p>

                      <p className="mt-3 text-xs text-slate-500">
                        Applied on{" "}
                        {new Date(
                          leave.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}