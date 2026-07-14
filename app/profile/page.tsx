"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

import { profilePageStyles } from "@/styles/pages/profile";
const EMPTY_ALUMNI = {
  type: "Scholar",
  opportunityName: "",
  university: "",
  major: "",
  year: "",
  project: "",
  quote: "",
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const [emailEdit, setEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [alumniForm, setAlumniForm] = useState({ ...EMPTY_ALUMNI });
  const [alumniPhoto, setAlumniPhoto] = useState<File | null>(null);
  const [alumniSaving, setAlumniSaving] = useState(false);
  const [alumniSuccess, setAlumniSuccess] = useState(false);
  const [alumniError, setAlumniError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This will permanently remove all your data and applications. This cannot be undone.")) return;
    if (!confirm("Final confirmation: delete your account permanently?")) return;
    await fetch("/api/account", { method: "DELETE" });
    await signOut({ callbackUrl: "/" });
  }

  async function handleEmailSave() {
    setEmailError("");
    setEmailSuccess(false);
    if (!newEmail.includes("@")) { setEmailError("Enter a valid email address."); return; }
    setEmailSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEmailError(data.error || "Failed to update email.");
        return;
      }
      await update({ email: newEmail });
      setEmailSuccess(true);
      setEmailEdit(false);
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleAlumniSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlumniError("");
    setAlumniSuccess(false);
    setAlumniSaving(true);
    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user?.name, ...alumniForm }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAlumniError(data.error || "Failed to submit.");
        return;
      }
      const created = await res.json();
      if (alumniPhoto && created.id) {
        const fd = new FormData();
        fd.append("photo", alumniPhoto);
        await fetch(`/api/alumni/${created.id}/upload`, { method: "POST", body: fd });
      }
      setAlumniSuccess(true);
      setAlumniForm({ ...EMPTY_ALUMNI });
      setAlumniPhoto(null);
    } finally {
      setAlumniSaving(false);
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className={profilePageStyles.flex01}><Navbar />
        <div className={profilePageStyles.flextext02}>Loading...</div>
      </div>
    );
  }

  const portalHref = user?.role === "reviewer" ? "/reviewer" : "/portal";
  const portalLabel = user?.role === "reviewer" ? "Reviewer Portal" : "My Applications";

  return (
    <div className={profilePageStyles.flex03}>
      <Navbar />
      <div className={profilePageStyles.className04}>
        <Link href={portalHref} className={profilePageStyles.text05}>← Back to {portalLabel}</Link>

        <div className={profilePageStyles.white06}>
          <div className={profilePageStyles.flex07}>
            <div className={profilePageStyles.flextext08}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className={profilePageStyles.text09}>{user?.name || "—"}</h1>
              <p className={profilePageStyles.text10}>{user?.email}</p>
              <span className={profilePageStyles.text11}>
                {user?.role || "applicant"}
              </span>
            </div>
          </div>
          <div className={profilePageStyles.className12}>
            <div className={profilePageStyles.flex13}>
              <span className={profilePageStyles.text14}>Full Name</span>
              <span className={profilePageStyles.text15}>{user?.name || "—"}</span>
            </div>
            <div className={profilePageStyles.className16}>
              <div className={profilePageStyles.flex17}>
                <span className={profilePageStyles.text14}>Email Address</span>
                {!emailEdit && (
                  <button
                    onClick={() => { setEmailEdit(true); setNewEmail(user?.email || ""); setEmailError(""); setEmailSuccess(false); }}
                    className={profilePageStyles.text18}
                  >
                    Edit
                  </button>
                )}
              </div>
              {emailEdit ? (
                <div className={profilePageStyles.className19}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={profilePageStyles.text20}
                  />
                  {emailError && <p className={profilePageStyles.text21}>{emailError}</p>}
                  <div className={profilePageStyles.flex22}>
                    <button
                      onClick={handleEmailSave}
                      disabled={emailSaving}
                      className={profilePageStyles.text23}
                    >
                      {emailSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => { setEmailEdit(false); setEmailError(""); }}
                      className={profilePageStyles.text24}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className={profilePageStyles.text25}>{user?.email}</p>
              )}
              {emailSuccess && <p className={profilePageStyles.text26}>Email updated successfully.</p>}
            </div>
            <div className={profilePageStyles.flex13}>
              <span className={profilePageStyles.text14}>Account Type</span>
              <span className={profilePageStyles.text27}>{user?.role || "Applicant"}</span>
            </div>
          </div>
        </div>

        {/* Alumni Profile Submission — applicants only */}
        {user?.role !== "reviewer" && (
          <div className={profilePageStyles.white28}>
            <h2 className={profilePageStyles.text29}>Alumni Profile</h2>
            <p className={profilePageStyles.text30}>
              If you are a past scholar or intern, submit your information to be featured in our Alumni Spotlight. Your profile will be reviewed before publishing.
            </p>
            {alumniSuccess ? (
              <div className={profilePageStyles.text31}>
                Your alumni profile has been submitted for review. Thank you!
                <button
                  onClick={() => setAlumniSuccess(false)}
                  className={profilePageStyles.text32}
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={handleAlumniSubmit} className={profilePageStyles.className33}>
                <div>
                  <label className={profilePageStyles.text34}>Type *</label>
                  <select
                    value={alumniForm.type}
                    onChange={(e) => setAlumniForm({ ...alumniForm, type: e.target.value })}
                    className={profilePageStyles.text35}
                  >
                    <option value="Scholar">Scholar</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className={profilePageStyles.text34}>Scholarship / Internship Name *</label>
                  <input
                    required
                    value={alumniForm.opportunityName}
                    onChange={(e) => setAlumniForm({ ...alumniForm, opportunityName: e.target.value })}
                    placeholder="e.g. Jaisohn Challenge Scholarship"
                    className={profilePageStyles.text35}
                  />
                </div>
                <div className={profilePageStyles.grid36}>
                  <div>
                    <label className={profilePageStyles.text34}>University</label>
                    <input
                      value={alumniForm.university}
                      onChange={(e) => setAlumniForm({ ...alumniForm, university: e.target.value })}
                      className={profilePageStyles.text35}
                    />
                  </div>
                  <div>
                    <label className={profilePageStyles.text34}>Year</label>
                    <input
                      value={alumniForm.year}
                      onChange={(e) => setAlumniForm({ ...alumniForm, year: e.target.value })}
                      placeholder="e.g. 2023"
                      className={profilePageStyles.text35}
                    />
                  </div>
                </div>
                <div>
                  <label className={profilePageStyles.text34}>Major</label>
                  <input
                    value={alumniForm.major}
                    onChange={(e) => setAlumniForm({ ...alumniForm, major: e.target.value })}
                    className={profilePageStyles.text35}
                  />
                </div>
                <div>
                  <label className={profilePageStyles.text34}>Project / Work Description</label>
                  <textarea
                    rows={3}
                    value={alumniForm.project}
                    onChange={(e) => setAlumniForm({ ...alumniForm, project: e.target.value })}
                    className={profilePageStyles.text35}
                  />
                </div>
                <div>
                  <label className={profilePageStyles.text34}>Quote</label>
                  <textarea
                    rows={2}
                    value={alumniForm.quote}
                    onChange={(e) => setAlumniForm({ ...alumniForm, quote: e.target.value })}
                    className={profilePageStyles.text35}
                  />
                </div>
                <div>
                  <label className={profilePageStyles.text34}>Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAlumniPhoto(e.target.files?.[0] || null)}
                    className={profilePageStyles.text37}
                  />
                </div>
                {alumniError && <p className={profilePageStyles.text21}>{alumniError}</p>}
                <button
                  type="submit"
                  disabled={alumniSaving}
                  className={profilePageStyles.text38}
                >
                  {alumniSaving ? "Submitting..." : "Submit Alumni Profile"}
                </button>
              </form>
            )}
          </div>
        )}

        <div className={profilePageStyles.white39}>
          <h2 className={profilePageStyles.text40}>Danger Zone</h2>
          <p className={profilePageStyles.text30}>
            Deleting your account is permanent. All your applications and data will be removed and cannot be recovered.
          </p>
          <button
            onClick={handleDeleteAccount}
            className={profilePageStyles.whitetext41}
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
