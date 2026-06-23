"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
}

export default function ScholarshipsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tab, setTab] = useState<"all" | "scholarship" | "internship">("all");

  useEffect(() => {
    fetch("/api/opportunities").then((r) => r.json()).then(setOpportunities);
  }, []);

  const scholarships = opportunities.filter((o) => o.type === "scholarship");
  const internships = opportunities.filter((o) => o.type === "internship");

  const filtered =
    tab === "all" ? opportunities :
    tab === "scholarship" ? scholarships : internships;

  const getApplyButton = (opp: Opportunity) => {
    if (!session) {
      return (
        <Link
          href="/login"
          className="block w-full text-center bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors mt-4"
        >
          Sign In to Apply
        </Link>
      );
    }
    if (user?.role === "reviewer") return null;
    return (
      <Link
        href="/portal"
        className="block w-full text-center bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors mt-4"
      >
        Go to Portal
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#101661] text-white py-16 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Scholarships &amp; Internships</h1>
          <p className="text-blue-200 text-lg mb-6 max-w-2xl">
            The Philip Jaisohn Memorial Foundation is committed to supporting students who demonstrate academic excellence and a commitment to community.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 border border-white/40 rounded-full px-4 py-1.5 text-sm text-white/90">
              🎓 {scholarships.length} Scholarships
            </span>
            <span className="inline-flex items-center gap-2 border border-white/40 rounded-full px-4 py-1.5 text-sm text-white/90">
              💼 {internships.length} Internships
            </span>
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="bg-[#f3f4f6] px-8 sm:px-12 lg:px-20 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex gap-3">
          {(["all", "scholarship", "internship"] as const).map((t) => {
            const count = t === "all" ? opportunities.length : t === "scholarship" ? scholarships.length : internships.length;
            const label = t === "all" ? `All (${count})` : t === "scholarship" ? `Scholarships (${count})` : `Internships (${count})`;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-[#101661] text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cards grid */}
      <section className="py-12 px-8 sm:px-12 lg:px-20 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((opp) => (
            <div key={opp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  opp.type === "internship"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-50 text-blue-700"
                }`}>
                  {opp.type === "internship" ? "💼 Internship" : "🎓 Scholarship"}
                </span>
                {opp.award && (
                  <span className="text-green-700 font-semibold text-sm">{opp.award}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-[#101661] mb-2">{opp.name}</h3>
              <p className="text-gray-500 text-sm mb-3 leading-relaxed flex-1">{opp.description}</p>
              {opp.requirements && (
                <p className="text-sm mb-2">
                  <span className="font-semibold text-gray-700">Requirements: </span>
                  <span className="text-gray-500">{opp.requirements}</span>
                </p>
              )}
              <div className="flex items-center gap-3 text-sm mb-1">
                {opp.deadline && (
                  <span className="text-[#b51f1f] font-medium">Deadline: {opp.deadline}</span>
                )}
                {opp.slots > 1 && (
                  <span className="text-gray-400 flex items-center gap-1">
                    👤 {opp.slots} recipients
                  </span>
                )}
              </div>
              {getApplyButton(opp)}
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#101661] text-white py-6 px-8 sm:px-12 lg:px-20 text-center text-sm text-blue-300">
        © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
      </footer>
    </div>
  );
}
