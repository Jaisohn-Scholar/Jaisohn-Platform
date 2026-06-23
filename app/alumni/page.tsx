"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";

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
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#101661] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Alumni Spotlight</h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            Meet the scholars and interns who carry forward Dr. Philip Jaisohn's legacy of service, leadership, and excellence.
          </p>
          {isReviewer && (
            <div className="mt-6">
              <Link
                href="/reviewer/alumni"
                className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors inline-block"
              >
                Manage Alumni
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Filter tabs */}
      <section className="bg-[#f3f4f6] px-6 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex gap-3">
          {(["all", "Scholar", "Intern"] as const).map((t) => {
            const count = t === "all" ? alumni.length : t === "Scholar" ? scholars.length : interns.length;
            const label = t === "all" ? `All (${count})` : `${t}s (${count})`;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === t ? "bg-[#101661] text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cards grid */}
      <section className="py-12 px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <p className="text-5xl mb-4">🎓</p>
              <p className="text-lg">No alumni profiles yet.</p>
              {isReviewer && (
                <Link href="/reviewer/alumni" className="mt-4 inline-block text-[#b51f1f] hover:underline">
                  Add the first alumni profile
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((alum) => (
                <div key={alum.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Photo */}
                  <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-6xl">
                    {alum.photo_path ? (
                      <img
                        src={alum.photo_path}
                        alt={alum.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[#101661] text-lg">{alum.name}</h3>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                        {alum.type}
                      </span>
                    </div>
                    <p className="text-[#b51f1f] text-sm font-medium mb-2">{alum.opportunity_name}</p>
                    {(alum.university || alum.major || alum.year) && (
                      <p className="text-gray-500 text-sm mb-3">
                        {[alum.university, alum.major && alum.year ? `${alum.major} · ${alum.year}` : alum.major || alum.year].filter(Boolean).join(" — ")}
                      </p>
                    )}
                    {alum.project && (
                      <div className="bg-[#fef9c3] rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Project</p>
                        <p className="text-sm text-gray-700">{alum.project}</p>
                      </div>
                    )}
                    {alum.quote && (
                      <div className="border-t border-gray-100 pt-3">
                        <span className="text-2xl text-gray-300 leading-none">"</span>
                        <p className="text-sm text-gray-600 italic -mt-2">{alum.quote}</p>
                      </div>
                    )}
                    {isReviewer && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Link
                          href={`/reviewer/alumni?edit=${alum.id}`}
                          className="flex-1 text-center text-sm border border-[#101661] text-[#101661] hover:bg-[#101661] hover:text-white px-3 py-1.5 rounded-md transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(alum.id)}
                          className="flex-1 text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
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

      <footer className="bg-[#101661] text-white py-6 px-6 text-center text-sm text-blue-300">
        © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
      </footer>
    </div>
  );
}
