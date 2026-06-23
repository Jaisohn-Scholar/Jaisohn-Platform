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
  required_fields: string | null;
  required_docs: string | null;
  essay1_prompt: string | null;
  essay2_prompt: string | null;
  essay3_prompt: string | null;
}

const EMPTY_DETAILS = {
  type: "scholarship", name: "", description: "", award: "", slots: "1", requirements: "", deadline: "",
};

const ALL_FIELDS = [
  { key: "name", label: "Full Name" },
  { key: "email", label: "Email Address" },
  { key: "school", label: "School / University" },
  { key: "year", label: "Year / Grade Level" },
  { key: "birthday", label: "Date of Birth" },
];

const ALL_DOCS = [
  { key: "resume", label: "Resume" },
  { key: "cover_letter", label: "Cover Letter" },
  { key: "transcript", label: "Transcript" },
  { key: "rec_letter", label: "Letter of Recommendation" },
  { key: "financial_need", label: "Proof of Financial Need" },
  { key: "supporting_docs", label: "Supporting Documents" },
];

const DEFAULT_PROMPTS = [
  "Tell us about yourself and why you are interested in this opportunity.",
  "Describe a time you demonstrated leadership or made an impact in your community.",
  "What are your future goals and how will this opportunity help you achieve them?",
];

function parseJson(val: string | null, fallback: string[]): string[] {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

export default function ReviewerOpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "form">("details");

  // Details tab state
  const [details, setDetails] = useState({ ...EMPTY_DETAILS });

  // Application form tab state
  const [reqFields, setReqFields] = useState<string[]>(ALL_FIELDS.map(f => f.key));
  const [reqDocs, setReqDocs] = useState<string[]>(["resume", "transcript"]);
  const [essays, setEssays] = useState<[string, string, string]>([DEFAULT_PROMPTS[0], DEFAULT_PROMPTS[1], DEFAULT_PROMPTS[2]]);
  const [essayEnabled, setEssayEnabled] = useState<[boolean, boolean, boolean]>([true, true, true]);

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
    setDetails({ ...EMPTY_DETAILS });
    setReqFields(ALL_FIELDS.map(f => f.key));
    setReqDocs(["resume", "transcript"]);
    setEssays([DEFAULT_PROMPTS[0], DEFAULT_PROMPTS[1], DEFAULT_PROMPTS[2]]);
    setEssayEnabled([true, true, true]);
    setActiveTab("details");
    setShowModal(true);
  }

  function openEdit(opp: Opportunity) {
    setEditId(opp.id);
    setDetails({
      type: opp.type, name: opp.name, description: opp.description,
      award: opp.award || "", slots: String(opp.slots),
      requirements: opp.requirements || "", deadline: opp.deadline || "",
    });
    const rf = parseJson(opp.required_fields, ALL_FIELDS.map(f => f.key));
    const rd = parseJson(opp.required_docs, ["resume", "transcript"]);
    setReqFields(rf);
    setReqDocs(rd);
    const p1 = opp.essay1_prompt || DEFAULT_PROMPTS[0];
    const p2 = opp.essay2_prompt || DEFAULT_PROMPTS[1];
    const p3 = opp.essay3_prompt || DEFAULT_PROMPTS[2];
    setEssays([p1, p2, p3]);
    setEssayEnabled([!!opp.essay1_prompt, !!opp.essay2_prompt, !!opp.essay3_prompt]);
    setActiveTab("details");
    setShowModal(true);
  }

  function toggleField(key: string) {
    setReqFields(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }
  function toggleDoc(key: string) {
    setReqDocs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }
  function toggleEssay(i: number) {
    setEssayEnabled(prev => { const next = [...prev] as [boolean,boolean,boolean]; next[i] = !next[i]; return next; });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        ...details,
        slots: parseInt(details.slots) || 1,
        required_fields: reqFields,
        required_docs: reqDocs,
        essay1_prompt: essayEnabled[0] ? essays[0] : null,
        essay2_prompt: essayEnabled[1] ? essays[1] : null,
        essay3_prompt: essayEnabled[2] ? essays[2] : null,
      };
      if (editId) {
        await fetch(`/api/opportunities/${editId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/opportunities", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
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
    setOpportunities(prev => prev.filter(o => o.id !== id));
  }

  const scholarships = opportunities.filter(o => o.type === "scholarship");
  const internships = opportunities.filter(o => o.type === "internship");

  if (loading) return (
    <div className="flex flex-col min-h-screen"><Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/reviewer" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">← Back to Reviewer Portal</Link>
            <h1 className="text-3xl font-bold text-[#101661]">Manage Opportunities</h1>
            <p className="text-gray-500 text-sm mt-1">Create, edit, and configure application forms for scholarships and internships.</p>
          </div>
          <button onClick={openAdd} className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-md transition-colors">
            + Add Opportunity
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold text-[#101661]">🎓 Scholarships</h2>
            <span className="text-sm text-gray-400">{scholarships.length} total</span>
          </div>
          {scholarships.length === 0
            ? <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No scholarships yet.</div>
            : <div className="space-y-3">{scholarships.map(opp => <OppRow key={opp.id} opp={opp} onEdit={openEdit} onDelete={handleDelete} />)}</div>}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold text-[#101661]">💼 Internships</h2>
            <span className="text-sm text-gray-400">{internships.length} total</span>
          </div>
          {internships.length === 0
            ? <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No internships yet.</div>
            : <div className="space-y-3">{internships.map(opp => <OppRow key={opp.id} opp={opp} onEdit={openEdit} onDelete={handleDelete} />)}</div>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="px-6 pt-6 pb-0">
              <h2 className="text-xl font-bold text-[#101661] mb-4">
                {editId ? "Edit Opportunity" : "Add Opportunity"}
              </h2>
              <div className="flex border-b border-gray-200">
                {(["details", "form"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-[#101661] text-[#101661]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab === "details" ? "Details" : "Application Form"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {activeTab === "details" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select value={details.type} onChange={e => setDetails({...details, type: e.target.value})}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]">
                      <option value="scholarship">Scholarship</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input required value={details.name} onChange={e => setDetails({...details, name: e.target.value})}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea required rows={3} value={details.description} onChange={e => setDetails({...details, description: e.target.value})}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Award Amount</label>
                      <input placeholder="e.g. $2,000" value={details.award} onChange={e => setDetails({...details, award: e.target.value})}
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                      <input type="number" min="1" value={details.slots} onChange={e => setDetails({...details, slots: e.target.value})}
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Requirements</label>
                    <textarea rows={2} value={details.requirements} onChange={e => setDetails({...details, requirements: e.target.value})}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input placeholder="e.g. March 31, 2026" value={details.deadline} onChange={e => setDetails({...details, deadline: e.target.value})}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Personal Info Fields */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#101661] mb-1">Required Personal Information</h3>
                    <p className="text-xs text-gray-400 mb-3">Check the fields applicants must fill out.</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_FIELDS.map(f => (
                        <label key={f.key} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" checked={reqFields.includes(f.key)} onChange={() => toggleField(f.key)}
                            className="w-4 h-4 accent-[#101661] cursor-pointer" />
                          <span className="text-sm text-gray-700">{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#101661] mb-1">Required Documents</h3>
                    <p className="text-xs text-gray-400 mb-3">Check the documents applicants must upload.</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_DOCS.map(d => (
                        <label key={d.key} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" checked={reqDocs.includes(d.key)} onChange={() => toggleDoc(d.key)}
                            className="w-4 h-4 accent-[#101661] cursor-pointer" />
                          <span className="text-sm text-gray-700">{d.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Essay Questions */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#101661] mb-1">Essay Questions</h3>
                    <p className="text-xs text-gray-400 mb-3">Enable up to 3 essay questions and customize the prompts.</p>
                    <div className="space-y-3">
                      {([0, 1, 2] as const).map(i => (
                        <div key={i} className={`border rounded-lg p-4 transition-colors ${essayEnabled[i] ? "border-[#101661]/30 bg-blue-50/30" : "border-gray-100 bg-gray-50"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={essayEnabled[i]} onChange={() => toggleEssay(i)}
                                className="w-4 h-4 accent-[#101661]" />
                              <span className="text-sm font-medium text-gray-700">Essay {i + 1}</span>
                            </label>
                          </div>
                          {essayEnabled[i] && (
                            <textarea
                              rows={3}
                              value={essays[i]}
                              onChange={e => { const next = [...essays] as [string,string,string]; next[i] = e.target.value; setEssays(next); }}
                              placeholder={`Essay ${i + 1} prompt...`}
                              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] bg-white"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-md text-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !details.name || !details.description}
                className="flex-1 bg-[#101661] hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editId ? "Save Changes" : "Add Opportunity"}
              </button>
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
          {opp.accepted_count >= opp.slots && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">All Filled</span>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => onEdit(opp)}
          className="text-sm border border-[#101661] text-[#101661] hover:bg-[#101661] hover:text-white px-3 py-1.5 rounded-md transition-colors">
          Manage
        </button>
        <button onClick={() => onDelete(opp.id)}
          className="text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
}
