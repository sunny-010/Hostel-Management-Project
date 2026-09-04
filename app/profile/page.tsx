
"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

type UserRole =
  | "STUDENT"
  | "ADMIN"
  | "SUPER_ADMIN";

type ProfileUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  role: UserRole;
  status: string;
};

type StudentProfile = {
  studentId: string;
  phone: string | null;
  department: string | null;
  year: number | null;
} | null;

export default function ProfilePage() {
  const [user, setUser] =
    useState<ProfileUser | null>(null);

  const [student, setStudent] =
    useState<StudentProfile>(null);

  const [loading, setLoading] = useState(true);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] = useState("");
  const [profileError, setProfileError] =
    useState("");
  const [profileSuccess, setProfileSuccess] =
    useState("");
  const [passwordError, setPasswordError] =
    useState("");
  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const isSuperAdmin =
    user?.role === "SUPER_ADMIN";

  /*
   * --------------------------------------------------------------------------
   * Load Profile
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/profile",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load profile"
          );
        }

        setUser(data.user);
        setStudent(data.student || null);

        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setPhone(data.user.phone || "");

        setProfileImage(
          data.user.profileImage || null
        );
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Logout
   * --------------------------------------------------------------------------
   */

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/logout",
        {
          method: "POST",
          credentials: "include",
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

      setError(
        "Unable to logout. Please try again."
      );
    }
  }

  /*
   * --------------------------------------------------------------------------
   * Profile Image
   * --------------------------------------------------------------------------
   */

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileError("");
    setProfileSuccess("");

    if (!file.type.startsWith("image/")) {
      setProfileError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError(
        "Profile image must be smaller than 2 MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        setProfileError(
          "Failed to read the selected image."
        );
        return;
      }

      setProfileImage(result);
    };

    reader.readAsDataURL(file);
  }

  /*
   * --------------------------------------------------------------------------
   * Save Profile
   * --------------------------------------------------------------------------
   */

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (profileLoading || !user) {
      return;
    }

    setProfileError("");
    setProfileSuccess("");
    setPasswordError("");
    setPasswordSuccess("");

    /*
     * Only SuperAdmin can change their name.
     */
    const nameChanged =
      isSuperAdmin &&
      name.trim() !== user.name.trim();

    /*
     * Only SuperAdmin can change their email.
     */
    const emailChanged =
      isSuperAdmin &&
      email.trim().toLowerCase() !==
        user.email.toLowerCase();

    const phoneChanged =
      phone.trim() !==
      (user.phone || "");

    const imageChanged =
      profileImage !==
      (user.profileImage || null);

    const profileChanged =
      nameChanged ||
      emailChanged ||
      phoneChanged ||
      imageChanged;

    const passwordChanged =
      Boolean(newPassword);

    /*
     * Password validation
     */

    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setPasswordError(
          "Enter your current password to change your password."
        );
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError(
          "New password must be at least 6 characters long."
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError(
          "New password and confirmation password do not match."
        );
        return;
      }
    }

    /*
     * Email change requires current password.
     */

    if (
      emailChanged &&
      !currentPassword
    ) {
      setProfileError(
        "Enter your current password to change your email."
      );
      return;
    }

    if (
      !profileChanged &&
      !passwordChanged
    ) {
      setProfileError(
        "No changes were made."
      );
      return;
    }

    setProfileLoading(true);

    try {
      /*
       * ----------------------------------------------
       * Update profile information
       * ----------------------------------------------
       */

      if (profileChanged) {
        const body: {
          name?: string;
          email?: string;
          phone?: string | null;
          profileImage?: string | null;
          currentPassword?: string;
        } = {};

        /*
         * Only SuperAdmin sends name changes.
         */
        if (nameChanged) {
          body.name =
            name.trim();
        }

        /*
         * Only SuperAdmin sends email changes.
         */
        if (emailChanged) {
          body.email =
            email.trim().toLowerCase();
        }

        if (phoneChanged) {
          body.phone =
            phone.trim() === ""
              ? null
              : phone.trim();
        }

        if (imageChanged) {
          body.profileImage =
            profileImage;
        }

        /*
         * Email changes require current password.
         * Name changes do not require current password.
         */
        if (emailChanged) {
          body.currentPassword =
            currentPassword;
        }

        const response = await fetch(
          "/api/profile",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify(body),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update profile"
          );
        }

        if (data.user) {
          setUser(data.user);

          setName(
            data.user.name || ""
          );

          setEmail(
            data.user.email || ""
          );

          setPhone(
            data.user.phone || ""
          );

          setProfileImage(
            data.user.profileImage ||
              null
          );
        }

        setProfileSuccess(
          "Profile updated successfully."
        );
      }

      /*
       * ----------------------------------------------
       * Change password
       * ----------------------------------------------
       */

      if (passwordChanged) {
        setPasswordLoading(true);

        const response = await fetch(
          "/api/profile/password",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to change password"
          );
        }

        setPasswordSuccess(
          "Password changed successfully."
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to update profile.";

      if (passwordChanged) {
        setPasswordError(message);
      } else {
        setProfileError(message);
      }
    } finally {
      setProfileLoading(false);
      setPasswordLoading(false);
    }
  }

  /*
   * --------------------------------------------------------------------------
   * Role Label
   * --------------------------------------------------------------------------
   */

  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "SuperAdmin"
      : user?.role === "ADMIN"
      ? "Admin"
      : "Student";

  /*
   * --------------------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030712] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-slate-400">
            Loading profile...
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Main UI
   * --------------------------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Navbar */}

      <header className="border-b border-white/10 bg-[#030712]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}

          <Link
            href={
              isSuperAdmin
                ? "/superadmin/dashboard"
                : user?.role === "ADMIN"
                ? "/admin/dashboard"
                : "/student/dashboard"
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-gradient shadow-lg text-xl">
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
          </Link>

          {/* Navbar Right */}

          <div className="flex items-center gap-3">
            <Link
              href={
                isSuperAdmin
                  ? "/superadmin/dashboard"
                  : user?.role === "ADMIN"
                  ? "/admin/dashboard"
                  : "/student/dashboard"
              }
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
            >
              ← Dashboard
            </Link>

            {/* Logout Button */}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-base">
                🚪
              </span>

              <span>
                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            {roleLabel} Profile
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            My Profile
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your account information
            and security settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Profile Card */}

        <div className="rounded-2xl glass-card shadow-xl p-6 shadow-2xl">
          <div className="mb-8 flex flex-col items-center gap-5 sm:flex-row">
            {/* Profile Image */}

            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-blue-500/30 bg-slate-800 text-4xl">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "👤"
                )}
              </div>

              <label
                htmlFor="profileImage"
                className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 btn-gradient shadow-lg text-sm shadow-lg transition hover:bg-blue-500"
                title="Change profile picture"
              >
                📷
              </label>

              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold">
                {user?.name}
              </h3>

              <p className="mt-1 text-slate-400">
                {user?.email}
              </p>

              <span className="mt-3 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Profile Messages */}

          {profileError && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {profileSuccess}
            </div>
          )}

          {/* Profile Form */}

          <form
            onSubmit={handleSave}
            className="space-y-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Full Name
                </label>

                {isSuperAdmin ? (
                  <>
                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />

                    <p className="mt-1 text-xs text-slate-600">
                      SuperAdmin can change their
                      name.
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      disabled
                      className="w-full rounded-xl border border-white/10 input-glow bg-white/5/50 px-4 py-3 text-sm text-slate-500 outline-none"
                    />

                    <p className="mt-1 text-xs text-slate-600">
                      Name cannot be changed here.
                    </p>
                  </>
                )}
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email / User ID
                </label>

                {isSuperAdmin ? (
                  <>
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
                      className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />

                    <p className="mt-1 text-xs text-slate-600">
                      Changing your email requires
                      your current password.
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-xl border border-white/10 input-glow bg-white/5/50 px-4 py-3 text-sm text-slate-500 outline-none"
                    />

                    <p className="mt-1 text-xs text-slate-600">
                      Email / User ID cannot be
                      changed here.
                    </p>
                  </>
                )}
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
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* Student Information */}

              {student && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Student ID
                  </label>

                  <input
                    type="text"
                    value={
                      student.studentId
                    }
                    disabled
                    className="w-full rounded-xl border border-white/10 input-glow bg-white/5/50 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Student Details */}

            {student && (
              <div className="grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Department
                  </label>

                  <input
                    type="text"
                    value={
                      student.department ||
                      "Not provided"
                    }
                    disabled
                    className="w-full rounded-xl border border-white/10 input-glow bg-white/5/50 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Year
                  </label>

                  <input
                    type="text"
                    value={
                      student.year
                        ? String(
                            student.year
                          )
                        : "Not provided"
                    }
                    disabled
                    className="w-full rounded-xl border border-white/10 input-glow bg-white/5/50 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Security */}

            <div className="border-t border-white/10 pt-6">
              <h3 className="mb-1 text-lg font-semibold">
                Change Password
              </h3>

              <p className="mb-5 text-sm text-slate-500">
                Leave these fields empty if you
                don't want to change your password.
              </p>

              {passwordError && (
                <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                  {passwordSuccess}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Current password"
                    className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

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
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="New password"
                    className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm password"
                    className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Save */}

            <div className="flex justify-end border-t border-white/10 pt-6">
              <button
                type="submit"
                disabled={
                  profileLoading ||
                  passwordLoading
                }
                className="rounded-xl btn-gradient shadow-lg px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {profileLoading ||
                passwordLoading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

