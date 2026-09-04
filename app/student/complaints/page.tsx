"use client";

import { useEffect, useState } from "react";

type Complaint = {
  id: number;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  createdAt: string;
};

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadComplaints() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/complaints");

      if (!response.ok) {
        throw new Error("Failed to load complaints");
      }

      const data = await response.json();

      setComplaints(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        "/api/student/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit complaint"
        );
      }

      setTitle("");
      setDescription("");

      await loadComplaints();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit complaint"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusClass(status: Complaint["status"]) {
    switch (status) {
      case "RESOLVED":
        return "bg-green-500/10 text-green-400";

      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400";

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
          <a href="/student/dashboard" className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold">
                HostelHub
              </h1>

              <p className="text-xs text-slate-400">
                Student Portal
              </p>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <a
            href="/student/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            ← Dashboard
          </a>

            <form action="/api/logout" method="POST">
              <button
                type="submit"
                title="Logout"
                aria-label="Logout"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            STUDENT PORTAL
          </p>

          <h2 className="text-3xl font-bold">
            Complaints
          </h2>

          <p className="mt-2 text-slate-400">
            Submit and track your hostel complaints.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit Complaint */}
        <div className="mb-10 rounded-2xl glass-card shadow-xl p-6">
          <h3 className="mb-5 text-xl font-semibold">
            Submit a Complaint
          </h3>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Room fan not working"
                className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe your complaint..."
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl btn-gradient shadow-lg px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Complaint"}
            </button>
          </form>
        </div>

        {/* Complaints */}
        <div>
          <h3 className="mb-5 text-xl font-semibold">
            My Complaints
          </h3>

          {loading ? (
            <div className="rounded-2xl glass-card shadow-xl p-8 text-center text-slate-400">
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl glass-card shadow-xl p-8 text-center text-slate-400">
              You have not submitted any complaints yet.
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="rounded-2xl glass-card shadow-xl p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h4 className="text-lg font-semibold">
                        {complaint.title}
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {complaint.description}
                      </p>

                      <p className="mt-3 text-xs text-slate-500">
                        Submitted{" "}
                        {new Date(
                          complaint.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        complaint.status
                      )}`}
                    >
                      {complaint.status.replace(
                        "_",
                        " "
                      )}
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