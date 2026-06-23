"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

interface Application {
  id: string;
  opportunity_name: string;
  opportunity_type: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  essay1: string | null;
  essay2: string | null;
  essay3: string | null;
  resume_path: string | null;
  transcript_path: string | null;
}

interface Opportunity {
  id: string;
  type: string;
  name: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800 border-blue-200" },
  under_review: { label: "Under Review", color: "bg-purple-100 text-purple-800 border-purple-200" },
  interview_requested: { label: "Interview Requested", color: "bg-orange-100 text-orange-800 border-orange-200" },
  accepted: { label: "Accepted ✓", color: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Not Selected", color: "bg-red-100 text-red-800 border-red-200" },
};

export default function PortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const user = session.user as any;
      if (user.role === "reviewer") { router.push("/reviewer"); return; }
      loadData();
    }
  }, [status]);

  async function loadData() {
    const [appsRes, oppsRes] = await Promise.all([
      fetch("/api/applications"),
      fetch("/api/opportunities"),
    ]);
    setApplications(await appsRes.json());
    setOpportunities(await oppsRes.json());
    setLoading(false);
  }

  async function startApplication(opportunityId: string) {
    setError("");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setShowNewAppModal(false);
    router.push(`/portal/apply/${data.id}`);
  }

  async function deleteApplication(id: string) {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    loadData();
  }

  const hasScholarship = applications.some((a) => a.opportunity_type === "scholarship");
  const hasInternship = applications.some((a) => a.opportunity_type === "internship");

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
      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#101661]">My Applications</h1>
            <p className="text-gray-500 mt-1">Track and manage your scholarship and internship applications.</p>
          </div>
          {(!hasScholarship || !hasInternship) && (
            <button
              onClick={() => { setShowNewAppModal(true); setError(""); }}
              className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-md transition-colors whitespace-nowrap"
            >
              + New Application
            </button>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-[#101661] mb-2">No Applications Yet</h2>
            <p className="text-gray-500 mb-6">Start your journey by applying for a scholarship or internship.</p>
            <button
              onClick={() => { setShowNewAppModal(true); setError(""); }}
              className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors"
            >
              Start Application
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const statusInfo = STATUS_LABELS[app.status] || { label: app.status, color: "bg-gray-100 text-gray-700 border-gray-200" };
              return (
                <div key={app.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${app.opportunity_type === "scholarship" ? "bg-blue-50 text-[#101661] border-blue-200" : "bg-purple-50 text-purple-800 border-purple-200"}`}>
                        {app.opportunity_type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <h2 className="font-semibold text-lg text-[#101661]">{app.opportunity_name}</h2>
                    <p className="text-gray-400 text-xs mt-1">
                      Started {new Date(app.created_at).toLocaleDateString()}
                      {app.submitted_at && ` · Submitted ${new Date(app.submitted_at).toLocaleDateString()}`}
                    </p>
                    {app.status === "interview_requested" && (
                      <p className="text-orange-700 text-sm mt-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-1.5">
                        🎉 Interview requested! The team will email you soon to set up a meeting.
                      </p>
                    )}
                    {app.status === "accepted" && (
                      <p className="text-green-700 text-sm mt-2 bg-green-50 border border-green-200 rounded-md px-3 py-1.5">
                        🎉 Congratulations! You have been accepted.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(app.status === "in_progress" || app.status === "submitted") && (
                      <Link
                        href={`/portal/apply/${app.id}`}
                        className="bg-[#101661] hover:bg-blue-900 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                      >
                        {app.status === "in_progress" ? "Edit" : "View"}
                      </Link>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(app.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Application Modal */}
      {showNewAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#101661]">Start New Application</h2>
              <p className="text-sm text-gray-500 mt-1">Select an opportunity to begin your application.</p>
            </div>
            {error && (
              <div className="mx-6 mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-2 gap-3">
                {opportunities.filter((o) => {
                  if (o.type === "scholarship" && hasScholarship) return false;
                  if (o.type === "internship" && hasInternship) return false;
                  return true;
                }).map((opp) => (
                  <button
                    key={opp.id}
                    onClick={() => startApplication(opp.id)}
                    className="text-left p-4 border border-gray-200 rounded-xl hover:border-[#101661] hover:bg-blue-50 transition-colors"
                  >
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mb-2 ${opp.type === "scholarship" ? "bg-blue-100 text-[#101661]" : "bg-purple-100 text-purple-800"}`}>
                      {opp.type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
                    </span>
                    <p className="font-semibold text-[#101661] text-sm leading-snug">{opp.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => { setShowNewAppModal(false); setError(""); }}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-[#101661] mb-2">Delete Application?</h2>
            <p className="text-gray-600 text-sm mb-6">
              This action cannot be undone. All application data including essays and uploaded documents will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteApplication(deleteConfirm)}
                className="flex-1 py-2.5 bg-[#b51f1f] hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
