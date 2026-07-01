"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

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
      <div className="flex flex-col min-h-screen"><Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
      </div>
    );
  }

  const portalHref = user?.role === "reviewer" ? "/reviewer" : "/portal";
  const portalLabel = user?.role === "reviewer" ? "Reviewer Portal" : "My Applications";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto w-full px-6 py-10 flex-1">
        <Link href={portalHref} className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">← Back to {portalLabel}</Link>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-[#101661] px-6 py-8 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.name || "—"}</h1>
              <p className="text-blue-200 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-white/20 text-white px-2 py-0.5 rounded-full capitalize">
                {user?.role || "applicant"}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex justify-between">
              <span className="text-sm font-medium text-gray-500">Full Name</span>
              <span className="text-sm text-gray-800">{user?.name || "—"}</span>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Email Address</span>
                {!emailEdit && (
                  <button
                    onClick={() => { setEmailEdit(true); setNewEmail(user?.email || ""); setEmailError(""); setEmailSuccess(false); }}
                    className="text-xs text-[#101661] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              {emailEdit ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                  {emailError && <p className="text-xs text-red-600">{emailError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleEmailSave}
                      disabled={emailSaving}
                      className="text-xs bg-[#101661] text-white px-3 py-1.5 rounded-md hover:bg-blue-900 disabled:opacity-50"
                    >
                      {emailSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => { setEmailEdit(false); setEmailError(""); }}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-800 mt-0.5">{user?.email}</p>
              )}
              {emailSuccess && <p className="text-xs text-green-600 mt-1">Email updated successfully.</p>}
            </div>
            <div className="px-6 py-4 flex justify-between">
              <span className="text-sm font-medium text-gray-500">Account Type</span>
              <span className="text-sm text-gray-800 capitalize">{user?.role || "Applicant"}</span>
            </div>
          </div>
        </div>

        {/* Alumni Profile Submission — applicants only */}
        {user?.role !== "reviewer" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-[#101661] mb-1">Alumni Profile</h2>
            <p className="text-sm text-gray-500 mb-4">
              If you are a past scholar or intern, submit your information to be featured in our Alumni Spotlight. Your profile will be reviewed before publishing.
            </p>
            {alumniSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800">
                Your alumni profile has been submitted for review. Thank you!
                <button
                  onClick={() => setAlumniSuccess(false)}
                  className="block mt-2 text-xs text-green-700 underline"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={handleAlumniSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                  <select
                    value={alumniForm.type}
                    onChange={(e) => setAlumniForm({ ...alumniForm, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  >
                    <option value="Scholar">Scholar</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Scholarship / Internship Name *</label>
                  <input
                    required
                    value={alumniForm.opportunityName}
                    onChange={(e) => setAlumniForm({ ...alumniForm, opportunityName: e.target.value })}
                    placeholder="e.g. Jaisohn Challenge Scholarship"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">University</label>
                    <input
                      value={alumniForm.university}
                      onChange={(e) => setAlumniForm({ ...alumniForm, university: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                    <input
                      value={alumniForm.year}
                      onChange={(e) => setAlumniForm({ ...alumniForm, year: e.target.value })}
                      placeholder="e.g. 2023"
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Major</label>
                  <input
                    value={alumniForm.major}
                    onChange={(e) => setAlumniForm({ ...alumniForm, major: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Project / Work Description</label>
                  <textarea
                    rows={3}
                    value={alumniForm.project}
                    onChange={(e) => setAlumniForm({ ...alumniForm, project: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quote</label>
                  <textarea
                    rows={2}
                    value={alumniForm.quote}
                    onChange={(e) => setAlumniForm({ ...alumniForm, quote: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAlumniPhoto(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#101661] file:text-white hover:file:bg-blue-900"
                  />
                </div>
                {alumniError && <p className="text-xs text-red-600">{alumniError}</p>}
                <button
                  type="submit"
                  disabled={alumniSaving}
                  className="w-full bg-[#101661] hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
                >
                  {alumniSaving ? "Submitting..." : "Submit Alumni Profile"}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <h2 className="font-semibold text-red-700 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Deleting your account is permanent. All your applications and data will be removed and cannot be recovered.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-white border border-red-300 text-red-600 hover:bg-red-50 font-medium px-4 py-2 rounded-md text-sm transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
