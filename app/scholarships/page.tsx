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
}

export default function ScholarshipsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const applyHref = !session ? "/login" : user?.role === "reviewer" ? "/reviewer" : "/portal";

  useEffect(() => {
    fetch("/api/opportunities").then((r) => r.json()).then(setOpportunities);
  }, []);

  const scholarships = opportunities.filter((o) => o.type === "scholarship");
  const internships = opportunities.filter((o) => o.type === "internship");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1">
        <h1 className="text-4xl font-bold text-[#101661] mb-2">Opportunities</h1>
        <p className="text-gray-600 mb-10">
          Explore the scholarships and internships offered by the Philip Jaisohn Memorial Foundation.
          You may apply for one scholarship and one internship.
        </p>

        {/* Scholarships */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#101661] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#101661] text-white rounded-full flex items-center justify-center text-sm">🎓</span>
            Scholarships
          </h2>
          <div className="space-y-4">
            {scholarships.map((opp) => (
              <div key={opp.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  className="w-full text-left p-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === opp.id ? null : opp.id)}
                >
                  <div>
                    <h3 className="font-semibold text-lg text-[#101661]">{opp.name}</h3>
                    {opp.award && <p className="text-[#b51f1f] font-medium text-sm mt-0.5">{opp.award}</p>}
                  </div>
                  <span className="text-gray-400 text-xl ml-4">{expanded === opp.id ? "▲" : "▼"}</span>
                </button>
                {expanded === opp.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-700 mt-4 leading-relaxed">{opp.description}</p>
                    <div className="mt-4 flex items-center gap-4">
                      {opp.award && (
                        <span className="text-sm bg-blue-50 text-[#101661] border border-blue-200 px-3 py-1 rounded-full font-medium">
                          Award: {opp.award}
                        </span>
                      )}
                      <span className="text-sm bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full">
                        {opp.slots} position{opp.slots !== 1 ? "s" : ""} available
                      </span>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={applyHref}
                        className="inline-block bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition-colors"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Internships */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#101661] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#101661] text-white rounded-full flex items-center justify-center text-sm">💼</span>
            Internships
          </h2>
          <div className="space-y-4">
            {internships.map((opp) => (
              <div key={opp.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  className="w-full text-left p-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === opp.id ? null : opp.id)}
                >
                  <div>
                    <h3 className="font-semibold text-lg text-[#101661]">{opp.name}</h3>
                    {opp.award && <p className="text-[#b51f1f] font-medium text-sm mt-0.5">{opp.award}</p>}
                  </div>
                  <span className="text-gray-400 text-xl ml-4">{expanded === opp.id ? "▲" : "▼"}</span>
                </button>
                {expanded === opp.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-700 mt-4 leading-relaxed">{opp.description}</p>
                    <div className="mt-4 flex items-center gap-4">
                      {opp.award && (
                        <span className="text-sm bg-blue-50 text-[#101661] border border-blue-200 px-3 py-1 rounded-full font-medium">
                          {opp.award}
                        </span>
                      )}
                      <span className="text-sm bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full">
                        {opp.slots} position{opp.slots !== 1 ? "s" : ""} available
                      </span>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={applyHref}
                        className="inline-block bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition-colors"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="text-center mt-8">
          <Link
            href={applyHref}
            className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-10 py-3 rounded-md text-lg transition-colors inline-block"
          >
            Apply Now
          </Link>
        </div>
      </div>

      <footer className="bg-[#101661] text-white py-6 px-6 text-center text-sm text-blue-300">
        © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
      </footer>
    </div>
  );
}
