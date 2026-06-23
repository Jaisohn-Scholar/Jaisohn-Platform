"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#101661]">Reviewer Portal</h1>
          <p className="text-gray-500 mt-1">Review and manage all scholarship and internship applications.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", count: applications.length, color: "text-[#101661]" },
            { label: "Submitted", count: applications.filter((a) => a.status === "submitted").length, color: "text-blue-600" },
            { label: "Under Review", count: applications.filter((a) => a.status === "under_review").length, color: "text-purple-600" },
            { label: "Accepted", count: applications.filter((a) => a.status === "accepted").length, color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters & View toggle */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#101661]"
          >
            <option value="all">All Types</option>
            <option value="scholarship">Scholarship</option>
            <option value="internship">Internship</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#101661]"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
            ))}
          </select>
          <select
            value={filterOpp}
            onChange={(e) => setFilterOpp(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#101661]"
          >
            <option value="all">All Opportunities</option>
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <div className="ml-auto flex rounded-md border border-gray-200 overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm ${view === "list" ? "bg-[#101661] text-white" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${view === "grouped" ? "bg-[#101661] text-white" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setView("grouped")}
            >
              Grouped
            </button>
          </div>
          <span className="text-sm text-gray-400">{filtered.length} application{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {view === "list" ? (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">No applications match your filters.</div>
            ) : (
              filtered.map((app) => <AppRow key={app.id} app={app} />)
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ opp, apps, acceptedCount }) => (
              <div key={opp.id}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-[#101661]">{opp.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${opp.type === "scholarship" ? "bg-blue-50 text-[#101661] border border-blue-200" : "bg-purple-50 text-purple-800 border border-purple-200"}`}>
                      {opp.type}
                    </span>
                    <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                      {acceptedCount}/{opp.slots} spots filled
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {apps.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center text-gray-400 text-sm">No applications</div>
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
      className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-[#101661] hover:shadow-md transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${app.opportunity_type === "scholarship" ? "bg-blue-50 text-[#101661] border-blue-200" : "bg-purple-50 text-purple-800 border-purple-200"}`}>
              {app.opportunity_type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {app.score !== null && (
              <span className="text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full">
                Score: {app.score}/10
              </span>
            )}
          </div>
          <p className="font-semibold text-[#101661]">{app.user_name}</p>
          <p className="text-gray-500 text-sm">{app.user_email} · {app.opportunity_name}</p>
        </div>
        <div className="text-xs text-gray-400 shrink-0">
          {app.submitted_at
            ? `Submitted ${new Date(app.submitted_at).toLocaleDateString()}`
            : `Started ${new Date(app.created_at).toLocaleDateString()}`}
        </div>
      </div>
    </Link>
  );
}
