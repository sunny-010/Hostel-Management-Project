
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

type AdminProfile = {
  name: string;
  email: string;
  profileImage: string | null;
  role: "ADMIN" | "SUPER_ADMIN" | "STUDENT";
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

  const [profile, setProfile] =
    useState<AdminProfile | null>(null);

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
  // Load dashboard statistics, hostels and profile
  // --------------------------------------------------

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          statsResponse,
          hostelsResponse,
          profileResponse,
        ] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/hostels"),
          fetch("/api/profile"),
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

        if (!profileResponse.ok) {
          throw new Error(
            "Failed to load profile"
          );
        }

        const statsData =
          await statsResponse.json();

        const hostelsData =
          await hostelsResponse.json();

        const profileData =
          await profileResponse.json();

        setStats(statsData);
        setHostels(hostelsData);
        setProfile(profileData.user);
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

  const selectedBlock =
    selectedHostel?.blocks.find(
      (block) =>
        String(block.id) === selectedBlockId
    );

  // --------------------------------------------------
  // Hostel change
  // --------------------------------------------------

  function handleHostelChange(value: string) {
    setSelectedHostelId(value);
    setSelectedBlockId("");
    setSelectedRoomId("");
    setRoomDetails(null);
    setRoomError("");
  }

  // --------------------------------------------------
  // Block change
  // --------------------------------------------------

  function handleBlockChange(value: string) {
    setSelectedBlockId(value);
    setSelectedRoomId("");
    setRoomDetails(null);
    setRoomError("");
  }

  // --------------------------------------------------
  // Room change
  // --------------------------------------------------

  async function handleRoomChange(value: string) {
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
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}

      <header className="border-b border-white/10 backdrop-blur-md bg-[#030712]/80 sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}

          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
              H
            </div>

            <div>
              <h1 className="font-bold tracking-tight text-lg">
                HostelHub
              </h1>

              <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">
                Admin Portal
              </p>
            </div>
          </Link>

          {/* Right Side */}

          <div className="flex items-center gap-4">

            {/* Admin Profile */}

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5"
              title="My Profile"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {loading ? (
                    <span className="inline-block h-4 w-20 rounded bg-white/10 animate-shimmer" />
                  ) : (
                    profile?.name || "Administrator"
                  )}
                </p>

                <p className="text-xs text-slate-400">
                  Administrator
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-sm font-bold text-blue-300 shadow-inner shadow-blue-500/20">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || "A"
                )}
              </div>
            </Link>

            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title={loggingOut ? "Logging out..." : "Logout"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Heading */}

        <div className="mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-4 shadow-inner shadow-blue-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            ADMINISTRATION OVERVIEW
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight">
            Dashboard <span className="gradient-text">Overview</span>
          </h2>

          <p className="mt-3 text-lg text-slate-400 max-w-2xl">
            Manage your hostel operations, students, and allocations from one centralized place.
          </p>
        </div>

        {/* Statistics */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {statCards.map((stat, i) => {
            const colors = [
              "blue", "purple", "emerald", "amber"
            ];
            const color = colors[i % colors.length];
            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="group glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden transition hover:-translate-y-1"
              >
                <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${color}-500/10 blur-2xl transition-all group-hover:bg-${color}-500/20`} />
                
                <div className="mb-5 flex items-center justify-between relative z-10">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 text-2xl shadow-inner shadow-${color}-500/20 border border-${color}-500/20`}>
                    {stat.icon}
                  </div>
                  <span className="text-slate-600 transition group-hover:text-blue-400 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-400 relative z-10">
                  {stat.title}
                </p>

                <p className="mt-1 text-3xl font-bold relative z-10">
                  {loading ? (
                    <span className="inline-block h-8 w-16 rounded bg-white/10 animate-shimmer" />
                  ) : (
                    stat.value
                  )}
                </p>
              </Link>
            );
          })}
        </div>

        {/* --------------------------------------------------
            ROOM DETAILS
        -------------------------------------------------- */}

        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                🏠 Room Explorer
              </h3>
              <p className="mt-2 text-slate-400">
                Select a hostel, block and room to view the students currently staying there.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-xl">
            {/* Selectors */}
            <div className="grid gap-5 md:grid-cols-3">
              {/* Hostel */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Hostel
                </label>
                <select
                  value={selectedHostelId}
                  onChange={(e) => handleHostelChange(e.target.value)}
                  className="input-glow w-full rounded-xl px-4 py-3.5 text-sm appearance-none bg-slate-900"
                >
                  <option value="">Select hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
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
                  onChange={(e) => handleBlockChange(e.target.value)}
                  disabled={!selectedHostelId}
                  className="input-glow w-full rounded-xl px-4 py-3.5 text-sm appearance-none bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedHostelId ? "Select block" : "Select hostel first"}
                  </option>
                  {selectedHostel?.blocks.map((block) => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Room
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  disabled={!selectedBlockId}
                  className="input-glow w-full rounded-xl px-4 py-3.5 text-sm appearance-none bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedBlockId ? "Select room" : "Select block first"}
                  </option>
                  {selectedBlock?.rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading */}
            {loadingRoomDetails && (
              <div className="mt-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 text-center text-sm text-blue-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                </svg>
                Loading room details...
              </div>
            )}

            {/* Error */}
            {roomError && (
              <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 backdrop-blur-sm">
                ⚠️ {roomError}
              </div>
            )}

            {/* Room Details */}
            {roomDetails && !loadingRoomDetails && (
              <div className="mt-8 animate-scale-in">
                {/* Location */}
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-6 shadow-inner shadow-blue-500/10 backdrop-blur-sm">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-400">
                        SELECTED LOCATION
                      </p>
                      <h4 className="mt-1 text-2xl font-bold tracking-tight">
                        {roomDetails.hostel.name} • {roomDetails.block.name} • Room {roomDetails.room.roomNumber}
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Capacity */}
                      <div className="rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-center shadow-inner">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Capacity</p>
                        <p className="mt-1 text-2xl font-bold">{roomDetails.room.capacity}</p>
                      </div>

                      {/* Occupied */}
                      <div className="rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-center shadow-inner">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Occupied</p>
                        <p className="mt-1 text-2xl font-bold">{roomDetails.room.occupied}</p>
                      </div>

                      {/* Available */}
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-center shadow-inner shadow-emerald-500/10">
                        <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Available</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-300">{roomDetails.room.available}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students */}
                <div className="mt-8">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold tracking-tight">Students Present</h4>
                    <p className="mt-1 text-sm text-slate-400">
                      {roomDetails.students.length} student{roomDetails.students.length === 1 ? "" : "s"} currently allocated
                    </p>
                  </div>

                  {roomDetails.students.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center shadow-inner">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                        🛏️
                      </div>
                      <p className="mt-4 text-lg font-semibold text-white">No students allocated</p>
                      <p className="mt-1 text-slate-400">This room is currently empty.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-lg">
                      <table className="w-full text-left">
                        <thead className="bg-black/40 backdrop-blur-md">
                          <tr>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Student ID</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Year</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-white/[0.02]">
                          {roomDetails.students.map((student) => (
                            <tr key={student.id} className="transition-colors hover:bg-white/[0.04]">
                              <td className="px-6 py-4 font-semibold">{student.studentId}</td>
                              <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">{student.email}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">{student.phone || "—"}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">
                                {student.department ? (
                                  <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
                                    {student.department}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-400">{student.year || "—"}</td>
                            </tr>
                          ))}
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

        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <h3 className="mb-6 text-2xl font-bold tracking-tight">Management Modules</h3>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group glass-card rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 hover:border-blue-500/30 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-indigo-500/0 transition-all duration-500 group-hover:from-blue-500/5 group-hover:to-indigo-500/5" />
                <div className="relative z-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 group-hover:shadow-blue-500/20">
                    {item.icon}
                  </div>

                  <h4 className="text-lg font-bold tracking-tight transition-colors group-hover:text-blue-400">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {item.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-500 transition-colors group-hover:text-blue-400">
                    Manage <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

