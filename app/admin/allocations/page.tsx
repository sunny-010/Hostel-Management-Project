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

type Allocation = {
  id: number;
  allocatedAt: string;
  student: Student;
  room: Room;
};

export default function AllocationsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");

  const [editingAllocation, setEditingAllocation] =
    useState<Allocation | null>(null);

  const [editRoomId, setEditRoomId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
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

      const studentsData = await studentsResponse.json();
      const hostelsData = await roomsResponse.json();
      const allocationsData = await allocationsResponse.json();

      setStudents(studentsData);
      setAllocations(allocationsData);

      const allRooms: Room[] = [];

      for (const hostel of hostelsData) {
        for (const room of hostel.rooms) {
          allRooms.push({
            ...room,
            hostel: {
              id: hostel.id,
              name: hostel.name,
              block: hostel.block,
            },
          });
        }
      }

      setRooms(allRooms);
    } catch (error) {
      console.error("Load allocation data error:", error);
      setMessage("Failed to load allocation data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!studentId || !roomId) {
      setMessage("Please select a student and a room");
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
          data.message || "Failed to allocate room"
        );
        return;
      }

      setMessage("Room allocated successfully!");

      setStudentId("");
      setRoomId("");

      await loadData();
    } catch (error) {
      console.error("Allocation error:", error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function startModify(allocation: Allocation) {
    setEditingAllocation(allocation);
    setEditRoomId(String(allocation.room.id));
    setMessage("");
  }

  function cancelModify() {
    setEditingAllocation(null);
    setEditRoomId("");
  }

  async function handleModify(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingAllocation || !editRoomId) {
      setMessage("Please select a new room");
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
      (room) => room.id === Number(editRoomId)
    );

    if (!selectedRoom) {
      setMessage("Selected room not found");
      return;
    }

    const confirmed = window.confirm(
      `Change ${editingAllocation.student.name}'s room from Room ${editingAllocation.room.roomNumber} to Room ${selectedRoom.roomNumber}?`
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            allocationId: editingAllocation.id,
            roomId: editRoomId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to modify room allocation"
        );
        return;
      }

      setMessage(
        `Room changed successfully to Room ${selectedRoom.roomNumber}!`
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
        "Something went wrong while modifying the room"
      );
    } finally {
      setModifying(false);
    }
  }

  const availableRooms = rooms.filter(
    (room) => room.occupied < room.capacity
  );

  const modificationRooms = rooms.filter(
    (room) =>
      room.occupied < room.capacity ||
      room.id === editingAllocation?.room.id
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
            Room Allocation
          </h2>

          <p className="mt-2 text-slate-400">
            Assign students to available hostel
            rooms and modify existing allocations.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Allocation Form */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-6 text-xl font-bold">
            Allocate Room
          </h3>

          {loading ? (
            <p className="text-slate-400">
              Loading...
            </p>
          ) : students.length === 0 ? (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm text-yellow-300">
              No students are registered yet.
              Please add a student first.
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm text-yellow-300">
              No rooms are available. Please
              create a room first.
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm text-yellow-300">
              All rooms are currently full.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-3"
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
                    setStudentId(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.name} (
                      {student.studentId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Available Room *
                </label>

                <select
                  required
                  value={roomId}
                  onChange={(e) =>
                    setRoomId(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select room
                  </option>

                  {availableRooms.map((room) => (
                    <option
                      key={room.id}
                      value={room.id}
                    >
                      {room.hostel.name} - Room{" "}
                      {room.roomNumber} (
                      {room.capacity -
                        room.occupied}{" "}
                      beds available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Allocating..."
                    : "Allocate Room"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modify Room Panel */}
        {editingAllocation && (
          <div className="mb-10 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
            <div className="mb-6">
              <p className="mb-1 text-sm font-medium text-blue-400">
                MODIFY ALLOCATION
              </p>

              <h3 className="text-xl font-bold">
                Change Room
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Changing room for{" "}
                <span className="font-semibold text-white">
                  {editingAllocation.student.name}
                </span>
              </p>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">
                  Current Room
                </p>

                <p className="mt-1 font-semibold text-blue-400">
                  {editingAllocation.room.hostel.name}
                  {" — "}
                  Room{" "}
                  {editingAllocation.room.roomNumber}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">
                  Student ID
                </p>

                <p className="mt-1 font-semibold">
                  {editingAllocation.student.studentId}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleModify}
              className="grid gap-5 md:grid-cols-3"
            >
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">
                  New Room *
                </label>

                <select
                  required
                  value={editRoomId}
                  onChange={(e) =>
                    setEditRoomId(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select new room
                  </option>

                  {modificationRooms.map((room) => (
                    <option
                      key={room.id}
                      value={room.id}
                    >
                      {room.hostel.name} - Room{" "}
                      {room.roomNumber} (
                      {room.capacity -
                        room.occupied}{" "}
                      beds available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={modifying}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {modifying
                    ? "Changing..."
                    : "Change Room"}
                </button>

                <button
                  type="button"
                  onClick={cancelModify}
                  disabled={modifying}
                  className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Current Allocations */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-bold">
              Current Allocations
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {allocations.length} active allocation
              {allocations.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading allocations...
            </div>
          ) : allocations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mb-4 text-5xl">
                🛏️
              </div>

              <h4 className="font-semibold">
                No room allocations yet
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Allocate a student to a room using
                the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Student
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Student ID
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Hostel
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Room
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Allocated On
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {allocations.map(
                    (allocation) => (
                      <tr
                        key={allocation.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {
                              allocation.student
                                .name
                            }
                          </p>

                          <p className="text-sm text-slate-500">
                            {
                              allocation.student
                                .email
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {
                            allocation.student
                              .studentId
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {
                            allocation.room.hostel
                              .name
                          }

                          <p className="text-xs text-slate-500">
                            Block{" "}
                            {
                              allocation.room.hostel
                                .block
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-blue-400">
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
                            className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/10"
                          >
                            Modify
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