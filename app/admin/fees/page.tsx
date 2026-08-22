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
};

type Fee = {
  id: number;
  amount: string;
  status:
    | "PENDING"
    | "PAID"
    | "OVERDUE";
  dueDate: string;
  paidDate: string | null;
  student: Student;
};

export default function FeesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);

  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [editingFeeId, setEditingFeeId] =
    useState<number | null>(null);

  const [editAmount, setEditAmount] =
    useState("");

  const [editDueDate, setEditDueDate] =
    useState("");

  const [editStatus, setEditStatus] =
    useState<
      "PENDING" | "PAID" | "OVERDUE"
    >("PENDING");

  async function loadData() {
    try {
      const [
        studentsResponse,
        feesResponse,
      ] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/fees"),
      ]);

      if (
        !studentsResponse.ok ||
        !feesResponse.ok
      ) {
        throw new Error(
          "Failed to load data"
        );
      }

      const studentsData =
        await studentsResponse.json();

      const feesData =
        await feesResponse.json();

      setStudents(studentsData);
      setFees(feesData);
    } catch (error) {
      console.error(
        "Load fees data error:",
        error
      );

      setMessage(
        "Failed to load fees"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------
  // CREATE FEE
  // --------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/fees",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            studentId,
            amount,
            dueDate,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to create fee"
        );
        return;
      }

      setMessage(
        "Fee created successfully!"
      );

      setStudentId("");
      setAmount("");
      setDueDate("");

      await loadData();
    } catch (error) {
      console.error(
        "Create fee error:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------
  // START EDITING
  // --------------------------------

  function startEditing(fee: Fee) {
    setEditingFeeId(fee.id);

    setEditAmount(
      Number(fee.amount).toString()
    );

    setEditDueDate(
      new Date(fee.dueDate)
        .toISOString()
        .split("T")[0]
    );

    setEditStatus(fee.status);

    setMessage("");
  }

  function cancelEditing() {
    setEditingFeeId(null);
    setEditAmount("");
    setEditDueDate("");
    setEditStatus("PENDING");
  }

  // --------------------------------
  // SAVE EDIT
  // --------------------------------

  async function saveEditedFee(
    id: number
  ) {
    if (!editAmount || !editDueDate) {
      setMessage(
        "Amount and due date are required"
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/fees",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
            amount: editAmount,
            dueDate: editDueDate,
            status: editStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to update fee"
        );
        return;
      }

      setMessage(
        "Fee updated successfully!"
      );

      cancelEditing();

      await loadData();
    } catch (error) {
      console.error(
        "Update fee error:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------
  // DELETE FEE
  // --------------------------------

  async function deleteFee(
    id: number,
    studentName: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the fee record for ${studentName}?`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/fees",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete fee"
        );
        return;
      }

      setMessage(
        "Fee deleted successfully!"
      );

      await loadData();
    } catch (error) {
      console.error(
        "Delete fee error:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------
  // QUICK STATUS UPDATE
  // --------------------------------

  async function updateFeeStatus(
    id: number,
    status: "PAID" | "PENDING"
  ) {
    try {
      const response = await fetch(
        "/api/admin/fees",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to update fee"
        );
        return;
      }

      setMessage(
        status === "PAID"
          ? "Fee marked as paid!"
          : "Fee marked as pending!"
      );

      await loadData();
    } catch (error) {
      console.error(
        "Update fee error:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    }
  }

  const pendingFees = fees.filter(
    (fee) => fee.status === "PENDING"
  );

  const paidFees = fees.filter(
    (fee) => fee.status === "PAID"
  );

  const totalPending =
    pendingFees.reduce(
      (total, fee) =>
        total + Number(fee.amount),
      0
    );

  const totalPaid =
    paidFees.reduce(
      (total, fee) =>
        total + Number(fee.amount),
      0
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/admin/dashboard"
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

          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            ADMINISTRATION
          </p>

          <h2 className="text-3xl font-bold">
            Fees Management
          </h2>

          <p className="mt-2 text-slate-400">
            Manage student hostel fees and
            payment status.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Summary */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">
              Total Fees
            </p>

            <p className="mt-2 text-3xl font-bold">
              {fees.length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <p className="text-sm text-slate-400">
              Pending Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              ₹{totalPending.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
            <p className="text-sm text-slate-400">
              Paid Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              ₹{totalPaid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Create Fee */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-6 text-xl font-bold">
            Create New Fee
          </h3>

          {students.length === 0 ? (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm text-yellow-300">
              No students are available.
              Please create a student first.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-4"
            >
              {/* Student */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Student *
                </label>

                <select
                  required
                  value={studentId}
                  onChange={(e) =>
                    setStudentId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map(
                    (student) => (
                      <option
                        key={student.id}
                        value={student.id}
                      >
                        {student.name} (
                        {student.studentId})
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Amount *
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  placeholder="5000"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Due Date *
                </label>

                <input
                  required
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Fee"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Fees Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-bold">
              Fee Records
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {fees.length} fee record
              {fees.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading fees...
            </div>
          ) : fees.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mb-4 text-5xl">
                💰
              </div>

              <h4 className="font-semibold">
                No fees yet
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Create the first fee using
                the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 text-sm">
                      Student
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Due Date
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {fees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {fee.student.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {
                            fee.student
                              .studentId
                          }
                        </p>
                      </td>

                      {editingFeeId ===
                      fee.id ? (
                        <>
                          {/* Edit Amount */}
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              value={
                                editAmount
                              }
                              onChange={(e) =>
                                setEditAmount(
                                  e.target.value
                                )
                              }
                              className="w-32 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* Edit Date */}
                          <td className="px-6 py-4">
                            <input
                              type="date"
                              value={
                                editDueDate
                              }
                              onChange={(e) =>
                                setEditDueDate(
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* Edit Status */}
                          <td className="px-6 py-4">
                            <select
                              value={
                                editStatus
                              }
                              onChange={(e) =>
                                setEditStatus(
                                  e.target
                                    .value as
                                    | "PENDING"
                                    | "PAID"
                                    | "OVERDUE"
                                )
                              }
                              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                            >
                              <option value="PENDING">
                                Pending
                              </option>

                              <option value="PAID">
                                Paid
                              </option>

                              <option value="OVERDUE">
                                Overdue
                              </option>
                            </select>
                          </td>

                          {/* Edit Actions */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                disabled={
                                  saving
                                }
                                onClick={() =>
                                  saveEditedFee(
                                    fee.id
                                  )
                                }
                                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
                              >
                                Save
                              </button>

                              <button
                                disabled={
                                  saving
                                }
                                onClick={
                                  cancelEditing
                                }
                                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Amount */}
                          <td className="px-6 py-4 font-semibold">
                            ₹
                            {Number(
                              fee.amount
                            ).toFixed(2)}
                          </td>

                          {/* Due Date */}
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {new Date(
                              fee.dueDate
                            ).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                fee.status ===
                                "PAID"
                                  ? "bg-green-500/10 text-green-400"
                                  : fee.status ===
                                      "OVERDUE"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {fee.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() =>
                                  startEditing(
                                    fee
                                  )
                                }
                                className="text-sm text-blue-400 hover:text-blue-300"
                              >
                                Edit
                              </button>

                              {fee.status ===
                              "PAID" ? (
                                <button
                                  onClick={() =>
                                    updateFeeStatus(
                                      fee.id,
                                      "PENDING"
                                    )
                                  }
                                  className="text-sm text-yellow-400 hover:text-yellow-300"
                                >
                                  Mark Pending
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    updateFeeStatus(
                                      fee.id,
                                      "PAID"
                                    )
                                  }
                                  className="text-sm text-green-400 hover:text-green-300"
                                >
                                  Mark Paid
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  deleteFee(
                                    fee.id,
                                    fee.student
                                      .name
                                  )
                                }
                                className="text-sm text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
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