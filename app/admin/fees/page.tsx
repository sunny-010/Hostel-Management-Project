"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  rooms?: Room[];
};

type Student = {
  id: number;
  studentId: string;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  year?: number | null;
  hostel?: {
    id: number;
    name: string;
  } | null;
  block?: {
    id: number;
    name: string;
  } | null;
  room?: {
    id: number;
    roomNumber: string;
  } | null;
};

type FeeStatus =
  | "PENDING"
  | "PAID"
  | "OVERDUE";

type Fee = {
  id: number;
  amount: string;
  status: FeeStatus;
  dueDate: string;
  paidDate: string | null;
  createdAt?: string;
  student: Student;
};

export default function FeesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);

  /* --------------------------------------------------
     CREATE FEE
  -------------------------------------------------- */

  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  /* --------------------------------------------------
     GENERAL STATE
  -------------------------------------------------- */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* --------------------------------------------------
     EDIT FEE
  -------------------------------------------------- */

  const [editingFeeId, setEditingFeeId] =
    useState<number | null>(null);

  const [editAmount, setEditAmount] =
    useState("");

  const [editDueDate, setEditDueDate] =
    useState("");

  const [editStatus, setEditStatus] =
    useState<FeeStatus>("PENDING");

  /* --------------------------------------------------
     SEARCH / FILTERS
  -------------------------------------------------- */

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchActive, setSearchActive] =
    useState(false);

  const [selectedHostelId, setSelectedHostelId] =
    useState("");

  const [selectedBlockId, setSelectedBlockId] =
    useState("");

  const [selectedRoomId, setSelectedRoomId] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<"" | FeeStatus>("");

  /* --------------------------------------------------
     LOAD DATA
  -------------------------------------------------- */

  async function loadData(searchTerm = "") {
    try {
      setSearching(Boolean(searchTerm));

      const [
        studentsResponse,
        feesResponse,
        hostelsResponse,
      ] = await Promise.all([
        fetch("/api/admin/students"),
        fetch(
          `/api/admin/fees${
            searchTerm
              ? `?search=${encodeURIComponent(
                  searchTerm
                )}`
              : ""
          }`
        ),
        fetch("/api/admin/hostels"),
      ]);

      if (
        !studentsResponse.ok ||
        !feesResponse.ok ||
        !hostelsResponse.ok
      ) {
        throw new Error(
          "Failed to load data"
        );
      }

      const studentsData =
        await studentsResponse.json();

      const feesData =
        await feesResponse.json();

      const hostelsData =
        await hostelsResponse.json();

      setStudents(studentsData);
      setFees(feesData);
      setHostels(hostelsData);
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
      setSearching(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* --------------------------------------------------
     SELECTED HOSTEL
  -------------------------------------------------- */

  const selectedHostel = useMemo(() => {
    return hostels.find(
      (hostel) =>
        String(hostel.id) ===
        selectedHostelId
    );
  }, [
    hostels,
    selectedHostelId,
  ]);

  /* --------------------------------------------------
     SELECTED BLOCK
  -------------------------------------------------- */

  const selectedBlock = useMemo(() => {
    return selectedHostel?.blocks?.find(
      (block) =>
        String(block.id) ===
        selectedBlockId
    );
  }, [
    selectedHostel,
    selectedBlockId,
  ]);

  /* --------------------------------------------------
     AVAILABLE ROOMS
  -------------------------------------------------- */

  const availableRooms = useMemo(() => {
    if (!selectedBlock) {
      return [];
    }

    return selectedBlock.rooms || [];
  }, [selectedBlock]);

  /* --------------------------------------------------
     HOSTEL CHANGE
  -------------------------------------------------- */

  function handleHostelChange(
    value: string
  ) {
    setSelectedHostelId(value);
    setSelectedBlockId("");
    setSelectedRoomId("");
  }

  /* --------------------------------------------------
     BLOCK CHANGE
  -------------------------------------------------- */

  function handleBlockChange(
    value: string
  ) {
    setSelectedBlockId(value);
    setSelectedRoomId("");
  }

  /* --------------------------------------------------
     ROOM CHANGE
  -------------------------------------------------- */

  function handleRoomChange(
    value: string
  ) {
    setSelectedRoomId(value);
  }

  /* --------------------------------------------------
     STATUS CHANGE
  -------------------------------------------------- */

  function handleStatusChange(
    value: "" | FeeStatus
  ) {
    setSelectedStatus(value);
  }

  /* --------------------------------------------------
     TEXT SEARCH
  -------------------------------------------------- */

  async function handleFeeSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedSearch =
      search.trim();

    setSearchActive(
      Boolean(trimmedSearch)
    );

    await loadData(
      trimmedSearch
    );
  }

  /* --------------------------------------------------
     CLEAR TEXT SEARCH
  -------------------------------------------------- */

  async function clearFeeSearch() {
    setSearch("");
    setSearchActive(false);

    await loadData("");
  }

  /* --------------------------------------------------
     FILTER FEES
  -------------------------------------------------- */

  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const feeHostelId =
        fee.student.hostel?.id;

      const feeBlockId =
        fee.student.block?.id;

      const feeRoomId =
        fee.student.room?.id;

      /* Hostel */

      if (
        selectedHostelId &&
        String(feeHostelId) !==
          selectedHostelId
      ) {
        return false;
      }

      /* Block */

      if (
        selectedBlockId &&
        String(feeBlockId) !==
          selectedBlockId
      ) {
        return false;
      }

      /* Room */

      if (
        selectedRoomId &&
        String(feeRoomId) !==
          selectedRoomId
      ) {
        return false;
      }

      /* Status */

      if (
        selectedStatus &&
        fee.status !==
          selectedStatus
      ) {
        return false;
      }

      return true;
    });
  }, [
    fees,
    selectedHostelId,
    selectedBlockId,
    selectedRoomId,
    selectedStatus,
  ]);

  /* --------------------------------------------------
     CREATE FEE
  -------------------------------------------------- */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
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

      await loadData(
        searchActive
          ? search
          : ""
      );
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

  /* --------------------------------------------------
     START EDITING
  -------------------------------------------------- */

  function startEditing(
    fee: Fee
  ) {
    setEditingFeeId(fee.id);

    setEditAmount(
      Number(
        fee.amount
      ).toString()
    );

    setEditDueDate(
      new Date(
        fee.dueDate
      )
        .toISOString()
        .split("T")[0]
    );

    setEditStatus(
      fee.status
    );

    setMessage("");
  }

  /* --------------------------------------------------
     CANCEL EDITING
  -------------------------------------------------- */

  function cancelEditing() {
    setEditingFeeId(null);
    setEditAmount("");
    setEditDueDate("");
    setEditStatus("PENDING");
  }

  /* --------------------------------------------------
     SAVE EDIT
  -------------------------------------------------- */

  async function saveEditedFee(
    id: number
  ) {
    if (
      !editAmount ||
      !editDueDate
    ) {
      setMessage(
        "Amount and due date are required"
      );

      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/fees",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id,
              amount:
                editAmount,
              dueDate:
                editDueDate,
              status:
                editStatus,
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

      await loadData(
        searchActive
          ? search
          : ""
      );
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

  /* --------------------------------------------------
     DELETE FEE
  -------------------------------------------------- */

  async function deleteFee(
    id: number,
    studentName: string
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete the fee record for ${studentName}?`
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
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

      await loadData(
        searchActive
          ? search
          : ""
      );
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

  /* --------------------------------------------------
     QUICK STATUS UPDATE
  -------------------------------------------------- */

  async function updateFeeStatus(
    id: number,
    status:
      | "PAID"
      | "PENDING"
  ) {
    try {
      const response =
        await fetch(
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

      await loadData(
        searchActive
          ? search
          : ""
      );
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

  /* --------------------------------------------------
     SUMMARY
  -------------------------------------------------- */

  const pendingFees =
    filteredFees.filter(
      (fee) =>
        fee.status ===
        "PENDING"
    );

  const overdueFees =
    filteredFees.filter(
      (fee) =>
        fee.status ===
        "OVERDUE"
    );

  const paidFees =
    filteredFees.filter(
      (fee) =>
        fee.status ===
        "PAID"
    );

  const totalPending =
    pendingFees.reduce(
      (total, fee) =>
        total +
        Number(
          fee.amount
        ),
      0
    );

  const totalOverdue =
    overdueFees.reduce(
      (total, fee) =>
        total +
        Number(
          fee.amount
        ),
      0
    );

  const totalPaid =
    paidFees.reduce(
      (total, fee) =>
        total +
        Number(
          fee.amount
        ),
      0
    );

  /* --------------------------------------------------
     CLEAR LOCATION FILTERS
  -------------------------------------------------- */

  function clearLocationFilters() {
    setSelectedHostelId("");
    setSelectedBlockId("");
    setSelectedRoomId("");
  }

  /* --------------------------------------------------
     CLEAR ALL FILTERS
  -------------------------------------------------- */

  function clearAllFilters() {
    setSelectedHostelId("");
    setSelectedBlockId("");
    setSelectedRoomId("");
    setSelectedStatus("");
    setSearch("");
    setSearchActive(false);

    loadData("");
  }

  const locationFilterActive =
    Boolean(
      selectedHostelId ||
        selectedBlockId ||
        selectedRoomId
    );

  const anyFilterActive =
    Boolean(
      selectedHostelId ||
        selectedBlockId ||
        selectedRoomId ||
        selectedStatus ||
        searchActive
    );

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

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

      {/* MAIN */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADING */}

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

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-sm text-slate-400">
              Total Fees
            </p>

            <p className="mt-2 text-3xl font-bold">
              {filteredFees.length}
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

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">

            <p className="text-sm text-slate-400">
              Overdue Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              ₹{totalOverdue.toFixed(2)}
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

        {/* CREATE FEE */}

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

              {/* STUDENT */}

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
                        key={
                          student.id
                        }
                        value={
                          student.id
                        }
                      >
                        {student.name} (
                        {
                          student.studentId
                        })
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* AMOUNT */}

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

              {/* DUE DATE */}

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

              {/* BUTTON */}

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

        {/* SEARCH AND FILTERS */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div className="mb-5">

            <h3 className="text-xl font-bold">
              🔎 Search & Filter Fee Records
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Use the dropdowns directly or
              search by student details.
              No search box is required for
              dropdown filtering.
            </p>

          </div>

          {/* DROPDOWNS */}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* HOSTEL */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Hostel
              </label>

              <select
                value={
                  selectedHostelId
                }
                onChange={(e) =>
                  handleHostelChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              >

                <option value="">
                  All Hostels
                </option>

                {hostels.map(
                  (hostel) => (
                    <option
                      key={
                        hostel.id
                      }
                      value={
                        hostel.id
                      }
                    >
                      {hostel.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* BLOCK */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Block
              </label>

              <select
                value={
                  selectedBlockId
                }
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
                    ? "All Blocks"
                    : "Select hostel first"}
                </option>

                {selectedHostel?.blocks?.map(
                  (block) => (
                    <option
                      key={
                        block.id
                      }
                      value={
                        block.id
                      }
                    >
                      {block.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* ROOM */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Room
              </label>

              <select
                value={
                  selectedRoomId
                }
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
                    ? "All Rooms"
                    : "Select block first"}
                </option>

                {availableRooms.map(
                  (room) => (
                    <option
                      key={
                        room.id
                      }
                      value={
                        room.id
                      }
                    >
                      Room{" "}
                      {
                        room.roomNumber
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* STATUS */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Fee Status
              </label>

              <select
                value={
                  selectedStatus
                }
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as
                      | ""
                      | FeeStatus
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              >

                <option value="">
                  All Status
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="OVERDUE">
                  Overdue
                </option>

                <option value="PAID">
                  Paid
                </option>

              </select>

            </div>

          </div>

          {/* TEXT SEARCH */}

          <form
            onSubmit={
              handleFeeSearch
            }
            className="mt-5 flex flex-col gap-3 md:flex-row"
          >

            <div className="relative flex-1">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search student, ID, email, department, hostel, block, room..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
              />

              {search && (
                <button
                  type="button"
                  onClick={
                    clearFeeSearch
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}

            </div>

            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching
                ? "Searching..."
                : "Search"}
            </button>

          </form>

          {/* FILTER BUTTONS */}

          {anyFilterActive && (

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={
                  clearAllFilters
                }
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
              >
                Clear All Filters
              </button>

              {locationFilterActive && (

                <button
                  type="button"
                  onClick={
                    clearLocationFilters
                  }
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                >
                  Clear Location
                </button>

              )}

              {selectedStatus && (

                <span className="rounded-full bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400">
                  Status:{" "}
                  {
                    selectedStatus
                  }
                </span>

              )}

            </div>

          )}

          {/* ACTIVE FILTER INFO */}

          {locationFilterActive && (

            <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-300">

              Showing:

              {" "}

              <span className="font-semibold">
                {selectedHostel?.name ||
                  "All Hostels"}
              </span>

              {selectedBlock && (
                <>
                  {" → "}
                  <span className="font-semibold">
                    {
                      selectedBlock.name
                    }
                  </span>
                </>
              )}

              {selectedRoomId && (
                <>
                  {" → Room "}
                  <span className="font-semibold">
                    {
                      availableRooms.find(
                        (room) =>
                          String(
                            room.id
                          ) ===
                          selectedRoomId
                      )?.roomNumber
                    }
                  </span>
                </>
              )}

            </div>

          )}

          {searchActive && (

            <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-300">

              Showing search results
              for{" "}

              <span className="font-semibold">
                "{search}"
              </span>

              . Historical paid
              records are included
              in search results.

            </div>

          )}

        </div>

        {/* FEE TABLE */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="border-b border-white/10 px-6 py-5">

            <h3 className="font-bold">
              Fee Records
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {filteredFees.length} fee record
              {filteredFees.length !==
              1
                ? "s"
                : ""}
            </p>

          </div>

          {loading ? (

            <div className="px-6 py-12 text-center text-slate-400">
              Loading fees...
            </div>

          ) : filteredFees.length ===
            0 ? (

            <div className="px-6 py-12 text-center">

              <div className="mb-4 text-5xl">
                💰
              </div>

              <h4 className="font-semibold">
                {anyFilterActive
                  ? "No matching fee records"
                  : "No fees yet"}
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                {anyFilterActive
                  ? "Try another search or filter."
                  : "Create the first fee using the form above."}
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
                      Paid Date
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

                  {filteredFees.map(
                    (fee) => (

                      <tr
                        key={
                          fee.id
                        }
                        className="border-b border-white/5 last:border-0"
                      >

                        {/* STUDENT */}

                        <td className="px-6 py-4">

                          <p className="font-medium">
                            {
                              fee
                                .student
                                .name
                            }
                          </p>

                          <p className="text-sm text-slate-500">
                            {
                              fee
                                .student
                                .studentId
                            }
                          </p>

                          {fee.student
                            .department && (

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                fee
                                  .student
                                  .department
                              }
                            </p>

                          )}

                          <p className="mt-1 text-xs text-slate-500">

                            {fee
                              .student
                              .hostel
                              ?.name ||
                              "No hostel"}

                            {" • "}

                            {fee
                              .student
                              .block
                              ?.name ||
                              "No block"}

                            {" • Room "}

                            {fee
                              .student
                              .room
                              ?.roomNumber ||
                              "—"}

                          </p>

                        </td>

                        {editingFeeId ===
                        fee.id ? (

                          <>

                            {/* EDIT AMOUNT */}

                            <td className="px-6 py-4">

                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={
                                  editAmount
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditAmount(
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className="w-32 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                              />

                            </td>

                            {/* EDIT DATE */}

                            <td className="px-6 py-4">

                              <input
                                type="date"
                                value={
                                  editDueDate
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditDueDate(
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-blue-500"
                              />

                            </td>

                            {/* PAID DATE */}

                            <td className="px-6 py-4 text-sm text-slate-500">

                              {fee.paidDate
                                ? new Date(
                                    fee.paidDate
                                  ).toLocaleString()
                                : "—"}

                            </td>

                            {/* EDIT STATUS */}

                            <td className="px-6 py-4">

                              <select
                                value={
                                  editStatus
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditStatus(
                                    e
                                      .target
                                      .value as FeeStatus
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

                            {/* EDIT ACTIONS */}

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

                            {/* AMOUNT */}

                            <td className="px-6 py-4 font-semibold">
                              ₹
                              {Number(
                                fee.amount
                              ).toFixed(
                                2
                              )}
                            </td>

                            {/* DUE DATE */}

                            <td className="px-6 py-4 text-sm text-slate-400">
                              {new Date(
                                fee.dueDate
                              ).toLocaleDateString()}
                            </td>

                            {/* PAID DATE */}

                            <td className="px-6 py-4 text-sm text-slate-400">
                              {fee.paidDate
                                ? new Date(
                                    fee.paidDate
                                  ).toLocaleString()
                                : "—"}
                            </td>

                            {/* STATUS */}

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
                                {
                                  fee.status
                                }
                              </span>

                            </td>

                            {/* ACTIONS */}

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
                                      fee
                                        .student
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