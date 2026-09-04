
"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type Student = {
  id: number;
  studentId: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  year: number | null;
  createdAt: string;
};

type StudentForm = {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  password: string;
};

const emptyForm: StudentForm = {
  studentId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  year: "",
  password: "",
};

export default function StudentsPage() {
  const [students, setStudents] =
    useState<Student[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState<number | null>(null);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  const [form, setForm] =
    useState<StudentForm>(
      emptyForm
    );

  async function loadStudents() {
    try {
      const response = await fetch(
        "/api/admin/students"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch students"
        );
      }

      const data =
        await response.json();

      setStudents(data);
    } catch (error) {
      console.error(
        "Load students error:",
        error
      );

      setMessage(
        "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleInputChange(
    field: keyof StudentForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function startAddStudent() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  }

  function startEditStudent(
    student: Student
  ) {
    setEditingId(student.id);

    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      department:
        student.department || "",
      year:
        student.year
          ? String(student.year)
          : "",
      password: "",
    });

    setShowForm(true);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const isEditing =
        editingId !== null;

      const response = await fetch(
        "/api/admin/students",
        {
          method: isEditing
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            isEditing
              ? {
                  id: editingId,
                  ...form,
                }
              : form
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            `Failed to ${
              isEditing
                ? "update"
                : "create"
            } student`
        );

        return;
      }

      setMessage(
        isEditing
          ? "Student updated successfully!"
          : "Student created successfully!"
      );

      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);

      await loadStudents();
    } catch (error) {
      console.error(
        "Save student error:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStudent(
    student: Student
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${student.name}?\n\n` +
          `This will permanently delete the student's account, ` +
          `room allocation, fees, complaints, and leave applications.`
      );

    if (!confirmed) {
      return;
    }

    setDeleting(student.id);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/students",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: student.id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete student"
        );

        return;
      }

      setMessage(
        "Student deleted successfully!"
      );

      await loadStudents();
    } catch (error) {
      console.error(
        "Delete student error:",
        error
      );

      setMessage(
        "Something went wrong while deleting the student"
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#030712]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-gradient text-xl shadow-lg">
              🎓
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

          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-10 animate-fade-in-up">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              ADMINISTRATION
            </p>

            <h2 className="text-3xl font-bold">
              Students
            </h2>

            <p className="mt-2 text-slate-400">
              Manage hostel students and
              their accounts.
            </p>
          </div>

          <button
            onClick={
              showForm
                ? cancelForm
                : startAddStudent
            }
            className="rounded-xl btn-gradient px-5 py-3 font-semibold transition shadow-lg"
          >
            {showForm
              ? "Cancel"
              : "+ Add Student"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl glass-card p-6 shadow-xl">
            <h3 className="mb-6 text-xl font-bold">
              {editingId !== null
                ? "Edit Student"
                : "Add New Student"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >
              {/* Student ID */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Student ID *
                </label>

                <input
                  required
                  value={form.studentId}
                  onChange={(e) =>
                    handleInputChange(
                      "studentId",
                      e.target.value
                    )
                  }
                  placeholder="2026CSE001"
                  className="w-full rounded-xl input-glow bg-white/5 px-4 py-3 outline-none"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Full Name *
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    handleInputChange(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Rahul Sharma"
                  className="w-full rounded-xl input-glow bg-white/5 px-4 py-3 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Email *
                </label>

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    handleInputChange(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="student@example.com"
                  className="w-full rounded-xl input-glow bg-white/5 px-4 py-3 outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Phone
                </label>

                <input
                  value={form.phone}
                  onChange={(e) =>
                    handleInputChange(
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl input-glow bg-white/5 px-4 py-3 outline-none"
                />
              </div>

              {/* Department */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Department
                </label>

                <input
                  value={form.department}
                  onChange={(e) =>
                    handleInputChange(
                      "department",
                      e.target.value
                    )
                  }
                  placeholder="Computer Science"
                  className="w-full rounded-xl input-glow bg-white/5 px-4 py-3 outline-none"
                />
              </div>

              {/* Year */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Year
                </label>

                <input
                  type="number"
                  min="1"
                  max="6"
                  value={form.year}
                  onChange={(e) =>
                    handleInputChange(
                      "year",
                      e.target.value
                    )
                  }
                  placeholder="2"
                  className="w-full rounded-xl input-glow bg-white/5 px-4 py-3 outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  {editingId !== null
                    ? "New Password (optional)"
                    : "Login Password *"}
                </label>

                <input
                  required={
                    editingId === null
                  }
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    handleInputChange(
                      "password",
                      e.target.value
                    )
                  }
                  placeholder={
                    editingId !== null
                      ? "Leave blank to keep current password"
                      : "Minimum 6 characters"
                  }
                  className="w-full rounded-xl input-glow bg-white/5 px-4 py-3 outline-none"
                />
              </div>

              {/* Submit */}
              <div className="flex items-end gap-3">
                <button
                  disabled={saving}
                  type="submit"
                  className="flex-1 rounded-xl btn-gradient px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
                >
                  {saving
                    ? editingId !== null
                      ? "Updating..."
                      : "Creating..."
                    : editingId !== null
                      ? "Update Student"
                      : "Create Student"}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Student Table */}
        <div className="overflow-hidden rounded-2xl glass-card shadow-xl">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-bold">
              Student List
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {students.length} student
              {students.length !== 1
                ? "s"
                : ""}{" "}
              registered
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mb-4 text-5xl">
                🎓
              </div>

              <h4 className="font-semibold">
                No students yet
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Click "Add Student" to
                register your first
                student.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Student
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Student ID
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Department
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Year
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map(
                    (student) => (
                      <tr
                        key={student.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white-5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {student.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {student.email}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {student.studentId}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {student.department ||
                            "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {student.year ||
                            "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {student.phone ||
                            "—"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                startEditStudent(
                                  student
                                )
                              }
                              className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/10"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteStudent(
                                  student
                                )
                              }
                              disabled={
                                deleting ===
                                student.id
                              }
                              className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deleting ===
                              student.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
