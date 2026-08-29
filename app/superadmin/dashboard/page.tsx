
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardStats = {
  totalAdmins: number;
  activeAdmins: number;
  deactivatedAdmins: number;
  totalStudents: number;
  maintenanceMode: boolean;
  allowAdminCreation: boolean;
};

type SuperAdminProfile = {
  name: string;
  email: string;
  profileImage: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "STUDENT";
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAdmins: 0,
    activeAdmins: 0,
    deactivatedAdmins: 0,
    totalStudents: 0,
    maintenanceMode: false,
    allowAdminCreation: true,
  });

  const [profile, setProfile] =
    useState<SuperAdminProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [response, profileResponse] =
          await Promise.all([
            fetch("/api/superadmin/dashboard"),
            fetch("/api/profile"),
          ]);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load dashboard statistics"
          );
        }

        if (!profileResponse.ok) {
          throw new Error(
            "Failed to load profile"
          );
        }

        const profileData =
          await profileResponse.json();

        setStats(data);
        setProfile(profileData.user);
      } catch (error) {
        console.error(
          "SuperAdmin dashboard error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard statistics"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  const statCards = [
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: "👨‍💼",
    },
    {
      title: "Active Admins",
      value: stats.activeAdmins,
      icon: "✅",
    },
    {
      title: "Deactivated Admins",
      value: stats.deactivatedAdmins,
      icon: "🚫",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: "🎓",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}

      <header className="border-b border-white/10 bg-slate-950/95">
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

          <div className="flex items-center gap-4">

            {/* SuperAdmin Profile */}

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white/5"
              title="My Profile"
              aria-label="My Profile"
            >
              {/* Name + Role */}

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {profile?.name ||
                    "Super Administrator"}
                </p>

                <p className="text-xs text-blue-400">
                  System Administrator
                </p>
              </div>

              {/* Avatar */}

              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.name
                    ?.charAt(0)
                    .toUpperCase() || "SA"
                )}
              </div>
            </Link>

            {/* Logout */}

            <form
              action="/api/logout"
              method="POST"
            >
              <button
                type="submit"
                title="Logout"
                aria-label="Logout"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                ⏻
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Dashboard */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Heading */}

        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-blue-400">
            SYSTEM ADMINISTRATION
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            SuperAdmin Dashboard
          </h2>

          <p className="mt-2 text-slate-400">
            Manage administrators and oversee the
            entire HostelHub system.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Statistics */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-xl">
                {stat.icon}
              </div>

              <p className="text-sm text-slate-400">
                {stat.title}
              </p>

              <p className="mt-1 text-3xl font-bold">
                {loading
                  ? "..."
                  : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* System Status */}

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                System Status
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Current global HostelHub configuration.
              </p>
            </div>

            <Link
              href="/superadmin/settings"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Manage Settings
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Maintenance Status */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                      stats.maintenanceMode
                        ? "bg-red-500/10"
                        : "bg-green-500/10"
                    }`}
                  >
                    {stats.maintenanceMode
                      ? "🛠️"
                      : "🟢"}
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      Maintenance Mode
                    </h4>

                    <p className="mt-1 text-sm text-slate-400">
                      {loading
                        ? "Checking system status..."
                        : stats.maintenanceMode
                          ? "System is currently under maintenance."
                          : "System is operational."}
                    </p>
                  </div>
                </div>

                {!loading && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      stats.maintenanceMode
                        ? "border-red-500/20 bg-red-500/10 text-red-300"
                        : "border-green-500/20 bg-green-500/10 text-green-300"
                    }`}
                  >
                    {stats.maintenanceMode
                      ? "ACTIVE"
                      : "OFF"}
                  </span>
                )}
              </div>
            </div>

            {/* Admin Creation Status */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                      stats.allowAdminCreation
                        ? "bg-green-500/10"
                        : "bg-yellow-500/10"
                    }`}
                  >
                    {stats.allowAdminCreation
                      ? "👨‍💼"
                      : "🔒"}
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      Admin Account Creation
                    </h4>

                    <p className="mt-1 text-sm text-slate-400">
                      {loading
                        ? "Checking setting..."
                        : stats.allowAdminCreation
                          ? "New administrators can be created."
                          : "New administrator creation is disabled."}
                    </p>
                  </div>
                </div>

                {!loading && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      stats.allowAdminCreation
                        ? "border-green-500/20 bg-green-500/10 text-green-300"
                        : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                    }`}
                  >
                    {stats.allowAdminCreation
                      ? "ENABLED"
                      : "DISABLED"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Management */}

        <div className="mt-10">
          <h3 className="mb-5 text-xl font-bold">
            SuperAdmin Management
          </h3>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Admin Management */}

            <Link
              href="/superadmin/admins"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                👨‍💼
              </div>

              <h4 className="font-semibold">
                Admin Management
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                Create, deactivate and manage
                administrator accounts.
              </p>

              <div className="mt-5 text-sm font-medium text-blue-400">
                Manage Admins →
              </div>
            </Link>

            {/* System Audit */}

            <Link
              href="/superadmin/audit"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                📊
              </div>

              <h4 className="font-semibold">
                System Audit
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                Monitor administrative actions
                across the system.
              </p>

              <div className="mt-5 text-sm font-medium text-blue-400">
                View Audit Logs →
              </div>
            </Link>

            {/* System Settings */}

            <Link
              href="/superadmin/settings"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                ⚙️
              </div>

              <h4 className="font-semibold">
                System Settings
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                Manage global HostelHub settings.
              </p>

              <div className="mt-5 text-sm font-medium text-blue-400">
                Manage Settings →
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

