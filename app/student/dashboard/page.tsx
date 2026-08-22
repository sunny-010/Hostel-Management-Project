"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const menuItems = [
  {
    title: "My Room",
    description: "View your hostel and room allocation",
    icon: "🛏️",
    href: "/student/room",
  },
  {
    title: "Fees",
    description: "View hostel fee records and payment status",
    icon: "💰",
    href: "/student/fees",
  },
  {
    title: "Complaints",
    description: "Submit and track complaints",
    icon: "📝",
    href: "/student/complaints",
  },
  {
    title: "Leave Applications",
    description: "Apply for leave and check approval status",
    icon: "🛫",
    href: "/student/leave",
  },
  {
    title: "Notices",
    description: "Read hostel announcements",
    icon: "📢",
    href: "/student/notices",
  },
];

type StudentRoomData = {
  student: {
    id: number;
    name: string;
    studentId: string;
  };
  allocation: {
    id: number;
    allocatedAt: string;
  } | null;
  room: {
    id: number;
    roomNumber: string;
    capacity: number;
    occupied: number;
  } | null;
  hostel: {
    id: number;
    name: string;
    block: string;
  } | null;
};

export default function StudentDashboard() {
  const [loggingOut, setLoggingOut] = useState(false);

  const [studentData, setStudentData] =
    useState<StudentRoomData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudentData() {
      try {
        const response = await fetch("/api/student/room", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            "Failed to fetch student information"
          );
        }

        const data = await response.json();

        setStudentData(data);
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error
        );

        setError(
          "Unable to load student information."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);
    }
  }

  const studentName =
    studentData?.student?.name ||
    "Student";

  const studentId =
    studentData?.student?.studentId || "";

  const roomNumber =
    studentData?.room?.roomNumber;

  const hostelName =
    studentData?.hostel?.name;

  const hostelBlock =
    studentData?.hostel?.block;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <Link
            href="/"
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

          {/* Right Side */}
          <div className="flex items-center gap-5">

            {/* Student Profile */}
            <div className="flex items-center gap-3">

              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-lg">
                👤
              </div>

              {/* Name + Role */}
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">
                  {loading
                    ? "Loading..."
                    : studentName}
                </p>

                <p className="text-xs text-slate-400">
                  Student
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-blue-400">
            STUDENT PORTAL
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            Welcome,{" "}
            {loading
              ? "..."
              : studentName}
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your hostel information and
            requests from one place.
          </p>

          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Quick Info */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Student */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 text-2xl">
              👤
            </div>

            <p className="text-sm text-slate-400">
              Student
            </p>

            <p className="mt-1 text-lg font-bold">
              {loading
                ? "Loading..."
                : studentName}
            </p>

            {studentId && (
              <p className="mt-1 text-xs text-slate-500">
                ID: {studentId}
              </p>
            )}
          </div>

          {/* Room */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 text-2xl">
              🛏️
            </div>

            <p className="text-sm text-slate-400">
              Room
            </p>

            <p className="mt-1 text-lg font-bold">
              {loading
                ? "Loading..."
                : roomNumber
                  ? `Room ${roomNumber}`
                  : "Not Allocated"}
            </p>

            {roomNumber && hostelName && (
              <p className="mt-1 text-xs text-slate-500">
                {hostelName}
                {hostelBlock
                  ? ` • Block ${hostelBlock}`
                  : ""}
              </p>
            )}
          </div>

          {/* Fees */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 text-2xl">
              💰
            </div>

            <p className="text-sm text-slate-400">
              Fees
            </p>

            <p className="mt-1 text-lg font-bold">
              View Records
            </p>
          </div>

          {/* Complaints */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 text-2xl">
              📝
            </div>

            <p className="text-sm text-slate-400">
              Complaints
            </p>

            <p className="mt-1 text-lg font-bold">
              Track Requests
            </p>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="mb-5 text-xl font-bold">
            Student Services
          </h3>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.05]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                  {item.icon}
                </div>

                <h4 className="font-semibold">
                  {item.title}
                </h4>

                <p className="mt-1 text-sm text-slate-400">
                  {item.description}
                </p>

                <div className="mt-5 text-sm font-medium text-blue-400">
                  Open →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}