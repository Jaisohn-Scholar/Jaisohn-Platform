"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";

import { reviewerAlumniPageStyles } from "@/styles/pages/reviewer-alumni";
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
  published: boolean;
  user_id: string | null;
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
    <Suspense fallback={<div className={reviewerAlumniPageStyles.flex01}><Navbar /><div className={reviewerAlumniPageStyles.flextext02}>Loading...</div></div>}>
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
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

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

  async function togglePublish(alum: Alumni) {
    const next = !alum.published;
    await fetch(`/api/alumni/${alum.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: next }),
    });
    setAlumni((prev) => prev.map((a) => a.id === alum.id ? { ...a, published: next } : a));
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteMsg("");
    setInviteSending(true);
    try {
      const res = await fetch("/api/alumni/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      });
      if (res.ok) {
        setInviteMsg("Invitation sent!");
        setInviteEmail("");
        setInviteName("");
      } else {
        const data = await res.json();
        setInviteMsg(data.error || "Failed to send.");
      }
    } finally {
      setInviteSending(false);
    }
  }

  const filtered = alumni.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const published = filtered.filter((a) => a.published);
  const pending = filtered.filter((a) => !a.published);

  if (loading) {
    return (
      <div className={reviewerAlumniPageStyles.flex01}>
        <Navbar />
        <div className={reviewerAlumniPageStyles.flextext02}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={reviewerAlumniPageStyles.flex03}>
      <Navbar />
      <div className={reviewerAlumniPageStyles.className04}>
        <div className={reviewerAlumniPageStyles.flex05}>
          <div>
            <Link href="/reviewer" className={reviewerAlumniPageStyles.text06}>← Back to Reviewer Portal</Link>
            <h1 className={reviewerAlumniPageStyles.text07}>Manage Alumni Profiles</h1>
          </div>
          <div className={reviewerAlumniPageStyles.flex08}>
            <button
              onClick={() => { setShowInviteModal(true); setInviteMsg(""); }}
              className={reviewerAlumniPageStyles.text09}
            >
              Invite Alumni
            </button>
            <button
              onClick={openAdd}
              className={reviewerAlumniPageStyles.text10}
            >
              + Add New Alumni
            </button>
          </div>
        </div>

        <div className={reviewerAlumniPageStyles.className11}>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={reviewerAlumniPageStyles.text12}
          />
        </div>

        {/* Pending review */}
        {pending.length > 0 && (
          <div className={reviewerAlumniPageStyles.className13}>
            <h2 className={reviewerAlumniPageStyles.text14}>Pending Review ({pending.length})</h2>
            <div className={reviewerAlumniPageStyles.grid15}>
              {pending.map((alum) => (
                <AlumCard key={alum.id} alum={alum} onEdit={openEdit} onDelete={handleDelete} onTogglePublish={togglePublish} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className={reviewerAlumniPageStyles.text14}>Published ({published.length})</h2>
          {published.length === 0 ? (
            <div className={reviewerAlumniPageStyles.whitetext16}>
              <p className={reviewerAlumniPageStyles.text17}>🎓</p>
              <p>No published alumni yet.</p>
            </div>
          ) : (
            <div className={reviewerAlumniPageStyles.grid15}>
              {published.map((alum) => (
                <AlumCard key={alum.id} alum={alum} onEdit={openEdit} onDelete={handleDelete} onTogglePublish={togglePublish} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className={reviewerAlumniPageStyles.fixedflex18}>
          <div className={reviewerAlumniPageStyles.white19}>
            <div className={reviewerAlumniPageStyles.className20}>
              <h2 className={reviewerAlumniPageStyles.text21}>
                {editId ? "Edit Alumni Profile" : "Add Alumni Profile"}
              </h2>
              <form onSubmit={handleSubmit} className={reviewerAlumniPageStyles.className22}>
                <div>
                  <label className={reviewerAlumniPageStyles.text23}>Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={reviewerAlumniPageStyles.text24}
                  />
                </div>
                <div>
                  <label className={reviewerAlumniPageStyles.text23}>Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={reviewerAlumniPageStyles.text24}
                  >
                    <option value="Scholar">Scholar</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className={reviewerAlumniPageStyles.text23}>Opportunity Name *</label>
                  <input
                    required
                    value={form.opportunityName}
                    onChange={(e) => setForm({ ...form, opportunityName: e.target.value })}
                    className={reviewerAlumniPageStyles.text24}
                  />
                </div>
                <div className={reviewerAlumniPageStyles.grid25}>
                  <div>
                    <label className={reviewerAlumniPageStyles.text23}>University</label>
                    <input
                      value={form.university}
                      onChange={(e) => setForm({ ...form, university: e.target.value })}
                      className={reviewerAlumniPageStyles.text24}
                    />
                  </div>
                  <div>
                    <label className={reviewerAlumniPageStyles.text23}>Year</label>
                    <input
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className={reviewerAlumniPageStyles.text24}
                    />
                  </div>
                </div>
                <div>
                  <label className={reviewerAlumniPageStyles.text23}>Major</label>
                  <input
                    value={form.major}
                    onChange={(e) => setForm({ ...form, major: e.target.value })}
                    className={reviewerAlumniPageStyles.text24}
                  />
                </div>
                <div>
                  <label className={reviewerAlumniPageStyles.text23}>Project Description</label>
                  <textarea
                    rows={3}
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    className={reviewerAlumniPageStyles.text24}
                  />
                </div>
                <div>
                  <label className={reviewerAlumniPageStyles.text23}>Quote</label>
                  <textarea
                    rows={2}
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                    className={reviewerAlumniPageStyles.text24}
                  />
                </div>
                <div>
                  <label className={reviewerAlumniPageStyles.text23}>Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className={reviewerAlumniPageStyles.text26}
                  />
                </div>
                <div className={reviewerAlumniPageStyles.flex27}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={reviewerAlumniPageStyles.text28}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={reviewerAlumniPageStyles.text29}
                  >
                    {saving ? "Saving..." : editId ? "Save Changes" : "Add Alumni"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className={reviewerAlumniPageStyles.fixedflex18}>
          <div className={reviewerAlumniPageStyles.white30}>
            <h2 className={reviewerAlumniPageStyles.text21}>Invite Alumni</h2>
            <p className={reviewerAlumniPageStyles.text31}>
              Send an email inviting a former scholar or intern to create an account and submit their alumni profile.
            </p>
            <form onSubmit={handleInvite} className={reviewerAlumniPageStyles.className32}>
              <div>
                <label className={reviewerAlumniPageStyles.text23}>Name (optional)</label>
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Alumni's name"
                  className={reviewerAlumniPageStyles.text24}
                />
              </div>
              <div>
                <label className={reviewerAlumniPageStyles.text23}>Email *</label>
                <input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="alumni@example.com"
                  className={reviewerAlumniPageStyles.text24}
                />
              </div>
              {inviteMsg && (
                <p className={`${reviewerAlumniPageStyles.inviteMessage} ${inviteMsg === "Invitation sent!" ? reviewerAlumniPageStyles.inviteMessageSuccess : reviewerAlumniPageStyles.inviteMessageError}`}>
                  {inviteMsg}
                </p>
              )}
              <div className={reviewerAlumniPageStyles.flex33}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className={reviewerAlumniPageStyles.text34}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={inviteSending}
                  className={reviewerAlumniPageStyles.text35}
                >
                  {inviteSending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AlumCard({
  alum,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  alum: Alumni;
  onEdit: (a: Alumni) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (a: Alumni) => void;
}) {
  return (
    <div className={reviewerAlumniPageStyles.white36}>
      <div className={reviewerAlumniPageStyles.flextext37}>
        {alum.photo_path ? (
          <img src={alum.photo_path} alt={alum.name} className={reviewerAlumniPageStyles.className38} />
        ) : "👤"}
        {!alum.published && (
          <span className={reviewerAlumniPageStyles.text39}>
            Pending
          </span>
        )}
      </div>
      <div className={reviewerAlumniPageStyles.className40}>
        <div className={reviewerAlumniPageStyles.flex41}>
          <h3 className={reviewerAlumniPageStyles.text42}>{alum.name}</h3>
          <span className={reviewerAlumniPageStyles.text43}>{alum.type}</span>
        </div>
        <p className={reviewerAlumniPageStyles.text44}>{alum.opportunity_name}</p>
        {alum.university && <p className={reviewerAlumniPageStyles.text45}>{alum.university}</p>}
        <div className={reviewerAlumniPageStyles.flex46}>
          <button
            onClick={() => onTogglePublish(alum)}
            className={`${reviewerAlumniPageStyles.publishButton} ${alum.published ? reviewerAlumniPageStyles.publishButtonPublished : reviewerAlumniPageStyles.publishButtonDraft}`}
          >
            {alum.published ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={() => onEdit(alum)}
            className={reviewerAlumniPageStyles.text47}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(alum.id)}
            className={reviewerAlumniPageStyles.text48}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
