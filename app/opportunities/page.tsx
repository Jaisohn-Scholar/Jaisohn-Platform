"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";

import { opportunitiesPageStyles } from "@/styles/pages/opportunities";
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

export default function OpportunitiesPage() {
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
        <span className={opportunitiesPageStyles.text01}>
          All Spots Filled
        </span>
      );
    }
    if (!session) {
      return (
        <Link
          href="/login"
          className={opportunitiesPageStyles.text02}
        >
          Sign In to Apply
        </Link>
      );
    }
    if (user?.role === "reviewer") return null;
    return (
      <Link
        href="/portal"
        className={opportunitiesPageStyles.text02}
      >
        Apply →
      </Link>
    );
  };

  return (
    <div className={opportunitiesPageStyles.flex03}>
      <Navbar />

      {/* Hero */}
      <section className={opportunitiesPageStyles.text04}>
        <div className={opportunitiesPageStyles.className05}>
          <p className={opportunitiesPageStyles.text06}>Opportunities</p>
          <h1 className={opportunitiesPageStyles.text07}>Scholarships &amp;<br />Internships</h1>
          <p className={opportunitiesPageStyles.text08}>
            The Philip Jaisohn Memorial Foundation is committed to supporting students who demonstrate academic excellence and a commitment to community.
          </p>
          <div className={opportunitiesPageStyles.flex09}>
            <span className={opportunitiesPageStyles.text10}>
              🎓 {scholarships.length} Scholarship{scholarships.length !== 1 ? "s" : ""}
            </span>
            <span className={opportunitiesPageStyles.text10}>
              💼 {internships.length} Internship{internships.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className={opportunitiesPageStyles.white11}>
        <div className={opportunitiesPageStyles.flex12}>
          {(["all", "scholarship", "internship"] as const).map((t) => {
            const count = t === "all" ? opportunities.length : t === "scholarship" ? scholarships.length : internships.length;
            const label = t === "all" ? `All (${count})` : t === "scholarship" ? `Scholarships (${count})` : `Internships (${count})`;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`${opportunitiesPageStyles.filterTab} ${tab === t ? opportunitiesPageStyles.filterTabActive : opportunitiesPageStyles.filterTabInactive}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cards grid */}
      <section className={opportunitiesPageStyles.className13}>
        <div className={opportunitiesPageStyles.grid14}>
          {filtered.map((opp) => (
            <div key={opp.id} className={`${opportunitiesPageStyles.opportunityCard} ${opp.accepted_count >= opp.slots ? opportunitiesPageStyles.opportunityCardFilled : opportunitiesPageStyles.opportunityCardOpen}`}>
              <div className={opportunitiesPageStyles.flex15}>
                <span className={`${opportunitiesPageStyles.typeBadge} ${opp.type === "internship" ? opportunitiesPageStyles.internshipBadge : opportunitiesPageStyles.scholarshipBadge}`}>
                  {opp.type === "internship" ? "💼 Internship" : "🎓 Scholarship"}
                </span>
                <div className={opportunitiesPageStyles.flex16}>
                  {opp.award && (
                    <span className={opportunitiesPageStyles.text17}>{opp.award}</span>
                  )}
                </div>
              </div>
              <h3 className={opportunitiesPageStyles.text18}>{opp.name}</h3>
              <p className={opportunitiesPageStyles.text19}>{opp.description}</p>
              {opp.requirements && (
                <div className={opportunitiesPageStyles.flextext20}>
                  <span className={opportunitiesPageStyles.text21}>✓</span>
                  <span className={opportunitiesPageStyles.text22}>{opp.requirements}</span>
                </div>
              )}
              <div className={opportunitiesPageStyles.flextext23}>
                {opp.deadline && (
                  <span className={opportunitiesPageStyles.text24}>📅 {opp.deadline}</span>
                )}
                <span>👥 {opp.accepted_count}/{opp.slots} spot{opp.slots !== 1 ? "s" : ""} filled</span>
              </div>
              {getApplyButton(opp)}
            </div>
          ))}
        </div>
      </section>

      <footer className={opportunitiesPageStyles.text25}>
        © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
      </footer>
    </div>
  );
}
