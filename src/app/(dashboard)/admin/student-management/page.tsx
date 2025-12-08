'use client';

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

type Student = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  group?: string;
  accountStatus?: "Active" | "Inactive" | "Suspended" | string;
  registrationDate?: string;
  createdAt?: string;
};

type Toast = { type: "success" | "error"; message: string } | null;

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Inactive: "bg-slate-100 text-slate-800 border border-slate-200",
  Suspended: "bg-rose-100 text-rose-800 border border-rose-200",
};

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<Toast>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    group: "",
    accountStatus: "Active",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    group: "",
    accountStatus: "Active",
  });

  // Modal State
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (t: Toast) => {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 2600);
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error || "Failed to load students");
      }
      setStudents(body.students || []);
    } catch (err: any) {
      showToast({ type: "error", message: err?.message || "Could not load students" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase().trim();
    return students
      .filter((s) => {
        const matchesStatus = statusFilter === "all" || s.accountStatus === statusFilter;
        const matchesTerm =
          !term ||
          s.name.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          (s.college || "").toLowerCase().includes(term) ||
          (s.group || "").toLowerCase().includes(term);
        return matchesStatus && matchesTerm;
      })
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [students, search, statusFilter]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error || "Unable to create student");
      }
      setStudents((prev) => [body.student, ...prev]);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        college: "",
        group: "",
        accountStatus: "Active",
      });
      showToast({ type: "success", message: "Student created" });
    } catch (err: any) {
      showToast({ type: "error", message: err?.message || "Create failed" });
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (s: Student) => {
    setEditingId(s._id);
    setEditForm({
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      college: s.college || "",
      group: s.group || "",
      accountStatus: s.accountStatus || "Active",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/students/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error || "Unable to update student");
      }
      setStudents((prev) => prev.map((s) => (s._id === editingId ? body.student : s)));
      setEditingId(null);
      showToast({ type: "success", message: "Student updated" });
    } catch (err: any) {
      showToast({ type: "error", message: err?.message || "Update failed" });
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/students/${studentToDelete._id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error || "Delete failed");
      }
      setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
      if (editingId === studentToDelete._id) setEditingId(null);
      showToast({ type: "success", message: "Student deleted" });
      setStudentToDelete(null);
    } catch (err: any) {
      showToast({ type: "error", message: err?.message || "Delete failed" });
    } finally {
      setIsDeleting(false);
    }
  };

  const total = students.length;
  const active = students.filter((s) => s.accountStatus === "Active").length;
  const newest = students[0]?.name || "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          
          <div className="flex flex-wrap items-end gap-4 justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Student Management</h1>
              <p className="mt-2 text-slate-700">
                Curate admissions, keep records fresh, and keep every learner in sight.
              </p>
            </div>
            <button
              onClick={() => {
                const formEl = document.getElementById("create-student-card");
                formEl?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
            >
              <span>＋</span> Add student
            </button>
          </div>
        </header>

        {toast && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium shadow ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                : "bg-rose-50 text-rose-800 border border-rose-100"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatCard title="Total students" value={total} hint="Across all cohorts" />
          <StatCard title="Active" value={active} hint="Currently reachable" />
          <StatCard title="Most recent" value={newest} hint="Latest addition" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, email, college, group"
                    className="w-72 max-w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    aria-label="Search students"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    aria-label="Filter by status"
                  >
                    <option value="all">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <button
                  onClick={loadStudents}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-700 transition"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Students</h2>
                  <p className="text-sm text-slate-600">{filteredStudents.length} shown</p>
                </div>
                {loading && (
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    Loading…
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-slate-800">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Email</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">College / Group</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-6 text-center text-slate-600">
                          {loading ? "Loading students…" : "No students match your filters."}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-500">
                              Joined {formatDate(s.registrationDate || s.createdAt)}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div>{s.email}</div>
                            <div className="text-xs text-slate-500">{s.phone || "No phone"}</div>
                          </td>
                          <td className="px-5 py-4">
                            <StatusPill status={s.accountStatus || "Active"} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm text-slate-800">{s.college || "—"}</div>
                            <div className="text-xs text-slate-500">{s.group || "—"}</div>
                          </td>
                          <td className="px-5 py-4 text-right space-x-2">
                            <button
                              onClick={() => startEdit(s)}
                              className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setStudentToDelete(s)}
                              className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div
              id="create-student-card"
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Create student</h3>
                  <p className="text-sm text-slate-600">Add a fresh profile in seconds.</p>
                </div>
                {creating && <span className="text-xs text-slate-500">Saving…</span>}
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <Field label="Full name">
                  <input
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
                <Field label="Email">
                  <input
                    required
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
                <Field label="Password">
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Phone">
                    <input
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </Field>
                  <Field label="Group">
                    <input
                      value={createForm.group}
                      onChange={(e) => setCreateForm({ ...createForm, group: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </Field>
                </div>
                <Field label="College">
                  <input
                    value={createForm.college}
                    onChange={(e) => setCreateForm({ ...createForm, college: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={createForm.accountStatus}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, accountStatus: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                </Field>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold shadow-md shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-70"
                >
                  {creating ? "Creating…" : "Create student"}
                </button>
              </form>
            </div>

            {editingId && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Edit student</h3>
                    <p className="text-sm text-slate-600">
                      Update profile and keep records clean.
                    </p>
                  </div>
                  {updating && <span className="text-xs text-slate-500">Saving…</span>}
                </div>

                <form onSubmit={handleUpdate} className="space-y-3">
                  <Field label="Full name">
                    <input
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Phone">
                      <input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </Field>
                    <Field label="Group">
                      <input
                        value={editForm.group}
                        onChange={(e) => setEditForm({ ...editForm, group: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </Field>
                  </div>
                  <Field label="College">
                    <input
                      value={editForm.college}
                      onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={editForm.accountStatus}
                      onChange={(e) =>
                        setEditForm({ ...editForm, accountStatus: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Suspended</option>
                    </select>
                  </Field>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 rounded-lg bg-emerald-600 text-white py-2 font-semibold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition disabled:opacity-70"
                    >
                      {updating ? "Updating…" : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white py-2 font-semibold text-slate-700 hover:border-slate-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Modal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone and will remove all their records.`}
        variant="danger"
        confirmLabel="Delete Student"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

function StatCard({ title, value, hint }: { title: string; value: number | string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600">{hint}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-slate-700 space-y-1">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: string }) {
  const style = statusStyles[status] || statusStyles.Active;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

function formatDate(date?: string) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}