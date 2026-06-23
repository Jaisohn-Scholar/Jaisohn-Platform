"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";

interface Alumni {
  id: string;
  name: string;
  type: string;
  opportunity_name: string;
  university: string | null;
  major: string | null;
  year: string | null;
  photo_path: string | null;
  project: string | null;
  quote: string | null;
}

const EMPTY_FORM = {
  name: "",
  type: "Scholar",
  opportunityName: "",
  university: "",
  major: "",
  year: "",
  project: "",
  quote: "",
};

export default function ReviewerAlumniPage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen"><Navbar /><div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div></div>}>
      <ReviewerAlumniContent />
    </Suspense>
  );
}

function ReviewerAlumniContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const user = session.user as any;
      if (user.role !== "reviewer") { router.push("/portal"); return; }
      loadAlumni();
    }
  }, [status]);

  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam && alumni.length > 0) {
      const found = alumni.find((a) => a.id === editParam);
      if (found) openEdit(found);
    }
  }, [searchParams, alumni]);

  async function loadAlumni() {
    const res = await fetch("/api/alumni");
    setAlumni(await res.json());
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setPhotoFile(null);
    setShowModal(true);
  }

  function openEdit(alum: Alumni) {
    setEditId(alum.id);
    setForm({
      name: alum.name,
      type: alum.type,
      opportunityName: alum.opportunity_name,
      university: alum.university || "",
      major: alum.major || "",
      year: alum.year || "",
      project: alum.project || "",
      quote: alum.quote || "",
    });
    setPhotoFile(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let id = editId;
      if (editId) {
        await fetch(`/api/alumni/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        const res = await fetch("/api/alumni", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        id = data.id;
      }
      if (photoFile && id) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        await fetch(`/api/alumni/${id}/upload`, { method: "POST", body: fd });
      }
      await loadAlumni();
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this alumni profile?")) return;
    await fetch(`/api/alumni/${id}`, { method: "DELETE" });
    setAlumni((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/reviewer" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">← Back to Reviewer Portal</Link>
            <h1 className="text-3xl font-bold text-[#101661]">Manage Alumni Profiles</h1>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-md transition-colors"
          >
            + Add New Alumni
          </button>
        </div>

        {alumni.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
            <p className="text-5xl mb-4">🎓</p>
            <p>No alumni profiles yet. Add the first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((alum) => (
              <div key={alum.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-4xl">
                  {alum.photo_path ? (
                    <img src={alum.photo_path} alt={alum.name} className="w-full h-full object-cover" />
                  ) : "👤"}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[#101661]">{alum.name}</h3>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{alum.type}</span>
                  </div>
                  <p className="text-[#b51f1f] text-sm mb-1">{alum.opportunity_name}</p>
                  {alum.university && <p className="text-gray-500 text-xs">{alum.university}</p>}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(alum)}
                      className="flex-1 text-sm border border-[#101661] text-[#101661] hover:bg-[#101661] hover:text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(alum.id)}
                      className="flex-1 text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#101661] mb-4">
                {editId ? "Edit Alumni Profile" : "Add Alumni Profile"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  >
                    <option value="Scholar">Scholar</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Name *</label>
                  <input
                    required
                    value={form.opportunityName}
                    onChange={(e) => setForm({ ...form, opportunityName: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                    <input
                      value={form.university}
                      onChange={(e) => setForm({ ...form, university: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                  <input
                    value={form.major}
                    onChange={(e) => setForm({ ...form, major: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                  <textarea
                    rows={3}
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                  <textarea
                    rows={2}
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#101661] file:text-white hover:file:bg-blue-900"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editId ? "Save Changes" : "Add Alumni"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
