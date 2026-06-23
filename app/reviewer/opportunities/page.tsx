"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

interface Opportunity {
  id: string;
  type: string;
  name: string;
  description: string;
  award: string | null;
  slots: number;
  requirements: string | null;
  deadline: string | null;
  accepted_count: number;
}

const EMPTY_FORM = {
  type: "scholarship",
  name: "",
  description: "",
  award: "",
  slots: "1",
  requirements: "",
  deadline: "",
};

export default function ReviewerOpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const user = session.user as any;
      if (user.role !== "reviewer") { router.push("/portal"); return; }
      loadOpportunities();
    }
  }, [status]);

  async function loadOpportunities() {
    const res = await fetch("/api/opportunities");
    setOpportunities(await res.json());
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  }

  function openEdit(opp: Opportunity) {
    setEditId(opp.id);
    setForm({
      type: opp.type,
      name: opp.name,
      description: opp.description,
      award: opp.award || "",
      slots: String(opp.slots),
      requirements: opp.requirements || "",
      deadline: opp.deadline || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, slots: parseInt(form.slots) || 1 };
      if (editId) {
        await fetch(`/api/opportunities/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/opportunities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      await loadOpportunities();
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this opportunity? This cannot be undone.")) return;
    await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
  }

  const scholarships = opportunities.filter((o) => o.type === "scholarship");
  const internships = opportunities.filter((o) => o.type === "internship");

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
            <h1 className="text-3xl font-bold text-[#101661]">Manage Opportunities</h1>
            <p className="text-gray-500 text-sm mt-1">Create, edit, and delete scholarships and internships shown on the public page.</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-md transition-colors"
          >
            + Add Opportunity
          </button>
        </div>

        {/* Scholarships section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold text-[#101661]">🎓 Scholarships</h2>
            <span className="text-sm text-gray-400">{scholarships.length} total</span>
          </div>
          {scholarships.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No scholarships yet.</div>
          ) : (
            <div className="space-y-3">
              {scholarships.map((opp) => <OppRow key={opp.id} opp={opp} onEdit={openEdit} onDelete={handleDelete} />)}
            </div>
          )}
        </div>

        {/* Internships section */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold text-[#101661]">💼 Internships</h2>
            <span className="text-sm text-gray-400">{internships.length} total</span>
          </div>
          {internships.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No internships yet.</div>
          ) : (
            <div className="space-y-3">
              {internships.map((opp) => <OppRow key={opp.id} opp={opp} onEdit={openEdit} onDelete={handleDelete} />)}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#101661] mb-4">
                {editId ? "Edit Opportunity" : "Add Opportunity"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  >
                    <option value="scholarship">Scholarship</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Award Amount</label>
                    <input
                      placeholder="e.g. $2,000"
                      value={form.award}
                      onChange={(e) => setForm({ ...form, award: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slots / Recipients</label>
                    <input
                      type="number"
                      min="1"
                      value={form.slots}
                      onChange={(e) => setForm({ ...form, slots: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea
                    rows={2}
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    placeholder="e.g. March 31, 2026"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
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
                    {saving ? "Saving..." : editId ? "Save Changes" : "Add Opportunity"}
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

function OppRow({ opp, onEdit, onDelete }: { opp: Opportunity; onEdit: (o: Opportunity) => void; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-[#101661]">{opp.name}</h3>
          {opp.award && <span className="text-green-700 text-sm font-medium">{opp.award}</span>}
        </div>
        <p className="text-gray-500 text-sm mb-1 line-clamp-2">{opp.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 items-center">
          {opp.deadline && <span>Deadline: {opp.deadline}</span>}
          <span>{opp.accepted_count}/{opp.slots} spot{opp.slots !== 1 ? "s" : ""} filled</span>
          {opp.accepted_count >= opp.slots && (
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">All Filled</span>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onEdit(opp)}
          className="text-sm border border-[#101661] text-[#101661] hover:bg-[#101661] hover:text-white px-3 py-1.5 rounded-md transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(opp.id)}
          className="text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
