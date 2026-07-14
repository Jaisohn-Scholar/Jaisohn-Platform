"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

import { reviewerOpportunitiesPageStyles } from "@/styles/pages/reviewer-opportunities";
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
    <div className={reviewerOpportunitiesPageStyles.flex01}><Navbar />
      <div className={reviewerOpportunitiesPageStyles.flextext02}>Loading...</div>
    </div>
  );

  return (
    <div className={reviewerOpportunitiesPageStyles.flex03}>
      <Navbar />
      <div className={reviewerOpportunitiesPageStyles.className04}>
        <div className={reviewerOpportunitiesPageStyles.flex05}>
          <div>
            <Link href="/reviewer" className={reviewerOpportunitiesPageStyles.text06}>← Back to Reviewer Portal</Link>
            <h1 className={reviewerOpportunitiesPageStyles.text07}>Manage Opportunities</h1>
            <p className={reviewerOpportunitiesPageStyles.text08}>Create, edit, and configure application forms for scholarships and internships.</p>
          </div>
          <button onClick={openAdd} className={reviewerOpportunitiesPageStyles.text09}>
            + Add Opportunity
          </button>
        </div>

        <div className={reviewerOpportunitiesPageStyles.className10}>
          <div className={reviewerOpportunitiesPageStyles.flex11}>
            <h2 className={reviewerOpportunitiesPageStyles.text12}>🎓 Scholarships</h2>
            <span className={reviewerOpportunitiesPageStyles.text13}>{scholarships.length} total</span>
          </div>
          {scholarships.length === 0
            ? <div className={reviewerOpportunitiesPageStyles.whitetext14}>No scholarships yet.</div>
            : <div className={reviewerOpportunitiesPageStyles.className15}>{scholarships.map(opp => <OppRow key={opp.id} opp={opp} onEdit={openEdit} onDelete={handleDelete} />)}</div>}
        </div>

        <div>
          <div className={reviewerOpportunitiesPageStyles.flex11}>
            <h2 className={reviewerOpportunitiesPageStyles.text12}>💼 Internships</h2>
            <span className={reviewerOpportunitiesPageStyles.text13}>{internships.length} total</span>
          </div>
          {internships.length === 0
            ? <div className={reviewerOpportunitiesPageStyles.whitetext14}>No internships yet.</div>
            : <div className={reviewerOpportunitiesPageStyles.className15}>{internships.map(opp => <OppRow key={opp.id} opp={opp} onEdit={openEdit} onDelete={handleDelete} />)}</div>}
        </div>
      </div>

      {showModal && (
        <div className={reviewerOpportunitiesPageStyles.fixedflex16}>
          <div className={reviewerOpportunitiesPageStyles.flexwhite17}>
            {/* Modal header */}
            <div className={reviewerOpportunitiesPageStyles.className18}>
              <h2 className={reviewerOpportunitiesPageStyles.text19}>
                {editId ? "Edit Opportunity" : "Add Opportunity"}
              </h2>
              <div className={reviewerOpportunitiesPageStyles.flex20}>
                {(["details", "form"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${reviewerOpportunitiesPageStyles.modalTab} ${activeTab === tab ? reviewerOpportunitiesPageStyles.modalTabActive : reviewerOpportunitiesPageStyles.modalTabInactive}`}
                  >
                    {tab === "details" ? "Details" : "Application Form"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div className={reviewerOpportunitiesPageStyles.className21}>
              {activeTab === "details" ? (
                <div className={reviewerOpportunitiesPageStyles.className22}>
                  <div>
                    <label className={reviewerOpportunitiesPageStyles.text23}>Type *</label>
                    <select value={details.type} onChange={e => setDetails({...details, type: e.target.value})}
                      className={reviewerOpportunitiesPageStyles.text24}>
                      <option value="scholarship">Scholarship</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className={reviewerOpportunitiesPageStyles.text23}>Name *</label>
                    <input required value={details.name} onChange={e => setDetails({...details, name: e.target.value})}
                      className={reviewerOpportunitiesPageStyles.text24} />
                  </div>
                  <div>
                    <label className={reviewerOpportunitiesPageStyles.text23}>Description *</label>
                    <textarea required rows={3} value={details.description} onChange={e => setDetails({...details, description: e.target.value})}
                      className={reviewerOpportunitiesPageStyles.text24} />
                  </div>
                  <div className={reviewerOpportunitiesPageStyles.grid25}>
                    <div>
                      <label className={reviewerOpportunitiesPageStyles.text23}>Award Amount</label>
                      <input placeholder="e.g. $2,000" value={details.award} onChange={e => setDetails({...details, award: e.target.value})}
                        className={reviewerOpportunitiesPageStyles.text24} />
                    </div>
                    <div>
                      <label className={reviewerOpportunitiesPageStyles.text23}>Recipients</label>
                      <input type="number" min="1" value={details.slots} onChange={e => setDetails({...details, slots: e.target.value})}
                        className={reviewerOpportunitiesPageStyles.text24} />
                    </div>
                  </div>
                  <div>
                    <label className={reviewerOpportunitiesPageStyles.text23}>Eligibility Requirements</label>
                    <textarea rows={2} value={details.requirements} onChange={e => setDetails({...details, requirements: e.target.value})}
                      className={reviewerOpportunitiesPageStyles.text24} />
                  </div>
                  <div>
                    <label className={reviewerOpportunitiesPageStyles.text23}>Deadline</label>
                    <input placeholder="e.g. March 31, 2026" value={details.deadline} onChange={e => setDetails({...details, deadline: e.target.value})}
                      className={reviewerOpportunitiesPageStyles.text24} />
                  </div>
                </div>
              ) : (
                <div className={reviewerOpportunitiesPageStyles.className26}>
                  {/* Personal Info Fields */}
                  <div>
                    <h3 className={reviewerOpportunitiesPageStyles.text27}>Required Personal Information</h3>
                    <p className={reviewerOpportunitiesPageStyles.text28}>Check the fields applicants must fill out.</p>
                    <div className={reviewerOpportunitiesPageStyles.grid29}>
                      {ALL_FIELDS.map(f => (
                        <label key={f.key} className={reviewerOpportunitiesPageStyles.flex30}>
                          <input type="checkbox" checked={reqFields.includes(f.key)} onChange={() => toggleField(f.key)}
                            className={reviewerOpportunitiesPageStyles.className31} />
                          <span className={reviewerOpportunitiesPageStyles.text32}>{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div>
                    <h3 className={reviewerOpportunitiesPageStyles.text27}>Required Documents</h3>
                    <p className={reviewerOpportunitiesPageStyles.text28}>Check the documents applicants must upload.</p>
                    <div className={reviewerOpportunitiesPageStyles.grid29}>
                      {ALL_DOCS.map(d => (
                        <label key={d.key} className={reviewerOpportunitiesPageStyles.flex30}>
                          <input type="checkbox" checked={reqDocs.includes(d.key)} onChange={() => toggleDoc(d.key)}
                            className={reviewerOpportunitiesPageStyles.className31} />
                          <span className={reviewerOpportunitiesPageStyles.text32}>{d.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Essay Questions */}
                  <div>
                    <h3 className={reviewerOpportunitiesPageStyles.text27}>Essay Questions</h3>
                    <p className={reviewerOpportunitiesPageStyles.text28}>Enable up to 3 essay questions and customize the prompts.</p>
                    <div className={reviewerOpportunitiesPageStyles.className15}>
                      {([0, 1, 2] as const).map(i => (
                        <div key={i} className={`${reviewerOpportunitiesPageStyles.essayCard} ${essayEnabled[i] ? reviewerOpportunitiesPageStyles.essayCardActive : reviewerOpportunitiesPageStyles.essayCardInactive}`}>
                          <div className={reviewerOpportunitiesPageStyles.flex33}>
                            <label className={reviewerOpportunitiesPageStyles.flex34}>
                              <input type="checkbox" checked={essayEnabled[i]} onChange={() => toggleEssay(i)}
                                className={reviewerOpportunitiesPageStyles.className35} />
                              <span className={reviewerOpportunitiesPageStyles.text36}>Essay {i + 1}</span>
                            </label>
                          </div>
                          {essayEnabled[i] && (
                            <textarea
                              rows={3}
                              value={essays[i]}
                              onChange={e => { const next = [...essays] as [string,string,string]; next[i] = e.target.value; setEssays(next); }}
                              placeholder={`Essay ${i + 1} prompt...`}
                              className={reviewerOpportunitiesPageStyles.whitetext37}
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
            <div className={reviewerOpportunitiesPageStyles.flex38}>
              <button onClick={() => setShowModal(false)}
                className={reviewerOpportunitiesPageStyles.text39}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !details.name || !details.description}
                className={reviewerOpportunitiesPageStyles.text40}>
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
    <div className={reviewerOpportunitiesPageStyles.flexwhite41}>
      <div className={reviewerOpportunitiesPageStyles.className42}>
        <div className={reviewerOpportunitiesPageStyles.flex43}>
          <h3 className={reviewerOpportunitiesPageStyles.text44}>{opp.name}</h3>
          {opp.award && <span className={reviewerOpportunitiesPageStyles.text45}>{opp.award}</span>}
        </div>
        <p className={reviewerOpportunitiesPageStyles.text46}>{opp.description}</p>
        <div className={reviewerOpportunitiesPageStyles.flextext47}>
          {opp.deadline && <span>Deadline: {opp.deadline}</span>}
          <span>{opp.accepted_count}/{opp.slots} spot{opp.slots !== 1 ? "s" : ""} filled</span>
          {opp.accepted_count >= opp.slots && <span className={reviewerOpportunitiesPageStyles.text48}>All Filled</span>}
        </div>
      </div>
      <div className={reviewerOpportunitiesPageStyles.flex49}>
        <button onClick={() => onEdit(opp)}
          className={reviewerOpportunitiesPageStyles.text50}>
          Manage
        </button>
        <button onClick={() => onDelete(opp.id)}
          className={reviewerOpportunitiesPageStyles.text51}>
          Delete
        </button>
      </div>
    </div>
  );
}
