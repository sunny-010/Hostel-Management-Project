"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Fee = {
  id: number;
  amount: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  paidDate: string | null;
  createdAt: string;
};

export default function StudentFeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadFees() {
    try {
      const response = await fetch(
        "/api/student/fees"
      );

      if (!response.ok) {
        throw new Error("Failed to load fees");
      }

      const data = await response.json();

      setFees(data);
    } catch (error) {
      console.error(error);

      setMessage("Failed to load fees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFees();
  }, []);

  const pendingFees = fees.filter(
    (fee) => fee.status === "PENDING"
  );

  const paidFees = fees.filter(
    (fee) => fee.status === "PAID"
  );

  const pendingAmount = pendingFees.reduce(
    (total, fee) =>
      total + Number(fee.amount),
    0
  );

  const paidAmount = paidFees.reduce(
    (total, fee) =>
      total + Number(fee.amount),
    0
  );

  function getStatusClass(
    status: Fee["status"]
  ) {
    switch (status) {
      case "PAID":
        return "bg-green-500/10 text-green-400";

      case "OVERDUE":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-yellow-500/10 text-yellow-400";
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#030712]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/student/dashboard"
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

          <Link
            href="/student/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            STUDENT PORTAL
          </p>

          <h2 className="text-3xl font-bold">
            My Fees
          </h2>

          <p className="mt-2 text-slate-400">
            View your hostel fee records and payment status.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {message}
          </div>
        )}

        {/* Summary */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl glass-card shadow-xl p-6">
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
              ₹{pendingAmount.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
            <p className="text-sm text-slate-400">
              Paid Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              ₹{paidAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Fee Records */}
        <div className="overflow-hidden rounded-2xl glass-card shadow-xl">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-bold">
              Fee Records
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Your hostel payment history.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading fees...
            </div>
          ) : fees.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mb-4 text-5xl">
                💰
              </div>

              <h4 className="font-semibold">
                No fee records
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                You don't have any fee records yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-sm">
                      Fee ID
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
                      Paid Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {fees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-6 py-4 font-medium">
                        #{fee.id}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        ₹
                        {Number(
                          fee.amount
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(
                          fee.dueDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            fee.status
                          )}`}
                        >
                          {fee.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {fee.paidDate
                          ? new Date(
                              fee.paidDate
                            ).toLocaleDateString()
                          : "—"}
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