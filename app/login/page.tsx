"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
  useRef,
  useCallback,
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
  const panelRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const xRatio = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yRatio = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    // user requested "360 degree upside down in all direction" but that's a bit wild, let's bump it to 30 degrees to make it very 3D
    const rotateY = xRatio * 30;
    const rotateX = yRatio * -30;
    const moveX = xRatio * -25;
    const moveY = yRatio * -25;
    imgRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${moveX}px, ${moveY}px) scale(1.15)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!imgRef.current) return;
    imgRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translate(0px, 0px) scale(1.15)";
  }, []);

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
      <div className="animate-scale-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-2xl shadow-inner shadow-blue-500/20">
            {recoveryMode === "PASSWORD" ? "🔑" : "🪪"}
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            {recoveryTitle}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Verify your identity to continue.
          </p>
        </div>

        {recoveryError && (
          <div className="animate-fade-in mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
            <span className="mr-2">⚠️</span>{recoveryError}
          </div>
        )}

        {recoverySuccess && (
          <div className="animate-fade-in mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 backdrop-blur-sm">
            <span className="mr-2">✅</span>{recoverySuccess}
          </div>
        )}

        <form onSubmit={handleRecovery} className="space-y-5">
          {role === "student" && (
            <div>
              <label htmlFor="recoveryStudentId" className="mb-2 block text-sm font-medium text-slate-300">
                Student ID
              </label>
              <input
                id="recoveryStudentId"
                type="text"
                required
                value={recoveryStudentId}
                onChange={(event) => setRecoveryStudentId(event.target.value)}
                placeholder="Enter your Student ID"
                className="input-glow w-full rounded-xl px-4 py-3.5 text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="recoveryName" className="mb-2 block text-sm font-medium text-slate-300">
              Full Name
            </label>
            <input
              id="recoveryName"
              type="text"
              required
              autoComplete="name"
              value={recoveryName}
              onChange={(event) => setRecoveryName(event.target.value)}
              placeholder="Enter your full name"
              className="input-glow w-full rounded-xl px-4 py-3.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="recoveryPhone" className="mb-2 block text-sm font-medium text-slate-300">
              Registered Phone Number
            </label>
            <input
              id="recoveryPhone"
              type="tel"
              required
              autoComplete="tel"
              value={recoveryPhone}
              onChange={(event) => setRecoveryPhone(event.target.value)}
              placeholder="Enter your registered phone"
              className="input-glow w-full rounded-xl px-4 py-3.5 text-sm"
            />
          </div>

          {recoveryMode === "PASSWORD" && (
            <>
              <div>
                <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-slate-300">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter new password"
                  className="input-glow w-full rounded-xl px-4 py-3.5 text-sm"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  className="input-glow w-full rounded-xl px-4 py-3.5 text-sm"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={recoveryLoading}
            className="btn-gradient mt-2 w-full rounded-xl py-3.5 font-semibold"
          >
            {recoveryLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                </svg>
                Verifying...
              </span>
            ) : recoveryMode === "PASSWORD" ? (
              "Verify & Change Password"
            ) : (
              "Verify & Show User ID"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={closeRecovery}
          className="mt-6 w-full text-sm text-slate-500 transition hover:text-blue-400"
        >
          ← Back to Login
        </button>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * User ID result
   * --------------------------------------------------
   */

  function renderUserIdResult() {
    return (
      <div className="animate-scale-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 text-2xl shadow-inner shadow-emerald-500/20">
            ✅
          </div>
          <h2 className="text-2xl font-bold tracking-tight">User ID Found</h2>
          <p className="mt-2 text-sm text-slate-400">Your registered login User ID is:</p>
        </div>

        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-5 text-center shadow-inner shadow-emerald-500/10 backdrop-blur-sm">
          <p className="break-all text-lg font-semibold text-emerald-300">
            {recoveredUserId}
          </p>
        </div>

        <p className="mb-8 text-center text-xs text-slate-500">
          Your User ID has not been changed.
        </p>

        <button
          type="button"
          onClick={closeRecovery}
          className="btn-gradient w-full rounded-xl py-3.5 font-semibold"
        >
          Back to Login
        </button>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * Main UI
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#030712] text-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Panel - Illustration */}
      <div 
        ref={panelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="hidden w-full md:w-1/2 lg:w-[55%] relative md:flex flex-col justify-between p-10 lg:p-16 border-r border-white/10"
        style={{ perspective: "1200px" }}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            ref={imgRef}
            src="/login-illustration.jpg?v=2" 
            alt="Login Illustration" 
            className="w-full h-full object-cover opacity-60 will-change-transform"
            style={{
              transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translate(0px, 0px) scale(1.15)",
              transition: "transform 0.2s ease-out",
              transformOrigin: "center center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/80 via-[#030712]/50 to-[#030712]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold shadow-lg shadow-blue-500/20">
            H
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HostelHub</h1>
          </div>
        </div>

        <div className="relative z-10 max-w-md animate-fade-in-up">
          <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Welcome back to <span className="gradient-text">your space.</span>
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Manage your hostel life seamlessly. From room allocations to fees and complaints, everything is just a click away.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center px-6 py-12 lg:px-16 relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold shadow-lg shadow-blue-500/20">
            H
          </div>
          <h1 className="text-xl font-bold tracking-tight">HostelHub</h1>
        </div>

        <div className="w-full max-w-md mx-auto">
          {!recoveryMode ? (
            <div className="animate-slide-in-right">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
                <p className="mt-2 text-slate-400">
                  Enter your details to access your account
                </p>
              </div>

              <div className="glass-card rounded-2xl p-7 shadow-2xl">
                <div className="mb-8">
                  <div className="flex rounded-xl bg-black/40 p-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() => handleRoleChange("student")}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                        role === "student"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange("admin")}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                        role === "admin"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      👨‍💼 Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange("superadmin")}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                        role === "superadmin"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      👑 Super
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="animate-fade-in mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
                    <span className="mr-2">⚠️</span>{error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                      {role === "student" ? "Student Email" : role === "admin" ? "Admin Email" : "SuperAdmin Email"}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={
                        role === "student" ? "student@example.com" : role === "admin" ? "admin@example.com" : "superadmin@example.com"
                      }
                      className="input-glow w-full rounded-xl px-4 py-3.5 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="input-glow w-full rounded-xl px-4 py-3.5 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 mb-6">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="remember" className="h-4 w-4 rounded border-white/10 bg-black/50 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0" />
                      <label htmlFor="remember" className="text-sm text-slate-400">Remember me</label>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => openRecovery("PASSWORD")}
                      className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient mt-2 w-full rounded-xl py-3.5 font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      `Sign in as ${roleLabel}`
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => openRecovery("USER_ID")}
                    className="text-slate-400 transition hover:text-white"
                  >
                    Forgot your User ID?
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-400">
                  <span>←</span> Back to Home
                </a>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-7 shadow-2xl">
              {recoveryStep === "USER_ID_RESULT"
                ? renderUserIdResult()
                : renderRecoveryVerify()}
            </div>
          )}
        </div>
      </div>
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

