"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Student = {
  id: number;
  studentId: string;
  name: string;
  email: string;
};

type Room = {
  id: number;
  roomNumber: string;
  capacity: number;
  occupied: number;
  hostel: {
    id: number;
    name: string;
    block: string;
  };
};

type Block = {
  id: number;
  name: string;
  hostelId: number;
  rooms: Room[];
};

type Hostel = {
  id: number;
  name: string;
  block: string;
  blocks: Block[];
};

type Allocation = {
  id: number;
  allocatedAt: string;
  student: Student;
  room: Room;
};

export default function AllocationsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] =
    useState<Allocation[]>([]);

  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");

  const [editingAllocation, setEditingAllocation] =
    useState<Allocation | null>(null);

  const [editRoomId, setEditRoomId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [message, setMessage] = useState("");

  // --------------------------------------------------
  // Load Students, Rooms and Allocations
  // --------------------------------------------------

  async function loadData() {
    try {
      setLoading(true);

      const [
        studentsResponse,
        roomsResponse,
        allocationsResponse,
      ] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/hostels"),
        fetch("/api/admin/allocations"),
      ]);

      if (
        !studentsResponse.ok ||
        !roomsResponse.ok ||
        !allocationsResponse.ok
      ) {
        throw new Error("Failed to load data");
      }

      const studentsData =
        await studentsResponse.json();

      const hostelsData: Hostel[] =
        await roomsResponse.json();

      const allocationsData =
        await allocationsResponse.json();

      setStudents(studentsData);
      setAllocations(allocationsData);

      // --------------------------------------------------
      // Convert:
      // Hostel -> Blocks -> Rooms
      //
      // into a flat room list for allocation dropdowns.
      // --------------------------------------------------

      const allRooms: Room[] = [];

      for (const hostel of hostelsData) {
        for (const block of hostel.blocks ?? []) {
          for (const room of block.rooms ?? []) {
            allRooms.push({
              ...room,
              hostel: {
                id: hostel.id,
                name: hostel.name,
                block: block.name,
              },
            });
          }
        }
      }

      setRooms(allRooms);
    } catch (error) {
      console.error(
        "Load allocation data error:",
        error
      );

      setMessage(
        "Failed to load allocation data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // Allocate Room
  // --------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!studentId || !roomId) {
      setMessage(
        "Please select a student and a room"
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/allocations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            roomId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to allocate room"
        );
        return;
      }

      setMessage(
        "Room allocated successfully!"
      );

      setStudentId("");
      setRoomId("");

      await loadData();
    } catch (error) {
      console.error(
        "Allocation error:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Start Modify Allocation
  // --------------------------------------------------

  function startModify(
    allocation: Allocation
  ) {
    setEditingAllocation(allocation);
    setEditRoomId(
      String(allocation.room.id)
    );
    setMessage("");
  }

  // --------------------------------------------------
  // Cancel Modify
  // --------------------------------------------------

  function cancelModify() {
    setEditingAllocation(null);
    setEditRoomId("");
  }

  // --------------------------------------------------
  // Modify Allocation
  // --------------------------------------------------

  async function handleModify(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !editingAllocation ||
      !editRoomId
    ) {
      setMessage(
        "Please select a new room"
      );
      return;
    }

    if (
      Number(editRoomId) ===
      editingAllocation.room.id
    ) {
      setMessage(
        "Please select a different room"
      );
      return;
    }

    const selectedRoom = rooms.find(
      (room) =>
        room.id === Number(editRoomId)
    );

    if (!selectedRoom) {
      setMessage(
        "Selected room not found"
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Change ${editingAllocation.student.name}'s room from ${editingAllocation.room.hostel.name} → ${editingAllocation.room.hostel.block} → Room ${editingAllocation.room.roomNumber} to ${selectedRoom.hostel.name} → ${selectedRoom.hostel.block} → Room ${selectedRoom.roomNumber}?`
      );

    if (!confirmed) {
      return;
    }

    setModifying(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/allocations",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            allocationId:
              editingAllocation.id,
            roomId: editRoomId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to modify room allocation"
        );
        return;
      }

      setMessage(
        `Room changed successfully to ${selectedRoom.hostel.name} → ${selectedRoom.hostel.block} → Room ${selectedRoom.roomNumber}!`
      );

      setEditingAllocation(null);
      setEditRoomId("");

      await loadData();
    } catch (error) {
      console.error(
        "Modify allocation error:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    } finally {
      setModifying(false);
    }
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}

      <header className="border-b border-white/10 bg-[#030712]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/admin/dashboard"
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
            href="/admin/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}

      <section className="mx-auto max-w-7xl px-6 py-10 animate-fade-in-up">
        {/* Heading */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            ADMINISTRATION
          </p>

          <h2 className="text-3xl font-bold">
            Room Allocation
          </h2>

          <p className="mt-2 text-slate-400">
            Allocate rooms to students and
            modify existing allocations.
          </p>
        </div>

        {/* Message */}

        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Allocate Room */}

        <div className="mb-8 rounded-2xl glass-card shadow-xl p-6">
          <h3 className="mb-6 text-xl font-bold">
            Allocate Room
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 sm:grid-cols-3"
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
                className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
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

            {/* Room */}

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Room *
              </label>

              <select
                required
                value={roomId}
                onChange={(e) =>
                  setRoomId(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select room
                </option>

                {rooms
                  .filter(
                    (room) =>
                      room.occupied <
                      room.capacity
                  )
                  .map((room) => (
                    <option
                      key={room.id}
                      value={room.id}
                    >
                      {room.hostel.name} →{" "}
                      {room.hostel.block} → Room{" "}
                      {room.roomNumber} (
                      {
                        room.capacity -
                          room.occupied
                      }{" "}
                      available)
                    </option>
                  ))}
              </select>
            </div>

            {/* Submit */}

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl btn-gradient shadow-lg px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Allocating..."
                  : "Allocate Room"}
              </button>
            </div>
          </form>
        </div>

        {/* Modify Allocation */}

        {editingAllocation && (
          <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Modify Room Allocation
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Student:{" "}
                  {
                    editingAllocation
                      .student.name
                  }
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Current room:{" "}
                  {
                    editingAllocation
                      .room.hostel.name
                  }{" "}
                  →{" "}
                  {
                    editingAllocation
                      .room.hostel.block
                  }{" "}
                  → Room{" "}
                  {
                    editingAllocation
                      .room.roomNumber
                  }
                </p>
              </div>

              <button
                onClick={cancelModify}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleModify}
              className="grid gap-5 sm:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  New Room *
                </label>

                <select
                  required
                  value={editRoomId}
                  onChange={(e) =>
                    setEditRoomId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select new room
                  </option>

                  {rooms
                    .filter(
                      (room) =>
                        room.occupied <
                          room.capacity ||
                        room.id ===
                          editingAllocation.room
                            .id
                    )
                    .map((room) => (
                      <option
                        key={room.id}
                        value={room.id}
                      >
                        {room.hostel.name} →{" "}
                        {room.hostel.block} → Room{" "}
                        {room.roomNumber} (
                        {room.capacity -
                          room.occupied}{" "}
                        available)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={modifying}
                  className="w-full rounded-xl btn-gradient shadow-lg px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {modifying
                    ? "Changing..."
                    : "Change Room"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Allocation List */}

        <div className="rounded-2xl glass-card shadow-xl">
          <div className="border-b border-white/10 p-6">
            <h3 className="text-xl font-bold">
              Current Room Allocations
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Students currently assigned to
              hostel rooms.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading allocations...
            </div>
          ) : allocations.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mb-3 text-4xl">
                🛏️
              </div>

              <h4 className="font-semibold">
                No room allocations yet
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Allocate a room to a student
                using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-sm">
                      Student
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Student ID
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Hostel
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Block
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Room
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Allocated
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {allocations.map(
                    (allocation) => (
                      <tr
                        key={allocation.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/5"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">
                              {
                                allocation
                                  .student
                                  .name
                              }
                            </p>

                            <p className="text-xs text-slate-500">
                              {
                                allocation
                                  .student
                                  .email
                              }
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {
                            allocation.student
                              .studentId
                          }
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {
                            allocation.room
                              .hostel.name
                          }
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {
                            allocation.room
                              .hostel.block
                          }
                        </td>

                        <td className="px-6 py-4 font-medium">
                          Room{" "}
                          {
                            allocation.room
                              .roomNumber
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(
                            allocation.allocatedAt
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              startModify(
                                allocation
                              )
                            }
                            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20"
                          >
                            ✏️ Modify
                          </button>
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