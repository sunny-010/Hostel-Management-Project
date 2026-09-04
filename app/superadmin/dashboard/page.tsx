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
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [response, profileResponse] =
          await Promise.all([
            fetch("/api/superadmin/dashboard"),
            fetch("/api/profile", {
              credentials: "include",
            }),
          ]);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load dashboard statistics"
          );
        }

        if (!profileResponse.ok) {
          throw new Error("Failed to load profile");
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

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

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
                SuperAdmin Portal
              </p>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* SuperAdmin Profile */}
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5"
              title="My Profile"
            >
              {/* Name + Role */}
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {loading ? (
                    <span className="inline-block h-4 w-24 rounded bg-white/10 animate-shimmer" />
                  ) : (
                    profile?.name || "Super Administrator"
                  )}
                </p>

                <p className="text-xs text-blue-400">
                  System Administrator
                </p>
              </div>

              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-sm font-bold text-blue-300 shadow-inner shadow-blue-500/20">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || "SA"
                )}
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
        {/* Heading */}
        <div className="mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-4 shadow-inner shadow-blue-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            SYSTEM ADMINISTRATION
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight">
            SuperAdmin <span className="gradient-text">Dashboard</span>
          </h2>

          <p className="mt-3 text-lg text-slate-400 max-w-2xl">
            Manage administrators and oversee the entire HostelHub system configuration.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300 backdrop-blur-sm animate-fade-in-up">
            ⚠️ {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {statCards.map((stat, i) => {
             const colors = [
              "blue", "emerald", "red", "purple"
            ];
            const color = colors[i % colors.length];
            return (
            <div
              key={stat.title}
              className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden transition hover:-translate-y-1 group"
            >
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${color}-500/10 blur-2xl transition-all group-hover:bg-${color}-500/20`} />
              
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 text-2xl shadow-inner shadow-${color}-500/20 border border-${color}-500/20 relative z-10`}>
                {stat.icon}
              </div>

              <p className="text-sm font-medium text-slate-400 relative z-10">
                {stat.title}
              </p>

              <p className="mt-1 text-3xl font-bold relative z-10">
                {loading ? (
                    <span className="inline-block h-8 w-16 rounded bg-white/10 animate-shimmer" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          )})}
        </div>

        {/* System Status */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                System Status
              </h3>
              <p className="mt-1 text-slate-400">
                Current global HostelHub configuration.
              </p>
            </div>

            <Link
              href="/superadmin/settings"
              className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Manage Settings
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Maintenance Status */}
            <div className="glass-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl text-3xl shadow-inner ${
                      stats.maintenanceMode
                        ? "bg-red-500/20 border border-red-500/30 text-red-400 shadow-red-500/20"
                        : "bg-green-500/20 border border-green-500/30 text-green-400 shadow-green-500/20"
                    }`}
                  >
                    {stats.maintenanceMode ? "🛠️" : "🟢"}
                  </div>

                  <div>
                    <h4 className="font-bold text-lg">
                      Maintenance Mode
                    </h4>

                    <p className="mt-1 text-sm text-slate-400">
                      {loading
                        ? (
                            <span className="inline-block h-4 w-40 rounded bg-white/10 animate-shimmer" />
                          )
                        : stats.maintenanceMode
                          ? "System is currently under maintenance."
                          : "System is operational."}
                    </p>
                  </div>
                </div>

                {!loading && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${
                      stats.maintenanceMode
                        ? "border-red-500/30 bg-red-500/10 text-red-400 shadow-inner shadow-red-500/10"
                        : "border-green-500/30 bg-green-500/10 text-green-400 shadow-inner shadow-green-500/10"
                    }`}
                  >
                    {stats.maintenanceMode ? "ACTIVE" : "OFF"}
                  </span>
                )}
              </div>
            </div>

            {/* Admin Creation Status */}
            <div className="glass-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl text-3xl shadow-inner ${
                      stats.allowAdminCreation
                        ? "bg-green-500/20 border border-green-500/30 text-green-400 shadow-green-500/20"
                        : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 shadow-yellow-500/20"
                    }`}
                  >
                    {stats.allowAdminCreation ? "👨‍💼" : "🔒"}
                  </div>

                  <div>
                    <h4 className="font-bold text-lg">
                      Admin Account Creation
                    </h4>

                    <p className="mt-1 text-sm text-slate-400">
                      {loading
                        ? (
                            <span className="inline-block h-4 w-40 rounded bg-white/10 animate-shimmer" />
                          )
                        : stats.allowAdminCreation
                          ? "New administrators can be created."
                          : "New administrator creation is disabled."}
                    </p>
                  </div>
                </div>

                {!loading && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${
                      stats.allowAdminCreation
                        ? "border-green-500/30 bg-green-500/10 text-green-400 shadow-inner shadow-green-500/10"
                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 shadow-inner shadow-yellow-500/10"
                    }`}
                  >
                    {stats.allowAdminCreation ? "ENABLED" : "DISABLED"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Management */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <h3 className="mb-6 text-2xl font-bold tracking-tight">
            SuperAdmin Management
          </h3>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Admin Management */}
            <Link
              href="/superadmin/admins"
              className="group glass-card rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 hover:border-blue-500/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-indigo-500/0 transition-all duration-500 group-hover:from-blue-500/5 group-hover:to-indigo-500/5" />
              <div className="relative z-10">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 group-hover:shadow-blue-500/20">
                  👨‍💼
                </div>

                <h4 className="text-lg font-bold tracking-tight transition-colors group-hover:text-blue-400">
                  Admin Management
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Create, deactivate and manage administrator accounts.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-500 transition-colors group-hover:text-blue-400">
                  Manage Admins <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>

            {/* System Audit */}
            <Link
              href="/superadmin/audit"
              className="group glass-card rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 hover:border-blue-500/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-indigo-500/0 transition-all duration-500 group-hover:from-blue-500/5 group-hover:to-indigo-500/5" />
              <div className="relative z-10">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 group-hover:shadow-blue-500/20">
                  📊
                </div>

                <h4 className="text-lg font-bold tracking-tight transition-colors group-hover:text-blue-400">
                  System Audit
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Monitor administrative actions across the system.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-500 transition-colors group-hover:text-blue-400">
                  View Audit Logs <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>

            {/* System Settings */}
            <Link
              href="/superadmin/settings"
              className="group glass-card rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 hover:border-blue-500/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-indigo-500/0 transition-all duration-500 group-hover:from-blue-500/5 group-hover:to-indigo-500/5" />
              <div className="relative z-10">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 group-hover:shadow-blue-500/20">
                  ⚙️
                </div>

                <h4 className="text-lg font-bold tracking-tight transition-colors group-hover:text-blue-400">
                  System Settings
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Manage global HostelHub configuration and options.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-500 transition-colors group-hover:text-blue-400">
                  Manage Settings <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}