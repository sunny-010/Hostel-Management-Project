"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notice = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
};

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotices() {
    try {
      const response = await fetch(
        "/api/student/notices"
      );

      if (!response.ok) {
        throw new Error("Failed to load notices");
      }

      const data = await response.json();

      setNotices(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load notices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl">
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
        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            STUDENT PORTAL
          </p>

          <h2 className="text-3xl font-bold">
            Hostel Notices
          </h2>

          <p className="mt-2 text-slate-400">
            Stay updated with the latest hostel announcements.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center text-slate-400">
            Loading notices...
          </div>
        ) : notices.length === 0 ? (
          /* Empty */
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <div className="mb-5 text-6xl">
              📢
            </div>

            <h3 className="text-xl font-bold">
              No Notices
            </h3>

            <p className="mt-2 text-slate-400">
              There are no hostel announcements at the moment.
            </p>
          </div>
        ) : (
          /* Notices */
          <div className="space-y-5">
            {notices.map((notice) => (
              <article
                key={notice.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/30 hover:bg-white/[0.05]"
              >
                <div className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                    📢
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-bold">
                        {notice.title}
                      </h3>

                      <span className="w-fit rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                        NOTICE
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                      {notice.description}
                    </p>

                    <div className="mt-5 border-t border-white/5 pt-4">
                      <p className="text-xs text-slate-500">
                        Published on{" "}
                        {new Date(
                          notice.createdAt
                        ).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}