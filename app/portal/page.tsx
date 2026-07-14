"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

import { portalPageStyles } from "@/styles/pages/portal";
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
      <div className={portalPageStyles.flex01}>
        <Navbar />
        <div className={portalPageStyles.flextext02}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={portalPageStyles.flex03}>
      <Navbar />
      <div className={portalPageStyles.className04}>
        <div className={portalPageStyles.flex05}>
          <div>
            <h1 className={portalPageStyles.text06}>My Applications</h1>
            <p className={portalPageStyles.text07}>Track and manage your scholarship and internship applications.</p>
          </div>
          {(!hasScholarship || !hasInternship) && (
            <button
              onClick={() => { setShowNewAppModal(true); setError(""); }}
              className={portalPageStyles.text08}
            >
              + New Application
            </button>
          )}
        </div>

        {applications.length === 0 ? (
          <div className={portalPageStyles.whitetext09}>
            <div className={portalPageStyles.text10}>📝</div>
            <h2 className={portalPageStyles.text11}>No Applications Yet</h2>
            <p className={portalPageStyles.text12}>Start your journey by applying for a scholarship or internship.</p>
            <button
              onClick={() => { setShowNewAppModal(true); setError(""); }}
              className={portalPageStyles.text13}
            >
              Start Application
            </button>
          </div>
        ) : (
          <div className={portalPageStyles.className14}>
            {applications.map((app) => {
              const statusInfo = STATUS_LABELS[app.status] || { label: app.status, color: "bg-gray-100 text-gray-700 border-gray-200" };
              return (
                <div key={app.id} className={portalPageStyles.flexwhite15}>
                  <div className={portalPageStyles.className16}>
                    <div className={portalPageStyles.flex17}>
                      <span className={`${portalPageStyles.typeBadge} ${app.opportunity_type === "scholarship" ? portalPageStyles.scholarshipBadge : portalPageStyles.internshipBadge}`}>
                        {app.opportunity_type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
                      </span>
                      <span className={`${portalPageStyles.typeBadge} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <h2 className={portalPageStyles.text18}>{app.opportunity_name}</h2>
                    <p className={portalPageStyles.text19}>
                      Started {new Date(app.created_at).toLocaleDateString()}
                      {app.submitted_at && ` · Submitted ${new Date(app.submitted_at).toLocaleDateString()}`}
                    </p>
                    {app.status === "interview_requested" && (
                      <p className={portalPageStyles.text20}>
                        🎉 Interview requested! The team will email you soon to set up a meeting.
                      </p>
                    )}
                    {app.status === "accepted" && (
                      <p className={portalPageStyles.text21}>
                        🎉 Congratulations! You have been accepted.
                      </p>
                    )}
                  </div>
                  <div className={portalPageStyles.flex22}>
                    {(app.status === "in_progress" || app.status === "submitted") && (
                      <Link
                        href={`/portal/apply/${app.id}`}
                        className={portalPageStyles.text23}
                      >
                        {app.status === "in_progress" ? "Edit" : "View"}
                      </Link>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(app.id)}
                      className={portalPageStyles.text24}
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
        <div className={portalPageStyles.fixedflex25}>
          <div className={portalPageStyles.flexwhite26}>
            <div className={portalPageStyles.className27}>
              <h2 className={portalPageStyles.text28}>Start New Application</h2>
              <p className={portalPageStyles.text29}>Select an opportunity to begin your application.</p>
            </div>
            {error && (
              <div className={portalPageStyles.text30}>
                {error}
              </div>
            )}
            <div className={portalPageStyles.className31}>
              <div className={portalPageStyles.grid32}>
                {opportunities.filter((o) => {
                  if (o.type === "scholarship" && hasScholarship) return false;
                  if (o.type === "internship" && hasInternship) return false;
                  return true;
                }).map((opp) => (
                  <button
                    key={opp.id}
                    onClick={() => startApplication(opp.id)}
                    className={portalPageStyles.text33}
                  >
                    <span className={`${portalPageStyles.modalTypeBadge} ${opp.type === "scholarship" ? portalPageStyles.modalScholarshipBadge : portalPageStyles.modalInternshipBadge}`}>
                      {opp.type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
                    </span>
                    <p className={portalPageStyles.text34}>{opp.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className={portalPageStyles.className35}>
              <button
                onClick={() => { setShowNewAppModal(false); setError(""); }}
                className={portalPageStyles.text36}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={portalPageStyles.fixedflex25}>
          <div className={portalPageStyles.whitetext37}>
            <div className={portalPageStyles.text38}>⚠️</div>
            <h2 className={portalPageStyles.text39}>Delete Application?</h2>
            <p className={portalPageStyles.text40}>
              This action cannot be undone. All application data including essays and uploaded documents will be permanently deleted.
            </p>
            <div className={portalPageStyles.flex41}>
              <button
                onClick={() => setDeleteConfirm(null)}
                className={portalPageStyles.text42}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteApplication(deleteConfirm)}
                className={portalPageStyles.text43}
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
