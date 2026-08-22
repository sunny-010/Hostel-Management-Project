"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

type Room = {
  id: number;
  roomNumber: string;
  hostel: {
    id: number;
    name: string;
    block: string;
  };
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

type ComplaintStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";

type Complaint = {
  id: number;
  title: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  student: Student;
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  // --------------------------------
  // Load Complaints
  // --------------------------------

  async function loadComplaints() {
    try {
      const response = await fetch(
        "/api/admin/complaints"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load complaints"
        );
      }

      const data =
        await response.json();

      setComplaints(data);
    } catch (error) {
      console.error(
        "Load complaints error:",
        error
      );

      setMessage(
        "Failed to load complaints"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  // --------------------------------
  // Update Complaint Status
  // --------------------------------

  async function updateStatus(
    id: number,
    status: ComplaintStatus
  ) {
    setUpdatingId(id);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/complaints",
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
            "Failed to update complaint"
        );
        return;
      }

      setMessage(
        "Complaint status updated successfully!"
      );

      await loadComplaints();
    } catch (error) {
      console.error(
        "Update complaint error:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // --------------------------------
  // Statistics
  // --------------------------------

  const pendingCount =
    complaints.filter(
      (complaint) =>
        complaint.status === "PENDING"
    ).length;

  const inProgressCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "IN_PROGRESS"
    ).length;

  const resolvedCount =
    complaints.filter(
      (complaint) =>
        complaint.status === "RESOLVED"
    ).length;

  const rejectedCount =
    complaints.filter(
      (complaint) =>
        complaint.status === "REJECTED"
    ).length;

  // --------------------------------
  // Page
  // --------------------------------

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
            Complaints
          </h2>

          <p className="mt-2 text-slate-400">
            Review and manage student complaints.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">
              Total Complaints
            </p>

            <p className="mt-2 text-3xl font-bold">
              {complaints.length}
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <p className="text-sm text-slate-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {pendingCount}
            </p>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
            <p className="text-sm text-slate-400">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {inProgressCount}
            </p>
          </div>

          {/* Resolved */}
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
            <p className="text-sm text-slate-400">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {resolvedCount}
            </p>
          </div>
        </div>

        {/* Complaints */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {/* Table Header */}
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-bold">
              Complaint Records
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Review complaints submitted by
              students.
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            /* Empty */
            <div className="px-6 py-14 text-center">
              <div className="mb-4 text-5xl">
                📋
              </div>

              <h4 className="font-semibold">
                No complaints yet
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Student complaints will appear
                here.
              </p>
            </div>
          ) : (
            /* Complaint List */
            <div className="divide-y divide-white/5">
              {complaints.map(
                (complaint) => {
                  const allocation =
                    complaint.student
                      .allocations?.[0];

                  return (
                    <div
                      key={complaint.id}
                      className="p-6 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex flex-col justify-between gap-6 lg:flex-row">
                        {/* Complaint Information */}
                        <div className="flex-1">
                          {/* Title + Status */}
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-semibold">
                              {
                                complaint.title
                              }
                            </h4>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                complaint.status ===
                                "PENDING"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : complaint.status ===
                                      "IN_PROGRESS"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : complaint.status ===
                                        "RESOLVED"
                                      ? "bg-green-500/10 text-green-400"
                                      : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {complaint.status.replace(
                                "_",
                                " "
                              )}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-300">
                            {
                              complaint.description
                            }
                          </p>

                          {/* Student Details */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                            <span>
                              👤{" "}
                              {
                                complaint
                                  .student
                                  .name
                              }
                            </span>

                            <span>
                              ID:{" "}
                              {
                                complaint
                                  .student
                                  .studentId
                              }
                            </span>

                            <span>
                              📧{" "}
                              {
                                complaint
                                  .student
                                  .email
                              }
                            </span>

                            <span>
                              📅{" "}
                              {new Date(
                                complaint.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          {/* -------------------------------- */}
                          {/* Student Accommodation */}
                          {/* -------------------------------- */}

                          <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="text-lg">
                                🏠
                              </span>

                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                                Student Accommodation
                              </p>
                            </div>

                            {allocation ? (
                              <div className="grid gap-4 sm:grid-cols-3">
                                {/* Hostel */}
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Hostel
                                  </p>

                                  <p className="mt-1 font-medium text-white">
                                    {
                                      allocation
                                        .room
                                        .hostel
                                        .name
                                    }
                                  </p>
                                </div>

                                {/* Block */}
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Block
                                  </p>

                                  <p className="mt-1 font-medium text-white">
                                    {
                                      allocation
                                        .room
                                        .hostel
                                        .block
                                    }
                                  </p>
                                </div>

                                {/* Room */}
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Room
                                  </p>

                                  <p className="mt-1 font-medium text-blue-400">
                                    Room{" "}
                                    {
                                      allocation
                                        .room
                                        .roomNumber
                                    }
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-yellow-400">
                                ⚠️ This student
                                currently has
                                no room
                                allocation.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* -------------------------------- */}
                        {/* Status Controls */}
                        {/* -------------------------------- */}

                        <div className="flex shrink-0 flex-col gap-2 lg:w-48">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Update Status
                          </p>

                          <select
                            value={
                              complaint.status
                            }
                            disabled={
                              updatingId ===
                              complaint.id
                            }
                            onChange={(e) =>
                              updateStatus(
                                complaint.id,
                                e.target
                                  .value as ComplaintStatus
                              )
                            }
                            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                          >
                            <option value="PENDING">
                              Pending
                            </option>

                            <option value="IN_PROGRESS">
                              In Progress
                            </option>

                            <option value="RESOLVED">
                              Resolved
                            </option>

                            <option value="REJECTED">
                              Rejected
                            </option>
                          </select>

                          {updatingId ===
                            complaint.id && (
                            <p className="text-xs text-slate-500">
                              Updating...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}