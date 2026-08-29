"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

type LoginRole =
  | "student"
  | "admin"
  | "superadmin";

type RecoveryAction =
  | "PASSWORD"
  | "USER_ID";

type RecoveryStep =
  | "VERIFY"
  | "RESET_PASSWORD"
  | "USER_ID_RESULT";

function LoginContent() {
  const searchParams = useSearchParams();

  /*
   * --------------------------------------------------
   * Login state
   * --------------------------------------------------
   */

  const [role, setRole] =
    useState<LoginRole>("student");

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * --------------------------------------------------
   * Recovery state
   * --------------------------------------------------
   */

  const [recoveryMode, setRecoveryMode] =
    useState<RecoveryAction | null>(null);

  const [recoveryStep, setRecoveryStep] =
    useState<RecoveryStep>("VERIFY");

  const [recoveryLoading, setRecoveryLoading] =
    useState(false);

  const [recoveryError, setRecoveryError] =
    useState("");

  const [recoverySuccess, setRecoverySuccess] =
    useState("");

  const [recoveryName, setRecoveryName] =
    useState("");

  const [recoveryPhone, setRecoveryPhone] =
    useState("");

  const [recoveryStudentId, setRecoveryStudentId] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [recoveredUserId, setRecoveredUserId] =
    useState("");

  /*
   * --------------------------------------------------
   * Select login role from URL
   * --------------------------------------------------
   */

  useEffect(() => {
    const roleFromUrl =
      searchParams.get("role");

    if (roleFromUrl === "ADMIN") {
      setRole("admin");
    } else if (
      roleFromUrl === "SUPERADMIN"
    ) {
      setRole("superadmin");
    } else {
      setRole("student");
    }

    setError("");
  }, [searchParams]);

  /*
   * --------------------------------------------------
   * Login
   * --------------------------------------------------
   */

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            role:
              role === "superadmin"
                ? "SUPER_ADMIN"
                : role.toUpperCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Login failed"
        );
        return;
      }

      if (
        data.user.role ===
        "SUPER_ADMIN"
      ) {
        window.location.href =
          "/superadmin/dashboard";
      } else if (
        data.user.role === "ADMIN"
      ) {
        window.location.href =
          "/admin/dashboard";
      } else {
        window.location.href =
          "/student/dashboard";
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * Open recovery
   * --------------------------------------------------
   */

  function openRecovery(
    action: RecoveryAction
  ) {
    setRecoveryMode(action);
    setRecoveryStep("VERIFY");

    setRecoveryError("");
    setRecoverySuccess("");

    setRecoveryName("");
    setRecoveryPhone("");
    setRecoveryStudentId("");

    setNewPassword("");
    setConfirmPassword("");

    setRecoveredUserId("");
  }

  /*
   * --------------------------------------------------
   * Close recovery
   * --------------------------------------------------
   */

  function closeRecovery() {
    setRecoveryMode(null);
    setRecoveryStep("VERIFY");

    setRecoveryError("");
    setRecoverySuccess("");

    setRecoveryName("");
    setRecoveryPhone("");
    setRecoveryStudentId("");

    setNewPassword("");
    setConfirmPassword("");

    setRecoveredUserId("");
  }

  /*
   * --------------------------------------------------
   * Change role
   * --------------------------------------------------
   */

  function handleRoleChange(
    newRole: LoginRole
  ) {
    setRole(newRole);
    setError("");

    /*
     * If recovery is open, close it so
     * verification information cannot
     * accidentally carry over between roles.
     */
    if (recoveryMode) {
      closeRecovery();
    }
  }

  /*
   * --------------------------------------------------
   * Recovery
   * --------------------------------------------------
   */

  async function handleRecovery(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      recoveryLoading ||
      !recoveryMode
    ) {
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError("");
    setRecoverySuccess("");

    /*
     * Password validation is performed
     * here before contacting the server.
     */

    if (
      recoveryMode === "PASSWORD"
    ) {
      if (
        newPassword.length < 8
      ) {
        setRecoveryError(
          "New password must be at least 8 characters long."
        );

        setRecoveryLoading(false);
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setRecoveryError(
          "New password and confirmation password do not match."
        );

        setRecoveryLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(
        "/api/auth/recovery",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: recoveryMode,
            role:
              role === "superadmin"
                ? "SUPER_ADMIN"
                : role.toUpperCase(),

            name: recoveryName,
            phone: recoveryPhone,

            studentId:
              role === "student"
                ? recoveryStudentId
                : undefined,

            newPassword:
              recoveryMode ===
              "PASSWORD"
                ? newPassword
                : undefined,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setRecoveryError(
          data.message ||
            "Verification failed."
        );

        return;
      }

      /*
       * ------------------------------------------------
       * Forgot User ID
       * ------------------------------------------------
       */

      if (
        recoveryMode === "USER_ID"
      ) {
        setRecoveredUserId(
          data.user.email
        );

        setRecoveryStep(
          "USER_ID_RESULT"
        );

        return;
      }

      /*
       * ------------------------------------------------
       * Forgot Password
       * ------------------------------------------------
       */

      setRecoverySuccess(
        data.message ||
          "Password changed successfully."
      );

      setRecoveryStep(
        "VERIFY"
      );

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Recovery error:",
        error
      );

      setRecoveryError(
        "Unable to connect to the server."
      );
    } finally {
      setRecoveryLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * Role labels
   * --------------------------------------------------
   */

  const roleLabel =
    role === "student"
      ? "Student"
      : role === "admin"
      ? "Admin"
      : "SuperAdmin";

  /*
   * --------------------------------------------------
   * Recovery title
   * --------------------------------------------------
   */

  const recoveryTitle =
    recoveryMode === "PASSWORD"
      ? "Forgot Password"
      : "Forgot User ID";

  /*
   * --------------------------------------------------
   * Recovery verification form
   * --------------------------------------------------
   */

  function renderRecoveryVerify() {
    return (
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-2xl">
            {recoveryMode ===
            "PASSWORD"
              ? "🔑"
              : "🪪"}
          </div>

          <h2 className="text-2xl font-bold">
            {recoveryTitle}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Verify your identity to continue.
          </p>
        </div>

        {recoveryError && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {recoveryError}
          </div>
        )}

        {recoverySuccess && (
          <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {recoverySuccess}
          </div>
        )}

        <form
          onSubmit={handleRecovery}
          className="space-y-5"
        >
          {role === "student" && (
            <div>
              <label
                htmlFor="recoveryStudentId"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Student ID
              </label>

              <input
                id="recoveryStudentId"
                type="text"
                required
                value={
                  recoveryStudentId
                }
                onChange={(event) =>
                  setRecoveryStudentId(
                    event.target.value
                  )
                }
                placeholder="Enter your Student ID"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="recoveryName"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Full Name
            </label>

            <input
              id="recoveryName"
              type="text"
              required
              autoComplete="name"
              value={recoveryName}
              onChange={(event) =>
                setRecoveryName(
                  event.target.value
                )
              }
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="recoveryPhone"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Registered Phone Number
            </label>

            <input
              id="recoveryPhone"
              type="tel"
              required
              autoComplete="tel"
              value={recoveryPhone}
              onChange={(event) =>
                setRecoveryPhone(
                  event.target.value
                )
              }
              placeholder="Enter your registered phone"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          {recoveryMode ===
            "PASSWORD" && (
            <>
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  New Password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={recoveryLoading}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {recoveryLoading
              ? "Verifying..."
              : recoveryMode ===
                "PASSWORD"
              ? "Verify & Change Password"
              : "Verify & Show User ID"}
          </button>
        </form>

        <button
          type="button"
          onClick={closeRecovery}
          className="mt-5 w-full text-sm text-slate-500 transition hover:text-white"
        >
          ← Back to Login
        </button>
      </>
    );
  }

  /*
   * --------------------------------------------------
   * User ID result
   * --------------------------------------------------
   */

  function renderUserIdResult() {
    return (
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600/10 text-2xl">
            ✅
          </div>

          <h2 className="text-2xl font-bold">
            User ID Found
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Your registered login User ID is:
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-5 text-center">
          <p className="break-all text-lg font-semibold text-green-300">
            {recoveredUserId}
          </p>
        </div>

        <p className="mb-5 text-center text-xs text-slate-500">
          Your User ID has not been changed.
        </p>

        <button
          type="button"
          onClick={closeRecovery}
          className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold transition hover:bg-blue-500"
        >
          Back to Login
        </button>
      </>
    );
  }

  /*
   * --------------------------------------------------
   * Main UI
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-5">
          <a
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl">
              🏠
            </div>

            <div>
              <h1 className="text-lg font-bold">
                HostelHub
              </h1>

              <p className="text-xs text-slate-400">
                Hostel Management System
              </p>
            </div>
          </a>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {!recoveryMode ? (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-3xl">
                  🔐
                </div>

                <h2 className="text-3xl font-bold">
                  Welcome Back
                </h2>

                <p className="mt-2 text-slate-400">
                  Login to your HostelHub account
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl">
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-slate-300">
                    Login as
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange(
                          "student"
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        role === "student"
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      🎓 Student
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange(
                          "admin"
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        role === "admin"
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      👨‍💼 Admin
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange(
                          "superadmin"
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        role === "superadmin"
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      🛡️ SuperAdmin
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      {role === "student"
                        ? "Student Email"
                        : role === "admin"
                        ? "Admin Email"
                        : "SuperAdmin Email"}
                    </label>

                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder={
                        role === "student"
                          ? "student@example.com"
                          : role === "admin"
                          ? "admin@example.com"
                          : "superadmin@example.com"
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

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
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Logging in..."
                      : `Login as ${roleLabel} →`}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-center gap-4 text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      openRecovery(
                        "PASSWORD"
                      )
                    }
                    className="text-blue-400 transition hover:text-blue-300"
                  >
                    Forgot Password?
                  </button>

                  <span className="text-slate-700">
                    |
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      openRecovery(
                        "USER_ID"
                      )
                    }
                    className="text-blue-400 transition hover:text-blue-300"
                  >
                    Forgot User ID?
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  ← Back to Home
                </a>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl">
              {recoveryStep ===
              "USER_ID_RESULT"
                ? renderUserIdResult()
                : renderRecoveryVerify()}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="text-slate-400">
            Loading login...
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

