"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type Admin = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN";
  status: "ACTIVE" | "DEACTIVATED";
  createdAt: string;
  updatedAt: string;
};

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] =
    useState<Admin[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [editPhone, setEditPhone] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [
    allowAdminCreation,
    setAllowAdminCreation,
  ] = useState(true);

  const [
    settingsLoading,
    setSettingsLoading,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * --------------------------------------------------
   * Load Administrators
   * --------------------------------------------------
   */

  async function loadAdmins() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/superadmin/admins"
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load administrators"
        );
      }

      setAdmins(data);
    } catch (error) {
      console.error(
        "Load administrators error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load administrators"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * Load System Settings
   * --------------------------------------------------
   */

  async function loadSystemSettings() {
    try {
      setSettingsLoading(true);

      const response =
        await fetch(
          "/api/superadmin/settings"
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load system settings"
        );
      }

      setAllowAdminCreation(
        data.allowAdminCreation
      );
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
    } finally {
      setSettingsLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
    loadSystemSettings();
  }, []);

  /*
   * --------------------------------------------------
   * Create Administrator
   * --------------------------------------------------
   */

  async function handleCreateAdmin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (creating) return;

    setError("");
    setSuccess("");

    if (!allowAdminCreation) {
      setError(
        "Admin account creation is currently disabled by the SuperAdmin."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (phone.trim().length > 30) {
      setError(
        "Phone number cannot exceed 30 characters."
      );
      return;
    }

    setCreating(true);

    try {
      const response =
        await fetch(
          "/api/superadmin/admins",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              phone,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create administrator"
        );
      }

      setSuccess(
        "Administrator created successfully."
      );

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      await loadAdmins();
    } catch (error) {
      console.error(
        "Create administrator error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create administrator"
      );
    } finally {
      setCreating(false);
    }
  }

  /*
   * --------------------------------------------------
   * Start Editing
   * --------------------------------------------------
   */

  function handleStartEdit(
    admin: Admin
  ) {
    setError("");
    setSuccess("");

    setEditingId(admin.id);

    setEditName(admin.name);

    setEditEmail(admin.email);

    setEditPhone(admin.phone || "");
  }

  /*
   * --------------------------------------------------
   * Cancel Editing
   * --------------------------------------------------
   */

  function handleCancelEdit() {
    if (savingEdit) return;

    setEditingId(null);

    setEditName("");

    setEditEmail("");

    setEditPhone("");
  }

  /*
   * --------------------------------------------------
   * Save Administrator Edit
   * --------------------------------------------------
   */

  async function handleSaveEdit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      savingEdit ||
      editingId === null
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const trimmedName =
      editName.trim();

    const trimmedEmail =
      editEmail.trim();

    const trimmedPhone =
      editPhone.trim();

    if (!trimmedName) {
      setError(
        "Administrator name is required."
      );
      return;
    }

    if (!trimmedEmail) {
      setError(
        "Administrator email is required."
      );
      return;
    }

    if (
      trimmedPhone.length > 30
    ) {
      setError(
        "Phone number cannot exceed 30 characters."
      );
      return;
    }

    setSavingEdit(true);

    try {
      const response =
        await fetch(
          `/api/superadmin/admins/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: trimmedName,
              email: trimmedEmail,
              phone: trimmedPhone,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update administrator"
        );
      }

      setSuccess(
        data.message ||
          "Administrator updated successfully."
      );

      setEditingId(null);

      setEditName("");

      setEditEmail("");

      setEditPhone("");

      await loadAdmins();
    } catch (error) {
      console.error(
        "Edit administrator error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update administrator"
      );
    } finally {
      setSavingEdit(false);
    }
  }

  /*
   * --------------------------------------------------
   * Activate / Deactivate
   * --------------------------------------------------
   */

  async function handleToggleStatus(
    admin: Admin
  ) {
    if (
      updatingId !== null ||
      savingEdit
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const newStatus =
      admin.status === "ACTIVE"
        ? "DEACTIVATED"
        : "ACTIVE";

    const confirmed =
      window.confirm(
        newStatus === "DEACTIVATED"
          ? `Are you sure you want to deactivate ${admin.name}?`
          : `Are you sure you want to reactivate ${admin.name}?`
      );

    if (!confirmed) {
      return;
    }

    setUpdatingId(admin.id);

    try {
      const response =
        await fetch(
          `/api/superadmin/admins/${admin.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status: newStatus,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update administrator"
        );
      }

      setSuccess(
        data.message ||
          "Administrator status updated successfully."
      );

      await loadAdmins();
    } catch (error) {
      console.error(
        "Update administrator error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update administrator"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * --------------------------------------------------
   * UI
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}

      <header className="border-b border-white/10 bg-[#030712]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
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

          <div className="flex items-center gap-3">
            <Link
              href="/superadmin/dashboard"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              ← Dashboard
            </Link>

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

      <section className="mx-auto max-w-7xl px-6 py-10 animate-fade-in-up">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-blue-400">
            SUPERADMIN MANAGEMENT
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            Administrator Management
          </h2>

          <p className="mt-2 text-slate-400">
            Create and manage administrator
            accounts for HostelHub.
          </p>
        </div>

        {/* Messages */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm text-green-300">
            {success}
          </div>
        )}

        {/* Create Administrator */}

        <div className="mb-10 rounded-2xl glass-card shadow-xl p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-bold">
                Create Administrator
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Create a new administrator account.
              </p>
            </div>

            {!settingsLoading && (
              <div>
                {allowAdminCreation ? (
                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-300">
                    ● Creation Enabled
                  </span>
                ) : (
                  <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300">
                    ● Creation Disabled
                  </span>
                )}
              </div>
            )}
          </div>

          {!settingsLoading &&
            !allowAdminCreation && (
              <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4">
                <p className="text-sm font-medium text-yellow-300">
                  Administrator creation is
                  currently disabled.
                </p>

                <p className="mt-1 text-xs text-yellow-400/70">
                  Enable "Allow Admin Creation"
                  from System Settings to create
                  new administrator accounts.
                </p>

                <Link
                  href="/superadmin/settings"
                  className="mt-3 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Open System Settings →
                </Link>
              </div>
            )}

          {settingsLoading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
              Loading administrator creation
              settings...
            </div>
          ) : (
            <form
              onSubmit={handleCreateAdmin}
              className="grid gap-5 md:grid-cols-4"
            >
              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  disabled={
                    !allowAdminCreation
                  }
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Administrator name"
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  disabled={
                    !allowAdminCreation
                  }
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>

              {/* Phone */}

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  disabled={
                    !allowAdminCreation
                  }
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="Phone number"
                  maxLength={30}
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  disabled={
                    !allowAdminCreation
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>

              {/* Create Button */}

              <div className="md:col-span-4">
                <button
                  type="submit"
                  disabled={
                    creating ||
                    !allowAdminCreation
                  }
                  className="rounded-xl btn-gradient shadow-lg px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Administrator"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Administrators */}

        <div className="rounded-2xl glass-card shadow-xl p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold">
                Administrators
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {admins.length} administrator
                {admins.length === 1
                  ? ""
                  : "s"} found
              </p>
            </div>

            <button
              type="button"
              onClick={loadAdmins}
              disabled={loading}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-400">
              Loading administrators...
            </div>
          ) : admins.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="text-4xl">
                👨‍💼
              </div>

              <p className="mt-3 font-semibold">
                No administrators found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create the first administrator
                above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-5 py-4 text-sm">
                      Name
                    </th>

                    <th className="px-5 py-4 text-sm">
                      Email
                    </th>

                    <th className="px-5 py-4 text-sm">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-sm">
                      Role
                    </th>

                    <th className="px-5 py-4 text-sm">
                      Status
                    </th>

                    <th className="px-5 py-4 text-sm">
                      Created
                    </th>

                    <th className="px-5 py-4 text-right text-sm">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5"
                    >
                      <td className="px-5 py-4 font-medium">
                        {admin.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {admin.email}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {admin.phone || "Not set"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                          ADMIN
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {admin.status ===
                        "ACTIVE" ? (
                          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                            DEACTIVATED
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {new Date(
                          admin.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        {editingId ===
                        admin.id ? (
                          <form
                            onSubmit={
                              handleSaveEdit
                            }
                            className="min-w-[340px] space-y-3"
                          >
                            {/* Edit Name */}

                            <input
                              type="text"
                              required
                              value={
                                editName
                              }
                              onChange={(
                                event
                              ) =>
                                setEditName(
                                  event.target
                                    .value
                                )
                              }
                              placeholder="Administrator name"
                              disabled={
                                savingEdit
                              }
                              className="w-full rounded-lg border border-white/10 input-glow bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            {/* Edit Email */}

                            <input
                              type="email"
                              required
                              value={
                                editEmail
                              }
                              onChange={(
                                event
                              ) =>
                                setEditEmail(
                                  event.target
                                    .value
                                )
                              }
                              placeholder="Administrator email"
                              disabled={
                                savingEdit
                              }
                              className="w-full rounded-lg border border-white/10 input-glow bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            {/* Edit Phone */}

                            <input
                              type="tel"
                              value={
                                editPhone
                              }
                              onChange={(
                                event
                              ) =>
                                setEditPhone(
                                  event.target
                                    .value
                                )
                              }
                              placeholder="Phone number"
                              maxLength={30}
                              disabled={
                                savingEdit
                              }
                              className="w-full rounded-lg border border-white/10 input-glow bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={
                                  handleCancelEdit
                                }
                                disabled={
                                  savingEdit
                                }
                                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Cancel
                              </button>

                              <button
                                type="submit"
                                disabled={
                                  savingEdit
                                }
                                className="rounded-lg btn-gradient shadow-lg px-3 py-2 text-sm font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingEdit
                                  ? "Saving..."
                                  : "Save Changes"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleStartEdit(
                                  admin
                                )
                              }
                              disabled={
                                updatingId !==
                                  null ||
                                savingEdit
                              }
                              className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  admin
                                )
                              }
                              disabled={
                                updatingId ===
                                  admin.id ||
                                savingEdit
                              }
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                admin.status ===
                                "ACTIVE"
                                  ? "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                  : "border border-green-500/20 bg-green-500/10 text-green-300 hover:bg-green-500/20"
                              }`}
                            >
                              {updatingId ===
                              admin.id
                                ? "Updating..."
                                : admin.status ===
                                  "ACTIVE"
                                ? "Deactivate"
                                : "Reactivate"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}