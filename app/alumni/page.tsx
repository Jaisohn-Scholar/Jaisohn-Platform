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
      <section className="bg-[#101661] text-white py-20 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Our Community</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight">Alumni Spotlight</h1>
          <p className="text-blue-200 text-lg max-w-2xl leading-relaxed">
            Meet the scholars and interns who carry forward Dr. Philip Jaisohn's legacy of service, leadership, and excellence.
          </p>
          {isReviewer && (
            <div className="mt-8">
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
      <section className="bg-white border-b border-gray-200 px-8 sm:px-12 lg:px-20 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-2">
          {(["all", "Scholar", "Intern"] as const).map((t) => {
            const count = t === "all" ? alumni.length : t === "Scholar" ? scholars.length : interns.length;
            const label = t === "all" ? `All (${count})` : `${t}s (${count})`;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === t ? "bg-[#101661] text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
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
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-24">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🎓</div>
              <p className="text-lg font-medium text-gray-500">No alumni profiles yet.</p>
              {isReviewer && (
                <Link href="/reviewer/alumni" className="mt-4 inline-block text-[#b51f1f] hover:underline text-sm">
                  Add the first alumni profile →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((alum) => (
                <div key={alum.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  {/* Photo */}
                  <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {alum.photo_path ? (
                      <img
                        src={alum.photo_path}
                        alt={alum.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
                          👤
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur text-amber-700 border border-amber-200 shadow-sm">
                        {alum.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#101661] text-xl mb-0.5">{alum.name}</h3>
                    <p className="text-[#b51f1f] text-sm font-semibold mb-2">{alum.opportunity_name}</p>
                    {(alum.university || alum.major || alum.year) && (
                      <p className="text-gray-400 text-xs mb-3">
                        {[alum.university, alum.major && alum.year ? `${alum.major} · ${alum.year}` : alum.major || alum.year].filter(Boolean).join(" — ")}
                      </p>
                    )}
                    {alum.project && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Project</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{alum.project}</p>
                      </div>
                    )}
                    {alum.quote && (
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500 italic leading-relaxed">"{alum.quote}"</p>
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

      <footer className="bg-[#101661] text-white py-6 px-8 sm:px-12 lg:px-20 text-center text-sm text-blue-300">
        © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
      </footer>
    </div>
  );
}
