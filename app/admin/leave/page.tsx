"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Hostel = {
  id: number;
  name: string;
  block: string;
};

type Room = {
  id: number;
  roomNumber: string;
  hostel: Hostel;
};

type Allocation = {
  id: number;
  allocatedAt: string;
  room: Room;
};

type Student = {
  id: number;
  studentId: string;
  name: string;
  email: string;
  allocations: Allocation[];
};

type Leave = {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
  createdAt: string;
  student: Student;
};

export default function AdminLeavePage() {
  const [leaves, setLeaves] =
    useState<Leave[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  async function loadLeaves() {
    try {
      const response = await fetch(
        "/api/admin/leave"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load leave applications"
        );
      }

      const data =
        await response.json();

      setLeaves(data);
    } catch (error) {
      console.error(
        "Load leave applications error:",
        error
      );

      setMessage(
        "Failed to load leave applications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function updateStatus(
    id: number,
    status: "APPROVED" | "REJECTED"
  ) {
    setUpdatingId(id);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/leave",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to update application"
        );
        return;
      }

      setMessage(
        `Leave application ${status.toLowerCase()} successfully.`
      );

      await loadLeaves();
    } catch (error) {
      console.error(
        "Update leave error:",
        error
      );

      setMessage(
        "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
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

  const pendingCount =
    leaves.filter(
      (leave) =>
        leave.status === "PENDING"
    ).length;

  const approvedCount =
    leaves.filter(
      (leave) =>
        leave.status === "APPROVED"
    ).length;

  const rejectedCount =
    leaves.filter(
      (leave) =>
        leave.status === "REJECTED"
    ).length;

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
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            ADMINISTRATION
          </p>

          <h2 className="text-3xl font-bold">
            Leave Applications
          </h2>

          <p className="mt-2 text-slate-400">
            Review and manage student leave
            requests.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <p className="text-sm text-slate-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
            <p className="text-sm text-slate-400">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm text-slate-400">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {rejectedCount}
            </p>
          </div>
        </div>

        {/* Applications */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-bold">
              All Leave Applications
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Review requests submitted by
              students.
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
                No leave applications
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                There are no leave requests
                yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaves.map((leave) => {
                const allocation =
                  leave.student.allocations?.[0];

                return (
                  <div
                    key={leave.id}
                    className="p-6 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      {/* Details */}
                      <div className="flex-1">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          <h4 className="text-lg font-semibold">
                            {leave.student.name}
                          </h4>

                          <span className="rounded-lg bg-white/5 px-3 py-1 text-xs text-slate-400">
                            {leave.student.studentId}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              leave.status
                            )}`}
                          >
                            {leave.status}
                          </span>
                        </div>

                        {/* Student Accommodation */}
                        <div className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-400">
                            Student Accommodation
                          </p>

                          {allocation ? (
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-slate-500">
                                  Hostel
                                </p>

                                <p className="mt-1 font-medium">
                                  {
                                    allocation.room
                                      .hostel
                                      .name
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-500">
                                  Block
                                </p>

                                <p className="mt-1 font-medium">
                                  {
                                    allocation.room
                                      .hostel
                                      .block
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-500">
                                  Room
                                </p>

                                <p className="mt-1 font-medium">
                                  {
                                    allocation.room
                                      .roomNumber
                                  }
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-yellow-400">
                              ⚠️ This student currently
                              has no room allocation.
                            </p>
                          )}
                        </div>

                        {/* Leave Dates */}
                        <div className="mb-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-500">
                              From
                            </p>

                            <p className="mt-1 text-sm">
                              {new Date(
                                leave.fromDate
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              To
                            </p>

                            <p className="mt-1 text-sm">
                              {new Date(
                                leave.toDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Reason */}
                        <div>
                          <p className="text-xs text-slate-500">
                            Reason
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-300">
                            {leave.reason}
                          </p>
                        </div>

                        {/* Created */}
                        <p className="mt-4 text-xs text-slate-500">
                          Applied on{" "}
                          {new Date(
                            leave.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      {leave.status ===
                        "PENDING" && (
                        <div className="flex shrink-0 gap-3">
                          <button
                            disabled={
                              updatingId ===
                              leave.id
                            }
                            onClick={() =>
                              updateStatus(
                                leave.id,
                                "APPROVED"
                              )
                            }
                            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>

                          <button
                            disabled={
                              updatingId ===
                              leave.id
                            }
                            onClick={() =>
                              updateStatus(
                                leave.id,
                                "REJECTED"
                              )
                            }
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}