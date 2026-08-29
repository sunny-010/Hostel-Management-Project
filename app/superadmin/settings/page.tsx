"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SystemSettings = {
  id: number;
  systemName: string;
  institutionName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  maintenanceMode: boolean;
  allowAdminCreation: boolean;
  createdAt: string;
  updatedAt: string;
};

type SuperAdminProfile = {
  name: string;
  email: string;
  profileImage: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "STUDENT";
};

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] =
    useState<SystemSettings | null>(null);

  const [profile, setProfile] =
    useState<SuperAdminProfile | null>(null);

  const [systemName, setSystemName] = useState("");
  const [institutionName, setInstitutionName] =
    useState("");
  const [contactEmail, setContactEmail] =
    useState("");
  const [contactPhone, setContactPhone] =
    useState("");
  const [maintenanceMode, setMaintenanceMode] =
    useState(false);
  const [allowAdminCreation, setAllowAdminCreation] =
    useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSettings() {
    try {
      setError("");

      const response = await fetch(
        "/api/superadmin/settings"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load system settings"
        );
      }

      setSettings(data);
      setSystemName(data.systemName);
      setInstitutionName(data.institutionName);
      setContactEmail(data.contactEmail || "");
      setContactPhone(data.contactPhone || "");
      setMaintenanceMode(data.maintenanceMode);
      setAllowAdminCreation(data.allowAdminCreation);
    } catch (error) {
      console.error(
        "Load system settings error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load system settings"
      );
    }
  }

  async function loadProfile() {
    try {
      const response = await fetch("/api/profile");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load profile"
        );
      }

      setProfile(data.user);
    } catch (error) {
      console.error(
        "Load profile error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load profile"
      );
    }
  }

  useEffect(() => {
    async function loadPageData() {
      setLoading(true);

      await Promise.all([
        loadSettings(),
        loadProfile(),
      ]);

      setLoading(false);
    }

    loadPageData();
  }, []);

  async function handleSave() {
    if (saving) return;

    setError("");
    setSuccess("");

    if (!systemName.trim()) {
      setError("System name is required.");
      return;
    }

    if (!institutionName.trim()) {
      setError("Institution name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/superadmin/settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemName,
            institutionName,
            contactEmail: contactEmail || null,
            contactPhone: contactPhone || null,
            maintenanceMode,
            allowAdminCreation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update system settings"
        );
      }

      setSettings(data.settings);

      setSuccess(
        "System settings updated successfully."
      );
    } catch (error) {
      console.error(
        "Update system settings error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update system settings"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <Link
            href="/superadmin/dashboard"
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
                  {loading
                    ? "Loading..."
                    : profile?.name || "Super Administrator"}
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
                    .toUpperCase() || "S"
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

      {/* Content */}
      <section className="mx-auto max-w-5xl px-6 py-10">

        {/* Back */}
        <Link
          href="/superadmin/dashboard"
          className="mb-6 inline-flex text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            SYSTEM CONFIGURATION
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            System Settings
          </h2>

          <p className="mt-2 text-slate-400">
            Configure global settings for the
            HostelHub system.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm text-green-300">
            {success}
          </div>
        )}

        {/* Loading Settings */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-slate-400">
              Loading system settings...
            </p>
          </div>
        ) : (
          <>
            {/* General Settings */}
            <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">
                  General Settings
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Basic information displayed throughout
                  the system.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* System Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    System Name
                  </label>

                  <input
                    value={systemName}
                    onChange={(e) =>
                      setSystemName(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    placeholder="HostelHub"
                  />
                </div>

                {/* Institution Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Institution Name
                  </label>

                  <input
                    value={institutionName}
                    onChange={(e) =>
                      setInstitutionName(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    placeholder="Hostel Management System"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Contact Email
                  </label>

                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) =>
                      setContactEmail(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    placeholder="admin@example.com"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Contact Phone
                  </label>

                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) =>
                      setContactPhone(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </section>

            {/* System Controls */}
            <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">
                  System Controls
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Control important system-wide behavior.
                </p>
              </div>

              <div className="space-y-5">

                {/* Maintenance Mode */}
                <div className="flex items-center justify-between gap-5 rounded-xl border border-white/10 bg-slate-900/50 p-5">
                  <div>
                    <h4 className="font-medium">
                      Maintenance Mode
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Temporarily place the system into
                      maintenance mode.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMaintenanceMode(
                        !maintenanceMode
                      )
                    }
                    aria-pressed={maintenanceMode}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      maintenanceMode
                        ? "bg-blue-600"
                        : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        maintenanceMode
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Admin Creation */}
                <div className="flex items-center justify-between gap-5 rounded-xl border border-white/10 bg-slate-900/50 p-5">
                  <div>
                    <h4 className="font-medium">
                      Allow Admin Creation
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Allow SuperAdmins to create new
                      administrator accounts.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setAllowAdminCreation(
                        !allowAdminCreation
                      )
                    }
                    aria-pressed={allowAdminCreation}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      allowAdminCreation
                        ? "bg-blue-600"
                        : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        allowAdminCreation
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>

            {/* Last Updated */}
            {settings && (
              <p className="mt-5 text-right text-xs text-slate-600">
                Last updated{" "}
                {new Date(
                  settings.updatedAt
                ).toLocaleString()}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}