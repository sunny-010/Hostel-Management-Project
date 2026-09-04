"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Room = {
  id: number;
  roomNumber: string;
  capacity: number;
  occupied: number;
  hostelId: number;
  blockId: number;
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

export default function RoomsPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [showHostelForm, setShowHostelForm] =
    useState(false);

  const [showBlockForm, setShowBlockForm] =
    useState(false);

  const [showRoomForm, setShowRoomForm] =
    useState(false);

  // --------------------------------------------------
  // Hostel Form
  // --------------------------------------------------

  const [hostelForm, setHostelForm] = useState({
    name: "",
    block: "",
  });

  // --------------------------------------------------
  // Block Form
  // --------------------------------------------------

  const [blockForm, setBlockForm] = useState({
    hostelId: "",
    name: "",
  });

  // --------------------------------------------------
  // Room Form
  // --------------------------------------------------

  const [roomForm, setRoomForm] = useState({
    hostelId: "",
    blockId: "",
    roomNumber: "",
    capacity: "",
  });

  // --------------------------------------------------
  // Editing
  // --------------------------------------------------

  const [editingHostel, setEditingHostel] =
    useState<Hostel | null>(null);

  const [editingRoom, setEditingRoom] =
    useState<Room | null>(null);

  const [editHostelForm, setEditHostelForm] =
    useState({
      name: "",
    });

  const [editRoomForm, setEditRoomForm] =
    useState({
      roomNumber: "",
      capacity: "",
    });

  // --------------------------------------------------
  // Load Hostels
  // --------------------------------------------------

  async function loadHostels() {
    try {
      setLoading(true);

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

      setMessage(
        "Failed to load hostels"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHostels();
  }, []);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  function closeAllForms() {
    setShowHostelForm(false);
    setShowBlockForm(false);
    setShowRoomForm(false);
    setEditingHostel(null);
    setEditingRoom(null);
    setMessage("");
  }

  function getBlockCount(hostel: Hostel) {
    return hostel.blocks.length;
  }

  function getRoomCount(hostel: Hostel) {
    return hostel.blocks.reduce(
      (total, block) =>
        total + block.rooms.length,
      0
    );
  }

  function getTotalCapacity(hostel: Hostel) {
    return hostel.blocks.reduce(
      (total, block) =>
        total +
        block.rooms.reduce(
          (blockTotal, room) =>
            blockTotal + room.capacity,
          0
        ),
      0
    );
  }

  function getOccupied(hostel: Hostel) {
    return hostel.blocks.reduce(
      (total, block) =>
        total +
        block.rooms.reduce(
          (blockTotal, room) =>
            blockTotal + room.occupied,
          0
        ),
      0
    );
  }

  // --------------------------------------------------
  // Add Hostel
  // --------------------------------------------------

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
            "Content-Type": "application/json",
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

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Add Block
  // --------------------------------------------------

  async function handleBlockSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/blocks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostelId: Number(
              blockForm.hostelId
            ),
            name: blockForm.name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to create block"
        );
        return;
      }

      setMessage(
        "Block created successfully!"
      );

      setBlockForm({
        hostelId: "",
        name: "",
      });

      setShowBlockForm(false);

      await loadHostels();
    } catch (error) {
      console.error(
        "Create block error:",
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
  // Add Room
  // --------------------------------------------------

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostelId: Number(
              roomForm.hostelId
            ),
            blockId: Number(
              roomForm.blockId
            ),
            roomNumber:
              roomForm.roomNumber,
            capacity: Number(
              roomForm.capacity
            ),
          }),
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
        blockId: "",
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

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Edit Hostel
  // --------------------------------------------------

  function startEditHostel(
    hostel: Hostel
  ) {
    setEditingHostel(hostel);

    setEditHostelForm({
      name: hostel.name,
    });

    setShowHostelForm(false);
    setShowBlockForm(false);
    setShowRoomForm(false);
    setEditingRoom(null);
    setMessage("");
  }

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingHostel.id,
            name: editHostelForm.name,
            block:
              editingHostel.blocks[0]
                ?.name ||
              editingHostel.block ||
              "",
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

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Delete Hostel
  // --------------------------------------------------

  async function handleDeleteHostel(
    hostel: Hostel
  ) {
    const roomCount =
      getRoomCount(hostel);

    const blockCount =
      getBlockCount(hostel);

    if (roomCount > 0) {
      setMessage(
        `Cannot delete ${hostel.name}. Delete all rooms first.`
      );
      return;
    }

    if (blockCount > 0) {
      setMessage(
        `Cannot delete ${hostel.name}. Delete all blocks first.`
      );
      return;
    }

    const confirmed =
      window.confirm(
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

      const data =
        await response.json();

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

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Delete Block
  // --------------------------------------------------

  async function handleDeleteBlock(
    block: Block
  ) {
    if (block.rooms.length > 0) {
      setMessage(
        `Cannot delete ${block.name}. Delete all rooms from this block first.`
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${block.name}"?`
      );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/blocks",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: block.id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete block"
        );
        return;
      }

      setMessage(
        "Block deleted successfully!"
      );

      await loadHostels();
    } catch (error) {
      console.error(
        "Delete block error:",
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
  // Edit Room
  // --------------------------------------------------

  function startEditRoom(
    room: Room
  ) {
    setEditingRoom(room);

    setEditRoomForm({
      roomNumber:
        room.roomNumber,
      capacity:
        String(room.capacity),
    });

    setEditingHostel(null);
    setShowHostelForm(false);
    setShowBlockForm(false);
    setShowRoomForm(false);
    setMessage("");
  }

  async function handleUpdateRoom(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingRoom) return;

    const capacity = Number(
      editRoomForm.capacity
    );

    if (
      capacity <
      editingRoom.occupied
    ) {
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

      const data =
        await response.json();

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

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Delete Room
  // --------------------------------------------------

  async function handleDeleteRoom(
    room: Room
  ) {
    if (room.occupied > 0) {
      setMessage(
        `Room ${room.roomNumber} cannot be deleted because ${room.occupied} student(s) are currently allocated to it.`
      );
      return;
    }

    const confirmed =
      window.confirm(
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

      const data =
        await response.json();

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

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
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

          <div className="flex items-center gap-3">
            <Link
            href="/admin/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>

            <form action="/api/logout" method="POST">
              <button
                type="submit"
                title="Logout"
                aria-label="Logout"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}

      <section className="mx-auto max-w-7xl px-6 py-10 animate-fade-in-up">
        {/* Heading */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              ADMINISTRATION
            </p>

            <h2 className="text-3xl font-bold">
              Hostels, Blocks & Rooms
            </h2>

            <p className="mt-2 text-slate-400">
              Manage hostels, blocks, rooms and
              available capacity.
            </p>
          </div>

          {/* Buttons */}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setShowHostelForm(
                  !showHostelForm
                );
                setShowBlockForm(false);
                setShowRoomForm(false);
                setEditingHostel(null);
                setEditingRoom(null);
                setMessage("");
              }}
              className="rounded-xl btn-gradient shadow-lg px-5 py-3 font-semibold transition hover:bg-blue-500"
            >
              {showHostelForm
                ? "Cancel"
                : "+ Add Hostel"}
            </button>

            <button
              onClick={() => {
                setShowBlockForm(
                  !showBlockForm
                );
                setShowHostelForm(false);
                setShowRoomForm(false);
                setEditingHostel(null);
                setEditingRoom(null);
                setMessage("");
              }}
              className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-5 py-3 font-semibold text-purple-400 transition hover:bg-purple-500/20"
            >
              {showBlockForm
                ? "Cancel"
                : "+ Add Block"}
            </button>

            <button
              onClick={() => {
                setShowRoomForm(
                  !showRoomForm
                );
                setShowHostelForm(false);
                setShowBlockForm(false);
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

        {/* ==================================================
            ADD HOSTEL
        ================================================== */}

        {showHostelForm && (
          <div className="mb-8 rounded-2xl glass-card shadow-xl p-6">
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
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  First Block Name *
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
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl btn-gradient shadow-lg px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Hostel"}
                </button>
              </div>
            </form>

            <p className="mt-4 text-xs text-slate-500">
              The first block will automatically be
              created with the hostel.
            </p>
          </div>
        )}

        {/* ==================================================
            ADD BLOCK
        ================================================== */}

        {showBlockForm && (
          <div className="mb-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
            <h3 className="mb-6 text-xl font-bold">
              Add New Block
            </h3>

            <form
              onSubmit={handleBlockSubmit}
              className="grid gap-5 sm:grid-cols-3"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Hostel *
                </label>

                <select
                  required
                  value={blockForm.hostelId}
                  onChange={(e) =>
                    setBlockForm({
                      ...blockForm,
                      hostelId:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-purple-500"
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

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Block Name *
                </label>

                <input
                  required
                  value={blockForm.name}
                  onChange={(e) =>
                    setBlockForm({
                      ...blockForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Block B"
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Block"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================
            ADD ROOM
        ================================================== */}

        {showRoomForm && (
          <div className="mb-8 rounded-2xl glass-card shadow-xl p-6">
            <h3 className="mb-6 text-xl font-bold">
              Add New Room
            </h3>

            <form
              onSubmit={handleRoomSubmit}
              className="grid gap-5 sm:grid-cols-5"
            >
              {/* Hostel */}

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Hostel *
                </label>

                <select
                  required
                  value={roomForm.hostelId}
                  onChange={(e) => {
                    setRoomForm({
                      ...roomForm,
                      hostelId:
                        e.target.value,
                      blockId: "",
                    });
                  }}
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
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
                <label className="mb-2 block text-sm text-slate-300">
                  Block *
                </label>

                <select
                  required
                  value={roomForm.blockId}
                  disabled={
                    !roomForm.hostelId
                  }
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      blockId:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {roomForm.hostelId
                      ? "Select block"
                      : "Select hostel first"}
                  </option>

                  {hostels
                    .find(
                      (hostel) =>
                        String(
                          hostel.id
                        ) ===
                        roomForm.hostelId
                    )
                    ?.blocks.map(
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

              {/* Room Number */}

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Room Number *
                </label>

                <input
                  required
                  value={
                    roomForm.roomNumber
                  }
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      roomNumber:
                        e.target.value,
                    })
                  }
                  placeholder="101"
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Capacity */}

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Capacity *
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  value={
                    roomForm.capacity
                  }
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      capacity:
                        e.target.value,
                    })
                  }
                  placeholder="4"
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit */}

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl btn-gradient shadow-lg px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================
            EDIT HOSTEL
        ================================================== */}

        {editingHostel && (
          <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Edit Hostel
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Update hostel name.
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
              className="grid gap-5 sm:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Hostel Name *
                </label>

                <input
                  required
                  value={
                    editHostelForm.name
                  }
                  onChange={(e) =>
                    setEditHostelForm({
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl btn-gradient shadow-lg px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================
            EDIT ROOM
        ================================================== */}

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
                  value={
                    editRoomForm.roomNumber
                  }
                  onChange={(e) =>
                    setEditRoomForm({
                      ...editRoomForm,
                      roomNumber:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Capacity *
                </label>

                <input
                  required
                  type="number"
                  min={
                    editingRoom.occupied
                  }
                  max="20"
                  value={
                    editRoomForm.capacity
                  }
                  onChange={(e) =>
                    setEditRoomForm({
                      ...editRoomForm,
                      capacity:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 input-glow bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Capacity cannot be less than{" "}
                  {
                    editingRoom.occupied
                  }
                  .
                </p>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl btn-gradient shadow-lg px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================
            HOSTEL LIST
        ================================================== */}

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            Loading hostels...
          </div>
        ) : hostels.length === 0 ? (
          <div className="rounded-2xl glass-card shadow-xl px-6 py-14 text-center">
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
              const roomCount =
                getRoomCount(hostel);

              const blockCount =
                getBlockCount(hostel);

              const totalCapacity =
                getTotalCapacity(hostel);

              const occupied =
                getOccupied(hostel);

              const available =
                totalCapacity -
                occupied;

              return (
                <div
                  key={hostel.id}
                  className="overflow-hidden rounded-2xl glass-card shadow-xl"
                >
                  {/* Hostel Header */}

                  <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl btn-gradient shadow-lg/10 text-xl">
                        🏢
                      </div>

                      <div>
                        <h3 className="text-xl font-bold">
                          {hostel.name}
                        </h3>

                        <p className="text-sm text-slate-400">
                          {blockCount}{" "}
                          {blockCount ===
                          1
                            ? "Block"
                            : "Blocks"}{" "}
                          •{" "}
                          {roomCount}{" "}
                          {roomCount ===
                          1
                            ? "Room"
                            : "Rooms"}
                        </p>
                      </div>
                    </div>

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
                          roomCount >
                            0 ||
                          blockCount >
                            0
                        }
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                          roomCount >
                          0
                            ? "Delete all rooms first"
                            : blockCount >
                              0
                            ? "Delete all blocks first"
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
                          Blocks
                        </p>

                        <p className="mt-1 font-bold">
                          {blockCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">
                          Rooms
                        </p>

                        <p className="mt-1 font-bold">
                          {roomCount}
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

                  {/* Blocks */}

                  <div className="divide-y divide-white/10">
                    {hostel.blocks.map(
                      (block) => (
                        <div
                          key={block.id}
                          className="p-6"
                        >
                          {/* Block Header */}

                          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                                🧱
                              </div>

                              <div>
                                <h4 className="font-semibold">
                                  {
                                    block.name
                                  }
                                </h4>

                                <p className="text-xs text-slate-500">
                                  {
                                    block
                                      .rooms
                                      .length
                                  }{" "}
                                  {block
                                    .rooms
                                    .length ===
                                  1
                                    ? "room"
                                    : "rooms"}
                                </p>
                              </div>
                            </div>

                            {/* Block Delete */}

                            <button
                              onClick={() =>
                                handleDeleteBlock(
                                  block
                                )
                              }
                              disabled={
                                saving ||
                                block
                                  .rooms
                                  .length >
                                  0
                              }
                              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                              title={
                                block
                                  .rooms
                                  .length >
                                0
                                  ? "Delete all rooms first"
                                  : "Delete block"
                              }
                            >
                              🗑️ Delete Block
                            </button>
                          </div>

                          {/* No Rooms */}

                          {block.rooms
                            .length ===
                          0 ? (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-500">
                              No rooms have been
                              added to this
                              block yet.
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-white/10">
                              <table className="w-full text-left">
                                <thead className="border-b border-white/10 bg-white/5">
                                  <tr>
                                    <th className="px-5 py-4 text-sm">
                                      Room
                                    </th>

                                    <th className="px-5 py-4 text-sm">
                                      Capacity
                                    </th>

                                    <th className="px-5 py-4 text-sm">
                                      Occupied
                                    </th>

                                    <th className="px-5 py-4 text-sm">
                                      Available
                                    </th>

                                    <th className="px-5 py-4 text-sm">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {block.rooms.map(
                                    (room) => (
                                      <tr
                                        key={
                                          room.id
                                        }
                                        className="border-b border-white/5 last:border-0 hover:bg-white/5"
                                      >
                                        <td className="px-5 py-4 font-medium">
                                          Room{" "}
                                          {
                                            room.roomNumber
                                          }
                                        </td>

                                        <td className="px-5 py-4 text-slate-300">
                                          {
                                            room.capacity
                                          }
                                        </td>

                                        <td className="px-5 py-4 text-slate-300">
                                          {
                                            room.occupied
                                          }
                                        </td>

                                        <td className="px-5 py-4">
                                          <span className="font-semibold text-green-400">
                                            {Math.max(
                                              room.capacity -
                                                room.occupied,
                                              0
                                            )}
                                          </span>
                                        </td>

                                        <td className="px-5 py-4">
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
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}