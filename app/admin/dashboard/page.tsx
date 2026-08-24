"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Room = {
  id: number;
  roomNumber: string;
  capacity: number;
  occupied: number;
};

type Block = {
  id: number;
  name: string;
  rooms: Room[];
};

type Hostel = {
  id: number;
  name: string;
  blocks: Block[];
};

type RoomDetails = {
  room: {
    id: number;
    roomNumber: string;
    capacity: number;
    occupied: number;
    available: number;
  };
  hostel: {
    id: number;
    name: string;
  };
  block: {
    id: number;
    name: string;
  };
  students: {
    id: number;
    studentId: string;
    name: string;
    email: string;
    phone: string | null;
    department: string | null;
    year: number | null;
  }[];
};

const menuItems = [
  {
    title: "Students",
    description: "Manage hostel students",
    icon: "🎓",
    href: "/admin/students",
  },
  {
    title: "Hostels & Rooms",
    description: "Manage rooms and capacity",
    icon: "🏢",
    href: "/admin/rooms",
  },
  {
    title: "Room Allocation",
    description: "Allocate rooms to students",
    icon: "🛏️",
    href: "/admin/allocations",
  },
  {
    title: "Fees",
    description: "Manage student payments",
    icon: "💳",
    href: "/admin/fees",
  },
  {
    title: "Complaints",
    description: "Review student complaints",
    icon: "📋",
    href: "/admin/complaints",
  },
  {
    title: "Leave Applications",
    description: "Approve or reject leave",
    icon: "📝",
    href: "/admin/leave",
  },
  {
    title: "Notices",
    description: "Publish hostel notices",
    icon: "📢",
    href: "/admin/notices",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    availableBeds: 0,
    pendingFees: 0,
  });

  const [hostels, setHostels] = useState<Hostel[]>([]);

  const [selectedHostelId, setSelectedHostelId] =
    useState("");

  const [selectedBlockId, setSelectedBlockId] =
    useState("");

  const [selectedRoomId, setSelectedRoomId] =
    useState("");

  const [roomDetails, setRoomDetails] =
    useState<RoomDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingRoomDetails, setLoadingRoomDetails] =
    useState(false);

  const [roomError, setRoomError] = useState("");

  const [loggingOut, setLoggingOut] =
    useState(false);

  // --------------------------------------------------
  // Load dashboard statistics and hostels
  // --------------------------------------------------

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsResponse, hostelsResponse] =
          await Promise.all([
            fetch("/api/admin/stats"),
            fetch("/api/admin/hostels"),
          ]);

        if (!statsResponse.ok) {
          throw new Error(
            "Failed to load statistics"
          );
        }

        if (!hostelsResponse.ok) {
          throw new Error(
            "Failed to load hostels"
          );
        }

        const statsData =
          await statsResponse.json();

        const hostelsData =
          await hostelsResponse.json();

        setStats(statsData);
        setHostels(hostelsData);
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // --------------------------------------------------
  // Selected hostel
  // --------------------------------------------------

  const selectedHostel = hostels.find(
    (hostel) =>
      String(hostel.id) === selectedHostelId
  );

  // --------------------------------------------------
  // Selected block
  // --------------------------------------------------

  const selectedBlock = selectedHostel?.blocks.find(
    (block) =>
      String(block.id) === selectedBlockId
  );

  // --------------------------------------------------
  // Hostel change
  // --------------------------------------------------

  function handleHostelChange(
    value: string
  ) {
    setSelectedHostelId(value);
    setSelectedBlockId("");
    setSelectedRoomId("");
    setRoomDetails(null);
    setRoomError("");
  }

  // --------------------------------------------------
  // Block change
  // --------------------------------------------------

  function handleBlockChange(
    value: string
  ) {
    setSelectedBlockId(value);
    setSelectedRoomId("");
    setRoomDetails(null);
    setRoomError("");
  }

  // --------------------------------------------------
  // Room change
  // --------------------------------------------------

  async function handleRoomChange(
    value: string
  ) {
    setSelectedRoomId(value);
    setRoomDetails(null);
    setRoomError("");

    if (!value) {
      return;
    }

    setLoadingRoomDetails(true);

    try {
      const response = await fetch(
        `/api/admin/room-details?roomId=${value}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch room details"
        );
      }

      setRoomDetails(data);
    } catch (error) {
      console.error(
        "Room details error:",
        error
      );

      setRoomError(
        error instanceof Error
          ? error.message
          : "Failed to fetch room details"
      );
    } finally {
      setLoadingRoomDetails(false);
    }
  }

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/logout",
        {
          method: "POST",
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
    }
  }

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: "🎓",
      href: "/admin/students",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: "🚪",
      href: "/admin/rooms",
    },
    {
      title: "Available Beds",
      value: stats.availableBeds,
      icon: "🛏️",
      href: "/admin/rooms",
    },
    {
      title: "Pending Fees",
      value: stats.pendingFees,
      icon: "💰",
      href: "/admin/fees",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}

      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
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

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                Hostel Administrator
              </p>

              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              A
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard */}

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}

        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-blue-400">
            ADMINISTRATION
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your hostel operations from
            one place.
          </p>
        </div>

        {/* Statistics */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/40 hover:bg-white/[0.05]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-xl">
                  {stat.icon}
                </div>

                <span className="text-slate-600 transition group-hover:text-blue-400">
                  →
                </span>
              </div>

              <p className="text-sm text-slate-400">
                {stat.title}
              </p>

              <p className="mt-1 text-3xl font-bold">
                {loading
                  ? "..."
                  : stat.value}
              </p>
            </Link>
          ))}
        </div>

        {/* --------------------------------------------------
            ROOM DETAILS
        -------------------------------------------------- */}

        <div className="mt-10">
          <div className="mb-5">
            <h3 className="text-xl font-bold">
              🏠 Room Details
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Select a hostel, block and room to
              view the students currently staying
              there.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            {/* Selectors */}

            <div className="grid gap-5 md:grid-cols-3">
              {/* Hostel */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Hostel
                </label>

                <select
                  value={selectedHostelId}
                  onChange={(e) =>
                    handleHostelChange(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                >
                  <option value="">
                    Select hostel
                  </option>

                  {hostels.map((hostel) => (
                    <option
                      key={hostel.id}
                      value={hostel.id}
                    >
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Block
                </label>

                <select
                  value={selectedBlockId}
                  onChange={(e) =>
                    handleBlockChange(
                      e.target.value
                    )
                  }
                  disabled={
                    !selectedHostelId
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {selectedHostelId
                      ? "Select block"
                      : "Select hostel first"}
                  </option>

                  {selectedHostel?.blocks.map(
                    (block) => (
                      <option
                        key={block.id}
                        value={block.id}
                      >
                        {block.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Room */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Room
                </label>

                <select
                  value={selectedRoomId}
                  onChange={(e) =>
                    handleRoomChange(
                      e.target.value
                    )
                  }
                  disabled={
                    !selectedBlockId
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {selectedBlockId
                      ? "Select room"
                      : "Select block first"}
                  </option>

                  {selectedBlock?.rooms.map(
                    (room) => (
                      <option
                        key={room.id}
                        value={room.id}
                      >
                        Room {room.roomNumber}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Loading */}

            {loadingRoomDetails && (
              <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center text-sm text-blue-300">
                Loading room details...
              </div>
            )}

            {/* Error */}

            {roomError && (
              <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
                {roomError}
              </div>
            )}

            {/* Room Details */}

            {roomDetails &&
              !loadingRoomDetails && (
                <div className="mt-8">
                  {/* Location */}

                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-slate-400">
                          Selected Location
                        </p>

                        <h4 className="mt-1 text-2xl font-bold">
                          {
                            roomDetails.hostel
                              .name
                          }{" "}
                          •{" "}
                          {
                            roomDetails.block
                              .name
                          }{" "}
                          • Room{" "}
                          {
                            roomDetails.room
                              .roomNumber
                          }
                        </h4>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center">
                          <p className="text-xs text-slate-500">
                            Capacity
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {
                              roomDetails
                                .room
                                .capacity
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center">
                          <p className="text-xs text-slate-500">
                            Occupied
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {
                              roomDetails
                                .room
                                .occupied
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center">
                          <p className="text-xs text-slate-500">
                            Available
                          </p>

                          <p className="mt-1 text-xl font-bold text-green-400">
                            {
                              roomDetails
                                .room
                                .available
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Students */}

                  <div className="mt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold">
                          Students Present
                        </h4>

                        <p className="text-sm text-slate-400">
                          {
                            roomDetails
                              .students
                              .length
                          }{" "}
                          student
                          {roomDetails
                            .students
                            .length === 1
                            ? ""
                            : "s"}{" "}
                          currently allocated
                        </p>
                      </div>
                    </div>

                    {roomDetails.students
                      .length === 0 ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
                        <div className="text-4xl">
                          🛏️
                        </div>

                        <p className="mt-3 font-semibold">
                          No students allocated
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          This room is currently
                          empty.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left">
                          <thead className="border-b border-white/10 bg-white/[0.02]">
                            <tr>
                              <th className="px-5 py-4 text-sm">
                                Student ID
                              </th>

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
                                Department
                              </th>

                              <th className="px-5 py-4 text-sm">
                                Year
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {roomDetails.students.map(
                              (student) => (
                                <tr
                                  key={
                                    student.id
                                  }
                                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                                >
                                  <td className="px-5 py-4 font-medium">
                                    {
                                      student.studentId
                                    }
                                  </td>

                                  <td className="px-5 py-4 font-medium">
                                    {
                                      student.name
                                    }
                                  </td>

                                  <td className="px-5 py-4 text-sm text-slate-400">
                                    {
                                      student.email
                                    }
                                  </td>

                                  <td className="px-5 py-4 text-sm text-slate-400">
                                    {student.phone ||
                                      "—"}
                                  </td>

                                  <td className="px-5 py-4 text-sm text-slate-400">
                                    {
                                      student.department ||
                                      "—"
                                    }
                                  </td>

                                  <td className="px-5 py-4 text-sm text-slate-400">
                                    {student.year ||
                                      "—"}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Management */}

        <div className="mt-10">
          <h3 className="mb-5 text-xl font-bold">
            Management
          </h3>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.05]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                  {item.icon}
                </div>

                <h4 className="font-semibold">
                  {item.title}
                </h4>

                <p className="mt-1 text-sm text-slate-400">
                  {item.description}
                </p>

                <div className="mt-5 text-sm font-medium text-blue-400">
                  Manage →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}