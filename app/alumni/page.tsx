"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";

import { alumniPageStyles } from "@/styles/pages/alumni";
interface Alumni {
  id: string;
  name: string;
  type: string;
  opportunity_name: string;
  university: string | null;
  major: string | null;
  year: string | null;
  photo_path: string | null;
  project: string | null;
  quote: string | null;
}

export default function AlumniPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isReviewer = user?.role === "reviewer";
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [tab, setTab] = useState<"all" | "Scholar" | "Intern">("all");

  useEffect(() => {
    fetch("/api/alumni").then((r) => r.json()).then(setAlumni);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this alumni profile?")) return;
    await fetch(`/api/alumni/${id}`, { method: "DELETE" });
    setAlumni((prev) => prev.filter((a) => a.id !== id));
  }

  const scholars = alumni.filter((a) => a.type === "Scholar");
  const interns = alumni.filter((a) => a.type === "Intern");
  const filtered = tab === "all" ? alumni : tab === "Scholar" ? scholars : interns;

  return (
    <div className={alumniPageStyles.flex01}>
      <Navbar />

      {/* Hero */}
      <section className={alumniPageStyles.text02}>
        <div className={alumniPageStyles.className03}>
          <p className={alumniPageStyles.text04}>Our Community</p>
          <h1 className={alumniPageStyles.text05}>Alumni Spotlight</h1>
          <p className={alumniPageStyles.text06}>
            Meet the scholars and interns who carry forward Dr. Philip Jaisohn's legacy of service, leadership, and excellence.
          </p>
          {isReviewer && (
            <div className={alumniPageStyles.className07}>
              <Link
                href="/reviewer/alumni"
                className={alumniPageStyles.text08}
              >
                Manage Alumni
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Filter tabs */}
      <section className={alumniPageStyles.white09}>
        <div className={alumniPageStyles.flex10}>
          {(["all", "Scholar", "Intern"] as const).map((t) => {
            const count = t === "all" ? alumni.length : t === "Scholar" ? scholars.length : interns.length;
            const label = t === "all" ? `All (${count})` : `${t}s (${count})`;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`${alumniPageStyles.filterTab} ${tab === t ? alumniPageStyles.filterTabActive : alumniPageStyles.filterTabInactive}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cards grid */}
      <section className={alumniPageStyles.className11}>
        <div className={alumniPageStyles.className03}>
          {filtered.length === 0 ? (
            <div className={alumniPageStyles.text12}>
              <div className={alumniPageStyles.flextext13}>🎓</div>
              <p className={alumniPageStyles.text14}>No alumni profiles yet.</p>
              {isReviewer && (
                <Link href="/reviewer/alumni" className={alumniPageStyles.text15}>
                  Add the first alumni profile →
                </Link>
              )}
            </div>
          ) : (
            <div className={alumniPageStyles.grid16}>
              {filtered.map((alum) => (
                <div key={alum.id} className={alumniPageStyles.flexwhite17}>
                  {/* Photo */}
                  <div className={alumniPageStyles.className18}>
                    {alum.photo_path ? (
                      <img
                        src={alum.photo_path}
                        alt={alum.name}
                        className={alumniPageStyles.className19}
                      />
                    ) : (
                      <div className={alumniPageStyles.flex20}>
                        <div className={alumniPageStyles.flextext21}>
                          👤
                        </div>
                      </div>
                    )}
                    <div className={alumniPageStyles.className22}>
                      <span className={alumniPageStyles.text23}>
                        {alum.type}
                      </span>
                    </div>
                  </div>
                  <div className={alumniPageStyles.flex24}>
                    <h3 className={alumniPageStyles.text25}>{alum.name}</h3>
                    <p className={alumniPageStyles.text26}>{alum.opportunity_name}</p>
                    {(alum.university || alum.major || alum.year) && (
                      <p className={alumniPageStyles.text27}>
                        {[alum.university, alum.major && alum.year ? `${alum.major} · ${alum.year}` : alum.major || alum.year].filter(Boolean).join(" — ")}
                      </p>
                    )}
                    {alum.project && (
                      <div className={alumniPageStyles.className28}>
                        <p className={alumniPageStyles.text29}>Project</p>
                        <p className={alumniPageStyles.text30}>{alum.project}</p>
                      </div>
                    )}
                    {alum.quote && (
                      <div className={alumniPageStyles.className31}>
                        <p className={alumniPageStyles.text32}>"{alum.quote}"</p>
                      </div>
                    )}
                    {isReviewer && (
                      <div className={alumniPageStyles.flex33}>
                        <Link
                          href={`/reviewer/alumni?edit=${alum.id}`}
                          className={alumniPageStyles.text34}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(alum.id)}
                          className={alumniPageStyles.text35}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className={alumniPageStyles.text36}>
        © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
      </footer>
    </div>
  );
}
