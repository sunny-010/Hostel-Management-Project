"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Roommate = {
  id: number;
  studentId: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  year: number | null;
  allocatedAt: string;
};

type RoomData = {
  student: {
    id: number;
    name: string;
    studentId: string;
  };

  allocation: {
    id: number;
    allocatedAt: string;
  };

  room: {
    id: number;
    roomNumber: string;
    capacity: number;
    occupied: number;
  };

  hostel: {
    id: number;
    name: string;
    block: string;
  };

  roommates: Roommate[];
};

export default function StudentRoomPage() {
  const [data, setData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRoom() {
      try {
        const response = await fetch("/api/student/room");

        if (!response.ok) {
          throw new Error("Failed to load room");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error(error);
        setMessage("Failed to load room information.");
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, []);

  const availableBeds = data
    ? Math.max(data.room.capacity - data.room.occupied, 0)
    : 0;

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
              <h1 className="font-bold">HostelHub</h1>

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
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            STUDENT PORTAL
          </p>

          <h2 className="text-3xl font-bold">My Room</h2>

          <p className="mt-2 text-slate-400">
            View your hostel and room allocation details.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl glass-card shadow-xl p-12 text-center text-slate-400">
            Loading room information...
          </div>
        ) : !data ? (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-12 text-center">
            <div className="mb-5 text-6xl">🛏️</div>

            <h3 className="text-xl font-bold">
              No Room Allocated
            </h3>

            <p className="mt-2 text-slate-400">
              You have not been allocated a hostel room yet.
            </p>
          </div>
        ) : (
          <>
            {/* Hostel & Room */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl glass-card shadow-xl p-7">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl btn-gradient shadow-lg/10 text-3xl">
                  🏢
                </div>

                <p className="text-sm text-slate-400">
                  Hostel
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {data.hostel.name}
                </h3>

                <p className="mt-2 text-slate-400">
                  Block {data.hostel.block}
                </p>
              </div>

              <div className="rounded-2xl glass-card shadow-xl p-7">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl btn-gradient shadow-lg/10 text-3xl">
                  🚪
                </div>

                <p className="text-sm text-slate-400">
                  Room Number
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {data.room.roomNumber}
                </h3>

                <p className="mt-2 text-slate-400">
                  Room ID #{data.room.id}
                </p>
              </div>
            </div>

            {/* Room Statistics */}
            <div className="mb-6 grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl glass-card shadow-xl p-6">
                <p className="text-sm text-slate-400">
                  Capacity
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {data.room.capacity}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total beds
                </p>
              </div>

              <div className="rounded-2xl glass-card shadow-xl p-6">
                <p className="text-sm text-slate-400">
                  Occupied
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {data.room.occupied}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Occupied beds
                </p>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
                <p className="text-sm text-slate-400">
                  Available
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  {availableBeds}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Available beds
                </p>
              </div>
            </div>

            {/* Allocation Details */}
            <div className="mb-6 rounded-2xl glass-card shadow-xl p-7">
              <h3 className="mb-6 text-xl font-bold">
                Allocation Details
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">
                    Student Name
                  </p>

                  <p className="mt-1 font-semibold">
                    {data.student.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Student ID
                  </p>

                  <p className="mt-1 font-semibold">
                    {data.student.studentId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Allocation Date
                  </p>

                  <p className="mt-1 font-semibold">
                    {new Date(
                      data.allocation.allocatedAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Allocation Status
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    ALLOCATED
                  </span>
                </div>
              </div>
            </div>

            {/* Roommates */}
            <div className="rounded-2xl glass-card shadow-xl p-7">
              <div className="mb-6">
                <h3 className="text-xl font-bold">
                  Roommates
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Students currently allocated to your room.
                </p>
              </div>

              {data.roommates.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                  <div className="mb-3 text-4xl">👤</div>

                  <p className="font-medium">
                    No roommates found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    You are currently the only student allocated to this
                    room.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.roommates.map((roommate) => (
                    <div
                      key={roommate.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full btn-gradient shadow-lg/10 text-xl">
                            👤
                          </div>

                          <div>
                            <h4 className="font-semibold">
                              {roommate.name}
                            </h4>

                            <p className="mt-1 text-sm text-slate-400">
                              {roommate.studentId}
                            </p>
                          </div>
                        </div>

                        <span className="w-fit rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                          ALLOCATED
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-500">
                            Email
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {roommate.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Phone
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {roommate.phone || "Not provided"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Department
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {roommate.department || "Not provided"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Year
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {roommate.year
                              ? `Year ${roommate.year}`
                              : "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}