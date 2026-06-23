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
  accepted_count: number;
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
    const isFilled = opp.accepted_count >= opp.slots;
    if (isFilled) {
      return (
        <div className="block w-full text-center bg-gray-100 text-gray-400 font-semibold px-6 py-2.5 rounded-md mt-auto cursor-default select-none">
          All Spots Filled
        </div>
      );
    }
    if (!session) {
      return (
        <Link
          href="/login"
          className="block w-full text-center bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors mt-auto"
        >
          Sign In to Apply
        </Link>
      );
    }
    if (user?.role === "reviewer") return null;
    return (
      <Link
        href="/portal"
        className="block w-full text-center bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors mt-auto"
      >
        Go to Portal
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#101661] text-white py-20 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Opportunities</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight">Scholarships &amp;<br />Internships</h1>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl leading-relaxed">
            The Philip Jaisohn Memorial Foundation is committed to supporting students who demonstrate academic excellence and a commitment to community.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90">
              🎓 {scholarships.length} Scholarship{scholarships.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90">
              💼 {internships.length} Internship{internships.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="bg-white border-b border-gray-200 px-8 sm:px-12 lg:px-20 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-2">
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
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cards grid */}
      <section className="py-14 px-8 sm:px-12 lg:px-20 flex-1 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((opp) => (
            <div key={opp.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col hover:shadow-md transition-shadow ${opp.accepted_count >= opp.slots ? "border-gray-200 opacity-75" : "border-gray-100"}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  opp.type === "internship"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-blue-50 text-[#101661] border border-blue-200"
                }`}>
                  {opp.type === "internship" ? "💼 Internship" : "🎓 Scholarship"}
                </span>
                <div className="flex items-center gap-2">
                  {opp.accepted_count >= opp.slots && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      Filled
                    </span>
                  )}
                  {opp.award && (
                    <span className="text-green-700 font-bold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200">{opp.award}</span>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#101661] mb-2 leading-snug">{opp.name}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed flex-1">{opp.description}</p>
              {opp.requirements && (
                <div className="flex items-start gap-2 text-sm mb-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-400 shrink-0 mt-0.5">✓</span>
                  <span className="text-gray-600">{opp.requirements}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                {opp.deadline && (
                  <span className="text-[#b51f1f] font-semibold">📅 {opp.deadline}</span>
                )}
                <span>👥 {opp.accepted_count}/{opp.slots} spot{opp.slots !== 1 ? "s" : ""} filled</span>
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
