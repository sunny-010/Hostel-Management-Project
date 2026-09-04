
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

type StudentProfile = {
  name: string;
  email: string;
  profileImage: string | null;
  role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
};

export default function StudentDashboard() {
  const [loggingOut, setLoggingOut] = useState(false);

  const [studentData, setStudentData] =
    useState<StudentRoomData | null>(null);

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudentData() {
      try {
        const [studentResponse, profileResponse] =
          await Promise.all([
            fetch("/api/student/room", {
              method: "GET",
              credentials: "include",
            }),
            fetch("/api/profile", {
              method: "GET",
              credentials: "include",
            }),
          ]);

        if (!studentResponse.ok) {
          throw new Error(
            "Failed to fetch student information"
          );
        }

        if (!profileResponse.ok) {
          throw new Error(
            "Failed to fetch profile information"
          );
        }

        const studentDataResponse =
          await studentResponse.json();

        const profileData =
          await profileResponse.json();

        setStudentData(studentDataResponse);
        setProfile(profileData.user);
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
    studentData?.student?.name || "Student";

  const studentId =
    studentData?.student?.studentId || "";

  const roomNumber =
    studentData?.room?.roomNumber;

  const hostelName =
    studentData?.hostel?.name;

  const hostelBlock =
    studentData?.hostel?.block;

  return (
    <main className="min-h-screen bg-[#030712] text-white">

      {/* Header */}

      <header className="border-b border-white/10 backdrop-blur-md bg-[#030712]/80 sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}

          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
              H
            </div>

            <div>
              <h1 className="font-bold tracking-tight text-lg">
                HostelHub
              </h1>

              <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">
                Student Portal
              </p>
            </div>
          </Link>

          {/* Right Side */}

          <div className="flex items-center gap-5">

            {/* Student Profile */}

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5"
              title="My Profile"
            >

              {/* Avatar */}

              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-sm font-bold text-blue-300 shadow-inner shadow-blue-500/20">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || "S"
                )}
              </div>

              {/* Name + Role */}

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">
                  {loading ? (
                    <span className="inline-block h-4 w-20 rounded bg-white/10 animate-shimmer" />
                  ) : (
                    studentName
                  )}
                </p>

                <p className="text-xs text-slate-400">
                  Student
                </p>
              </div>
            </Link>

            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title={loggingOut ? "Logging out..." : "Logout"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}

        <div className="mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-4 shadow-inner shadow-blue-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            STUDENT DASHBOARD
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight">
            Welcome back,{" "}
            {loading ? (
              <span className="inline-block h-8 w-48 rounded bg-white/10 animate-shimmer align-middle" />
            ) : (
              <span className="gradient-text">{studentName}</span>
            )}
          </h2>

          <p className="mt-3 text-lg text-slate-400 max-w-2xl">
            Manage your hostel information, requests, and updates from your personal hub.
          </p>

          {error && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 backdrop-blur-sm">
              <span>⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Quick Info */}

        <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {/* Student */}
          <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-2xl shadow-inner shadow-blue-500/20 border border-blue-500/20">
              👤
            </div>
            <p className="text-sm font-medium text-slate-400">Student Profile</p>
            <p className="mt-1 text-xl font-bold truncate">
              {loading ? <span className="inline-block h-6 w-32 rounded bg-white/10 animate-shimmer" /> : studentName}
            </p>
            <p className="mt-1 text-sm font-medium text-blue-400">
              {loading ? <span className="inline-block h-4 w-24 rounded bg-white/10 animate-shimmer" /> : studentId}
            </p>
          </div>

          {/* Room */}
          <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-2xl shadow-inner shadow-emerald-500/20 border border-emerald-500/20">
              🛏️
            </div>
            <p className="text-sm font-medium text-slate-400">Room Allocation</p>
            <p className="mt-1 text-xl font-bold">
              {loading ? <span className="inline-block h-6 w-20 rounded bg-white/10 animate-shimmer" /> : roomNumber || "Not allocated"}
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-400">
              {loading ? <span className="inline-block h-4 w-24 rounded bg-white/10 animate-shimmer" /> : hostelBlock || "No block"}
            </p>
          </div>

          {/* Hostel */}
          <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 text-2xl shadow-inner shadow-purple-500/20 border border-purple-500/20">
              🏢
            </div>
            <p className="text-sm font-medium text-slate-400">Hostel Name</p>
            <p className="mt-1 text-xl font-bold truncate">
              {loading ? <span className="inline-block h-6 w-32 rounded bg-white/10 animate-shimmer" /> : hostelName || "Not allocated"}
            </p>
          </div>

          {/* Requests */}
          <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl transition-all group-hover:bg-amber-500/20" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-2xl shadow-inner shadow-amber-500/20 border border-amber-500/20">
              📋
            </div>
            <p className="text-sm font-medium text-slate-400">Services Status</p>
            <p className="mt-1 text-xl font-bold text-white">Active</p>
            <p className="mt-1 text-sm font-medium text-amber-400">Fees, complaints, leave</p>
          </div>
        </div>

        {/* Menu */}

        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold tracking-tight">Quick Access</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="group glass-card rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 hover:border-blue-500/30 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-indigo-500/0 transition-all duration-500 group-hover:from-blue-500/5 group-hover:to-indigo-500/5" />
                <div className="relative z-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 group-hover:shadow-blue-500/20">
                    {item.icon}
                  </div>

                  <h4 className="text-lg font-bold tracking-tight transition-colors group-hover:text-blue-400">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {item.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-500 transition-colors group-hover:text-blue-400">
                    Open Module <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

