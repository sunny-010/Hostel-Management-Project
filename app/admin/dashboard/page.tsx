"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const menuItems = [
  {
    title: "Students",
    description: "Manage hostel students",
    icon: "🎓",
    href: "/admin/students",
  },
  {
    title: "Hostels & Rooms",
    description: "Manage rooms and capacity",
    icon: "🏢",
    href: "/admin/rooms",
  },
  {
    title: "Room Allocation",
    description: "Allocate rooms to students",
    icon: "🛏️",
    href: "/admin/allocations",
  },
  {
    title: "Fees",
    description: "Manage student payments",
    icon: "💳",
    href: "/admin/fees",
  },
  {
    title: "Complaints",
    description: "Review student complaints",
    icon: "📋",
    href: "/admin/complaints",
  },
  {
    title: "Leave Applications",
    description: "Approve or reject leave",
    icon: "📝",
    href: "/admin/leave",
  },
  {
    title: "Notices",
    description: "Publish hostel notices",
    icon: "📢",
    href: "/admin/notices",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    availableBeds: 0,
    pendingFees: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats");

        if (!response.ok) {
          throw new Error("Failed to load statistics");
        }

        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: "🎓",
      href: "/admin/students",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: "🚪",
      href: "/admin/rooms",
    },
    {
      title: "Available Beds",
      value: stats.availableBeds,
      icon: "🛏️",
      href: "/admin/rooms",
    },
    {
      title: "Pending Fees",
      value: stats.pendingFees,
      icon: "💰",
      href: "/admin/fees",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl">
              🏠
            </div>

            <div>
              <h1 className="font-bold">HostelHub</h1>
              <p className="text-xs text-slate-400">
                Hostel Management System
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                Hostel Administrator
              </p>

              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              A
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-blue-400">
            ADMINISTRATION
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your hostel operations from one place.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/40 hover:bg-white/[0.05]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-xl">
                  {stat.icon}
                </div>

                <span className="text-slate-600 transition group-hover:text-blue-400">
                  →
                </span>
              </div>

              <p className="text-sm text-slate-400">
                {stat.title}
              </p>

              <p className="mt-1 text-3xl font-bold">
                {loading ? "..." : stat.value}
              </p>
            </Link>
          ))}
        </div>

        {/* Management */}
        <div className="mt-10">
          <h3 className="mb-5 text-xl font-bold">
            Management
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
                  Manage →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}