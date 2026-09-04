
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AuditLog = {
  id: number;
  actorId: number | null;
  actorName: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: number | null;
  description: string;
  createdAt: string;
};

type ProfileUser = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  profileImage: string | null;
};

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [adminFilter, setAdminFilter] = useState("ALL");

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const response = await fetch("/api/superadmin/audit");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load audit logs"
          );
        }

        setLogs(data);
      } catch (error) {
        console.error(
          "SuperAdmin audit page error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load audit logs"
        );
      } finally {
        setLoading(false);
      }
    }

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load profile"
          );
        }

        setProfile(data.user || data);
      } catch (error) {
        console.error(
          "SuperAdmin profile error:",
          error
        );
      } finally {
        setProfileLoading(false);
      }
    }

    loadAuditLogs();
    loadProfile();
  }, []);

  const superAdminName =
    profile?.name || "Super Administrator";

  const profileImage = profile?.profileImage || null;

  const actions = useMemo(() => {
    return Array.from(
      new Set(logs.map((log) => log.action))
    ).sort();
  }, [logs]);

  const entities = useMemo(() => {
    return Array.from(
      new Set(logs.map((log) => log.entity))
    ).sort();
  }, [logs]);

  const administrators = useMemo(() => {
    const uniqueAdmins = new Map<
      string,
      {
        id: number | null;
        name: string;
        email: string;
      }
    >();

    logs.forEach((log) => {
      const key = `${log.actorId}-${log.actorEmail}`;

      if (!uniqueAdmins.has(key)) {
        uniqueAdmins.set(key, {
          id: log.actorId,
          name: log.actorName,
          email: log.actorEmail,
        });
      }
    });

    return Array.from(uniqueAdmins.values()).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !searchTerm ||
        log.actorName
          .toLowerCase()
          .includes(searchTerm) ||
        log.actorEmail
          .toLowerCase()
          .includes(searchTerm) ||
        log.action
          .toLowerCase()
          .includes(searchTerm) ||
        log.entity
          .toLowerCase()
          .includes(searchTerm) ||
        log.description
          .toLowerCase()
          .includes(searchTerm) ||
        String(log.entityId ?? "")
          .toLowerCase()
          .includes(searchTerm);

      const matchesAction =
        actionFilter === "ALL" ||
        log.action === actionFilter;

      const matchesEntity =
        entityFilter === "ALL" ||
        log.entity === entityFilter;

      const matchesAdmin =
        adminFilter === "ALL" ||
        `${log.actorId}-${log.actorEmail}` ===
          adminFilter;

      return (
        matchesSearch &&
        matchesAction &&
        matchesEntity &&
        matchesAdmin
      );
    });
  }, [
    logs,
    search,
    actionFilter,
    entityFilter,
    adminFilter,
  ]);

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

  const hasActiveFilters =
    search.trim() !== "" ||
    actionFilter !== "ALL" ||
    entityFilter !== "ALL" ||
    adminFilter !== "ALL";

  function clearFilters() {
    setSearch("");
    setActionFilter("ALL");
    setEntityFilter("ALL");
    setAdminFilter("ALL");
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  function getActionStyle(action: string) {
    switch (action) {
      case "CREATE":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "UPDATE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "DELETE":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "DEACTIVATE":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "ACTIVATE":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "APPROVE":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "REJECT":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "ALLOCATE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "LOGIN":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

      case "LOGOUT":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#030712]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link
            href="/superadmin/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-gradient shadow-lg text-xl">
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
            >
              {/* Name + Role */}
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {profileLoading
                    ? "Loading..."
                    : superAdminName}
                </p>

                <p className="text-xs text-blue-400">
                  System Administrator
                </p>
              </div>

              {/* Avatar */}
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={superAdminName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full btn-gradient shadow-lg text-sm font-bold">
                  {profileLoading
                    ? "..."
                    : superAdminName
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                </div>
              )}
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title={loggingOut ? "Logging out..." : "Logout"}
              aria-label={loggingOut ? "Logging out..." : "Logout"}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-xl text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "⏳" : "⏻"}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-10 animate-fade-in-up">
        {/* Back */}
        <Link
          href="/superadmin/dashboard"
          className="mb-6 inline-flex items-center text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            SYSTEM AUDIT
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            Audit Logs
          </h2>

          <p className="mt-2 text-slate-400">
            Monitor administrative actions performed
            across the HostelHub system.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Filters */}
        {!loading && !error && logs.length > 0 && (
          <div className="mb-6 rounded-2xl glass-card shadow-xl p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">
                  Filter Audit Logs
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Narrow down administrative activity.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search logs..."
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>

              {/* Action */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Action
                </label>

                <select
                  value={actionFilter}
                  onChange={(event) =>
                    setActionFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
                >
                  <option value="ALL">
                    All Actions
                  </option>

                  {actions.map((action) => (
                    <option
                      key={action}
                      value={action}
                    >
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entity */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Entity
                </label>

                <select
                  value={entityFilter}
                  onChange={(event) =>
                    setEntityFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
                >
                  <option value="ALL">
                    All Entities
                  </option>

                  {entities.map((entity) => (
                    <option
                      key={entity}
                      value={entity}
                    >
                      {entity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Administrator */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Administrator
                </label>

                <select
                  value={adminFilter}
                  onChange={(event) =>
                    setAdminFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
                >
                  <option value="ALL">
                    All Administrators
                  </option>

                  {administrators.map((admin) => {
                    const value = `${admin.id}-${admin.email}`;

                    return (
                      <option
                        key={value}
                        value={value}
                      >
                        {admin.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Result count */}
            <div className="mt-4 border-t border-white/5 pt-4 text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-300">
                {filteredLogs.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-300">
                {logs.length}
              </span>{" "}
              audit{" "}
              {logs.length === 1
                ? "entry"
                : "entries"}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl glass-card shadow-xl p-10 text-center text-slate-400">
            Loading audit logs...
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          logs.length === 0 && (
            <div className="rounded-2xl glass-card shadow-xl p-10 text-center">
              <div className="mb-3 text-4xl">
                📊
              </div>

              <h3 className="font-semibold">
                No audit logs found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Administrative actions will appear
                here.
              </p>
            </div>
          )}

        {/* No filter results */}
        {!loading &&
          !error &&
          logs.length > 0 &&
          filteredLogs.length === 0 && (
            <div className="rounded-2xl glass-card shadow-xl p-10 text-center">
              <div className="mb-3 text-4xl">
                🔍
              </div>

              <h3 className="font-semibold">
                No matching audit logs
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Try changing your filters or search
                term.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg btn-gradient shadow-lg px-4 py-2 text-sm font-medium transition hover:bg-blue-500"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* Audit Table */}
        {!loading &&
          !error &&
          filteredLogs.length > 0 && (
            <div className="overflow-hidden rounded-2xl glass-card shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Date & Time
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Administrator
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Action
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Entity
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Entity ID
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Description
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-white/5 transition hover:bg-white/[0.03]"
                      >
                        {/* Date */}
                        <td className="whitespace-nowrap px-5 py-5 align-top text-sm text-slate-300">
                          {formatDate(log.createdAt)}
                        </td>

                        {/* Administrator */}
                        <td className="px-5 py-5 align-top">
                          <p className="font-medium text-white">
                            {log.actorName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {log.actorEmail}
                          </p>

                          {log.actorId !== null && (
                            <p className="mt-1 text-xs text-slate-600">
                              User ID: {log.actorId}
                            </p>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-5 align-top">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getActionStyle(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="px-5 py-5 align-top">
                          <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                            {log.entity}
                          </span>
                        </td>

                        {/* Entity ID */}
                        <td className="px-5 py-5 align-top text-sm text-slate-400">
                          {log.entityId ?? "—"}
                        </td>

                        {/* Description */}
                        <td className="max-w-xl px-5 py-5 align-top text-sm leading-6 text-slate-300">
                          {log.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 px-5 py-4 text-sm text-slate-500">
                Showing {filteredLogs.length}{" "}
                {filteredLogs.length === 1
                  ? "audit entry"
                  : "audit entries"}
              </div>
            </div>
          )}
      </section>
    </main>
  );
}

