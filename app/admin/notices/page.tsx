"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Notice = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadNotices() {
    try {
      const response = await fetch("/api/admin/notices");

      if (!response.ok) {
        throw new Error("Failed to load notices");
      }

      const data = await response.json();

      setNotices(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load notices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/notices",
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
        setMessage(
          data.message || "Failed to create notice"
        );
        return;
      }

      setTitle("");
      setDescription("");

      setMessage("Notice published successfully!");

      await loadNotices();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteNotice(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/notices",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to delete notice"
        );
        return;
      }

      setMessage("Notice deleted successfully.");

      await loadNotices();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/admin/dashboard"
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
            href="/admin/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            ADMINISTRATION
          </p>

          <h2 className="text-3xl font-bold">
            Hostel Notices
          </h2>

          <p className="mt-2 text-slate-400">
            Publish important announcements for hostel students.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Create Notice */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-xl">
              📢
            </div>

            <div>
              <h3 className="font-bold">
                Publish New Notice
              </h3>

              <p className="text-sm text-slate-400">
                Create an announcement for students.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Notice Title
              </label>

              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter notice title"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Description
              </label>

              <textarea
                id="description"
                required
                rows={5}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Write the notice details..."
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting
                ? "Publishing..."
                : "📢 Publish Notice"}
            </button>
          </form>
        </div>

        {/* Notice List */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-bold">
              Published Notices
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Manage announcements currently visible to students.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading notices...
            </div>
          ) : notices.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mb-4 text-5xl">
                📢
              </div>

              <h4 className="font-semibold">
                No notices published
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Create your first hostel notice above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="text-lg font-semibold">
                          {notice.title}
                        </h4>

                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                          PUBLISHED
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-400">
                        {notice.description}
                      </p>

                      <p className="mt-4 text-xs text-slate-500">
                        Published on{" "}
                        {new Date(
                          notice.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteNotice(notice.id)
                      }
                      className="shrink-0 rounded-xl border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      🗑 Delete
                    </button>
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