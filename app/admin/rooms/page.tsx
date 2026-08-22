
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Room = {
  id: number;
  roomNumber: string;
  capacity: number;
  occupied: number;
};

type Hostel = {
  id: number;
  name: string;
  block: string;
  rooms: Room[];
};

export default function RoomsPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  const [showHostelForm, setShowHostelForm] =
    useState(false);

  const [showRoomForm, setShowRoomForm] =
    useState(false);

  const [hostelForm, setHostelForm] = useState({
    name: "",
    block: "",
  });

  const [roomForm, setRoomForm] = useState({
    hostelId: "",
    roomNumber: "",
    capacity: "",
  });

  const [editingHostel, setEditingHostel] =
    useState<Hostel | null>(null);

  const [editingRoom, setEditingRoom] =
    useState<Room | null>(null);

  const [editHostelForm, setEditHostelForm] =
    useState({
      name: "",
      block: "",
    });

  const [editRoomForm, setEditRoomForm] =
    useState({
      roomNumber: "",
      capacity: "",
    });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // -----------------------------
  // Load Hostels
  // -----------------------------

  async function loadHostels() {
    try {
      const response = await fetch(
        "/api/admin/hostels"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch hostels"
        );
      }

      const data = await response.json();

      setHostels(data);
    } catch (error) {
      console.error(
        "Load hostels error:",
        error
      );

      setMessage("Failed to load hostels");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHostels();
  }, []);

  // -----------------------------
  // Create Hostel
  // -----------------------------

  async function handleHostelSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/hostels",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(hostelForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to create hostel"
        );
        return;
      }

      setMessage(
        "Hostel created successfully!"
      );

      setHostelForm({
        name: "",
        block: "",
      });

      setShowHostelForm(false);

      await loadHostels();
    } catch (error) {
      console.error(
        "Create hostel error:",
        error
      );

      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Create Room
  // -----------------------------

  async function handleRoomSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/rooms",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(roomForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to create room"
        );
        return;
      }

      setMessage(
        "Room created successfully!"
      );

      setRoomForm({
        hostelId: "",
        roomNumber: "",
        capacity: "",
      });

      setShowRoomForm(false);

      await loadHostels();
    } catch (error) {
      console.error(
        "Create room error:",
        error
      );

      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Start Edit Hostel
  // -----------------------------

  function startEditHostel(
    hostel: Hostel
  ) {
    setEditingHostel(hostel);

    setEditHostelForm({
      name: hostel.name,
      block: hostel.block,
    });

    setEditingRoom(null);
    setMessage("");
  }

  // -----------------------------
  // Update Hostel
  // -----------------------------

  async function handleUpdateHostel(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingHostel) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/hostels",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: editingHostel.id,
            name: editHostelForm.name,
            block: editHostelForm.block,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to update hostel"
        );
        return;
      }

      setMessage(
        "Hostel updated successfully!"
      );

      setEditingHostel(null);

      await loadHostels();
    } catch (error) {
      console.error(
        "Update hostel error:",
        error
      );

      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Delete Hostel
  // -----------------------------

  async function handleDeleteHostel(
    hostel: Hostel
  ) {
    if (hostel.rooms.length > 0) {
      setMessage(
        `Cannot delete ${hostel.name}. Delete all rooms from this hostel first.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${hostel.name}"?`
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/hostels",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: hostel.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete hostel"
        );
        return;
      }

      setMessage(
        "Hostel deleted successfully!"
      );

      await loadHostels();
    } catch (error) {
      console.error(
        "Delete hostel error:",
        error
      );

      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Start Edit Room
  // -----------------------------

  function startEditRoom(room: Room) {
    setEditingRoom(room);

    setEditRoomForm({
      roomNumber: room.roomNumber,
      capacity: String(room.capacity),
    });

    setEditingHostel(null);
    setMessage("");
  }

  // -----------------------------
  // Update Room
  // -----------------------------

  async function handleUpdateRoom(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingRoom) return;

    const capacity = Number(
      editRoomForm.capacity
    );

    if (capacity < editingRoom.occupied) {
      setMessage(
        `Capacity cannot be less than current occupancy (${editingRoom.occupied}).`
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/rooms/${editingRoom.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            roomNumber:
              editRoomForm.roomNumber,
            capacity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to update room"
        );
        return;
      }

      setMessage(
        "Room updated successfully!"
      );

      setEditingRoom(null);

      await loadHostels();
    } catch (error) {
      console.error(
        "Update room error:",
        error
      );

      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Delete Room
  // -----------------------------

  async function handleDeleteRoom(
    room: Room
  ) {
    if (room.occupied > 0) {
      setMessage(
        `Room ${room.roomNumber} cannot be deleted because ${room.occupied} student(s) are currently allocated to it.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete Room ${room.roomNumber}?`
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/rooms/${room.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete room"
        );
        return;
      }

      setMessage(
        "Room deleted successfully!"
      );

      await loadHostels();
    } catch (error) {
      console.error(
        "Delete room error:",
        error
      );

      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Page
  // -----------------------------

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

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              ADMINISTRATION
            </p>

            <h2 className="text-3xl font-bold">
              Hostels & Rooms
            </h2>

            <p className="mt-2 text-slate-400">
              Manage hostels, rooms and
              available capacity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setShowHostelForm(
                  !showHostelForm
                );
                setShowRoomForm(false);
                setEditingHostel(null);
                setEditingRoom(null);
                setMessage("");
              }}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
            >
              {showHostelForm
                ? "Cancel"
                : "+ Add Hostel"}
            </button>

            <button
              onClick={() => {
                setShowRoomForm(
                  !showRoomForm
                );
                setShowHostelForm(false);
                setEditingHostel(null);
                setEditingRoom(null);
                setMessage("");
              }}
              className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
            >
              {showRoomForm
                ? "Cancel"
                : "+ Add Room"}
            </button>
          </div>
        </div>

        {/* Message */}

        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Add Hostel */}

        {showHostelForm && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="mb-6 text-xl font-bold">
              Add New Hostel
            </h3>

            <form
              onSubmit={handleHostelSubmit}
              className="grid gap-5 sm:grid-cols-3"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Hostel Name *
                </label>

                <input
                  required
                  value={hostelForm.name}
                  onChange={(e) =>
                    setHostelForm({
                      ...hostelForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Hostel A"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Block *
                </label>

                <input
                  required
                  value={hostelForm.block}
                  onChange={(e) =>
                    setHostelForm({
                      ...hostelForm,
                      block: e.target.value,
                    })
                  }
                  placeholder="Block A"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Hostel"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Room */}

        {showRoomForm && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="mb-6 text-xl font-bold">
              Add New Room
            </h3>

            <form
              onSubmit={handleRoomSubmit}
              className="grid gap-5 sm:grid-cols-4"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Hostel *
                </label>

                <select
                  required
                  value={roomForm.hostelId}
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      hostelId:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select hostel
                  </option>

                  {hostels.map((hostel) => (
                    <option
                      key={hostel.id}
                      value={hostel.id}
                    >
                      {hostel.name} -{" "}
                      {hostel.block}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Room Number *
                </label>

                <input
                  required
                  value={roomForm.roomNumber}
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      roomNumber:
                        e.target.value,
                    })
                  }
                  placeholder="101"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Capacity *
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  value={roomForm.capacity}
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      capacity:
                        e.target.value,
                    })
                  }
                  placeholder="4"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Hostel */}

        {editingHostel && (
          <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Edit Hostel
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Update hostel name and block.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingHostel(null)
                }
                className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleUpdateHostel}
              className="grid gap-5 sm:grid-cols-3"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Hostel Name *
                </label>

                <input
                  required
                  value={editHostelForm.name}
                  onChange={(e) =>
                    setEditHostelForm({
                      ...editHostelForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Block *
                </label>

                <input
                  required
                  value={editHostelForm.block}
                  onChange={(e) =>
                    setEditHostelForm({
                      ...editHostelForm,
                      block: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Room */}

        {editingRoom && (
          <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Edit Room
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Current occupancy:{" "}
                  {editingRoom.occupied}
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingRoom(null)
                }
                className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleUpdateRoom}
              className="grid gap-5 sm:grid-cols-3"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Room Number *
                </label>

                <input
                  required
                  value={editRoomForm.roomNumber}
                  onChange={(e) =>
                    setEditRoomForm({
                      ...editRoomForm,
                      roomNumber:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Capacity *
                </label>

                <input
                  required
                  type="number"
                  min={editingRoom.occupied}
                  max="20"
                  value={editRoomForm.capacity}
                  onChange={(e) =>
                    setEditRoomForm({
                      ...editRoomForm,
                      capacity:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Capacity cannot be less than{" "}
                  {editingRoom.occupied}.
                </p>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hostel List */}

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            Loading hostels...
          </div>
        ) : hostels.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <div className="mb-4 text-5xl">
              🏢
            </div>

            <h3 className="font-semibold">
              No hostels yet
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Add your first hostel to start
              managing rooms.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {hostels.map((hostel) => {
              const totalCapacity =
                hostel.rooms.reduce(
                  (total, room) =>
                    total + room.capacity,
                  0
                );

              const occupied =
                hostel.rooms.reduce(
                  (total, room) =>
                    total + room.occupied,
                  0
                );

              const available =
                totalCapacity - occupied;

              return (
                <div
                  key={hostel.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  {/* Hostel Header */}

                  <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-xl">
                          🏢
                        </div>

                        <div>
                          <h3 className="text-xl font-bold">
                            {hostel.name}
                          </h3>

                          <p className="text-sm text-slate-400">
                            {hostel.block}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hostel Actions */}

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          startEditHostel(
                            hostel
                          )
                        }
                        className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteHostel(
                            hostel
                          )
                        }
                        disabled={
                          saving ||
                          hostel.rooms
                            .length > 0
                        }
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                          hostel.rooms
                            .length > 0
                            ? "Delete all rooms first"
                            : "Delete hostel"
                        }
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Statistics */}

                  <div className="border-b border-white/10 px-6 py-4">
                    <div className="flex flex-wrap gap-8 text-sm">
                      <div>
                        <p className="text-slate-500">
                          Rooms
                        </p>

                        <p className="mt-1 font-bold">
                          {hostel.rooms.length}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">
                          Occupied
                        </p>

                        <p className="mt-1 font-bold">
                          {occupied}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">
                          Available
                        </p>

                        <p className="mt-1 font-bold text-green-400">
                          {available}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Room List */}

                  {hostel.rooms.length === 0 ? (
                    <div className="p-6 text-sm text-slate-400">
                      No rooms have been
                      added to this hostel
                      yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="border-b border-white/10">
                          <tr>
                            <th className="px-6 py-4 text-sm">
                              Room
                            </th>

                            <th className="px-6 py-4 text-sm">
                              Capacity
                            </th>

                            <th className="px-6 py-4 text-sm">
                              Occupied
                            </th>

                            <th className="px-6 py-4 text-sm">
                              Available
                            </th>

                            <th className="px-6 py-4 text-sm">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {hostel.rooms.map(
                            (room) => (
                              <tr
                                key={room.id}
                                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                              >
                                <td className="px-6 py-4 font-medium">
                                  Room{" "}
                                  {
                                    room.roomNumber
                                  }
                                </td>

                                <td className="px-6 py-4 text-slate-300">
                                  {
                                    room.capacity
                                  }
                                </td>

                                <td className="px-6 py-4 text-slate-300">
                                  {
                                    room.occupied
                                  }
                                </td>

                                <td className="px-6 py-4">
                                  <span className="font-semibold text-green-400">
                                    {Math.max(
                                      room.capacity -
                                        room.occupied,
                                      0
                                    )}
                                  </span>
                                </td>

                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() =>
                                        startEditRoom(
                                          room
                                        )
                                      }
                                      className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                                    >
                                      ✏️ Edit
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleDeleteRoom(
                                          room
                                        )
                                      }
                                      disabled={
                                        saving ||
                                        room.occupied >
                                          0
                                      }
                                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                      title={
                                        room.occupied >
                                        0
                                          ? "Students are allocated to this room"
                                          : "Delete room"
                                      }
                                    >
                                      🗑️ Delete
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
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
