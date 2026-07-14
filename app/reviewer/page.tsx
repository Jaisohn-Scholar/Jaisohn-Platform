"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

import { reviewerDashboardPageStyles } from "@/styles/pages/reviewer-dashboard";
interface Application {
  id: string;
  user_name: string;
  user_email: string;
  opportunity_name: string;
  opportunity_type: string;
  opportunity_id: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  score: number | null;
}

interface Opportunity {
  id: string;
  type: string;
  name: string;
  slots: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800 border-blue-200" },
  under_review: { label: "Under Review", color: "bg-purple-100 text-purple-800 border-purple-200" },
  interview_requested: { label: "Interview Requested", color: "bg-orange-100 text-orange-800 border-orange-200" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);

export default function ReviewerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterOpp, setFilterOpp] = useState<string>("all");
  const [view, setView] = useState<"list" | "grouped">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const user = session.user as any;
      if (user.role !== "reviewer") { router.push("/portal"); return; }
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

  const filtered = applications.filter((a) => {
    if (filterType !== "all" && a.opportunity_type !== filterType) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterOpp !== "all" && a.opportunity_id !== filterOpp) return false;
    return true;
  });

  // Group by opportunity
  const grouped = opportunities.map((opp) => ({
    opp,
    apps: filtered.filter((a) => a.opportunity_id === opp.id),
    acceptedCount: applications.filter((a) => a.opportunity_id === opp.id && a.status === "accepted").length,
  })).filter((g) => g.apps.length > 0 || view !== "grouped");

  if (loading) {
    return (
      <div className={reviewerDashboardPageStyles.flex01}>
        <Navbar />
        <div className={reviewerDashboardPageStyles.flextext02}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={reviewerDashboardPageStyles.flex03}>
      <Navbar />
      <div className={reviewerDashboardPageStyles.className04}>
        <div className={reviewerDashboardPageStyles.className05}>
          <div className={reviewerDashboardPageStyles.flex06}>
            <div>
              <h1 className={reviewerDashboardPageStyles.text07}>Reviewer Portal</h1>
              <p className={reviewerDashboardPageStyles.text08}>Review and manage all scholarship and internship applications.</p>
            </div>
            <div className={reviewerDashboardPageStyles.flex09}>
              <Link
                href="/reviewer/accounts"
                className={reviewerDashboardPageStyles.text10}
              >
                Manage Reviewers
              </Link>
              <Link
                href="/reviewer/email-templates"
                className={reviewerDashboardPageStyles.text10}
              >
                Email Templates
              </Link>
              <Link
                href="/reviewer/opportunities"
                className={reviewerDashboardPageStyles.text11}
              >
                Manage Opportunities
              </Link>
              <Link
                href="/reviewer/alumni"
                className={reviewerDashboardPageStyles.text12}
              >
                Manage Alumni
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={reviewerDashboardPageStyles.grid13}>
          {[
            { label: "Total", count: applications.length, color: "text-[#101661]" },
            { label: "Submitted", count: applications.filter((a) => a.status === "submitted").length, color: "text-blue-600" },
            { label: "Under Review", count: applications.filter((a) => a.status === "under_review").length, color: "text-purple-600" },
            { label: "Accepted", count: applications.filter((a) => a.status === "accepted").length, color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className={reviewerDashboardPageStyles.whitetext14}>
              <p className={`${reviewerDashboardPageStyles.statCount} ${stat.color}`}>{stat.count}</p>
              <p className={reviewerDashboardPageStyles.text15}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters & View toggle */}
        <div className={reviewerDashboardPageStyles.flexwhite16}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={reviewerDashboardPageStyles.text17}
          >
            <option value="all">All Types</option>
            <option value="scholarship">Scholarship</option>
            <option value="internship">Internship</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={reviewerDashboardPageStyles.text17}
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
            ))}
          </select>
          <select
            value={filterOpp}
            onChange={(e) => setFilterOpp(e.target.value)}
            className={reviewerDashboardPageStyles.text17}
          >
            <option value="all">All Opportunities</option>
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <div className={reviewerDashboardPageStyles.flex18}>
            <button
              className={`${reviewerDashboardPageStyles.viewToggleButton} ${view === "list" ? reviewerDashboardPageStyles.viewToggleButtonActive : reviewerDashboardPageStyles.viewToggleButtonInactive}`}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              className={`${reviewerDashboardPageStyles.viewToggleButton} ${view === "grouped" ? reviewerDashboardPageStyles.viewToggleButtonActive : reviewerDashboardPageStyles.viewToggleButtonInactive}`}
              onClick={() => setView("grouped")}
            >
              Grouped
            </button>
          </div>
          <span className={reviewerDashboardPageStyles.text19}>{filtered.length} application{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {view === "list" ? (
          <div className={reviewerDashboardPageStyles.className20}>
            {filtered.length === 0 ? (
              <div className={reviewerDashboardPageStyles.whitetext21}>No applications match your filters.</div>
            ) : (
              filtered.map((app) => <AppRow key={app.id} app={app} />)
            )}
          </div>
        ) : (
          <div className={reviewerDashboardPageStyles.className22}>
            {grouped.map(({ opp, apps, acceptedCount }) => (
              <div key={opp.id}>
                <div className={reviewerDashboardPageStyles.flex23}>
                  <h2 className={reviewerDashboardPageStyles.text24}>{opp.name}</h2>
                  <div className={reviewerDashboardPageStyles.flextext25}>
                    <span className={`${reviewerDashboardPageStyles.groupTypeBadge} ${opp.type === "scholarship" ? reviewerDashboardPageStyles.scholarshipBadge : reviewerDashboardPageStyles.internshipBadge}`}>
                      {opp.type}
                    </span>
                    <span className={reviewerDashboardPageStyles.text26}>
                      {acceptedCount}/{opp.slots} spots filled
                    </span>
                  </div>
                </div>
                <div className={reviewerDashboardPageStyles.className27}>
                  {apps.length === 0 ? (
                    <div className={reviewerDashboardPageStyles.whitetext28}>No applications</div>
                  ) : (
                    apps.map((app) => <AppRow key={app.id} app={app} />)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppRow({ app }: { app: Application }) {
  const statusInfo = STATUS_LABELS[app.status] || { label: app.status, color: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <Link
      href={`/reviewer/${app.id}`}
      className={reviewerDashboardPageStyles.white29}
    >
      <div className={reviewerDashboardPageStyles.flex30}>
        <div className={reviewerDashboardPageStyles.className31}>
          <div className={reviewerDashboardPageStyles.flex32}>
            <span className={`${reviewerDashboardPageStyles.applicationBadge} ${app.opportunity_type === "scholarship" ? reviewerDashboardPageStyles.scholarshipBadgeCompact : reviewerDashboardPageStyles.internshipBadgeCompact}`}>
              {app.opportunity_type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
            </span>
            <span className={`${reviewerDashboardPageStyles.applicationBadge} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {app.score !== null && (
              <span className={reviewerDashboardPageStyles.text33}>
                Score: {app.score}/10
              </span>
            )}
          </div>
          <p className={reviewerDashboardPageStyles.text34}>{app.user_name}</p>
          <p className={reviewerDashboardPageStyles.text35}>{app.user_email} · {app.opportunity_name}</p>
        </div>
        <div className={reviewerDashboardPageStyles.text36}>
          {app.submitted_at
            ? `Submitted ${new Date(app.submitted_at).toLocaleDateString()}`
            : `Started ${new Date(app.created_at).toLocaleDateString()}`}
        </div>
      </div>
    </Link>
  );
}
