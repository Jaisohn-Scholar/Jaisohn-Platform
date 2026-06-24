"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

interface Reviewer {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function ReviewerAccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const user = session.user as any;
      if (user.role !== "reviewer") { router.push("/portal"); return; }
      loadReviewers();
    }
  }, [status]);

  async function loadReviewers() {
    const res = await fetch("/api/reviewers");
    setReviewers(await res.json());
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    setAdding(true);
    const res = await fetch("/api/reviewers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    });
    if (res.ok) {
      setEmailInput("");
      await loadReviewers();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add reviewer");
    }
    setAdding(false);
  }

  async function handleRemove(reviewer: Reviewer) {
    if (!confirm(`Remove reviewer access for ${reviewer.email}? They will be demoted to a regular applicant account.`)) return;
    await fetch(`/api/reviewers/${reviewer.id}`, { method: "DELETE" });
    setReviewers((prev) => prev.filter((r) => r.id !== reviewer.id));
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen"><Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-6">
          <Link href="/reviewer" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">← Back to Reviewer Portal</Link>
          <h1 className="text-3xl font-bold text-[#101661]">Manage Reviewer Accounts</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Add an email address to grant reviewer access. If the person logs in with Google using that email, they will automatically have reviewer privileges.
          </p>
        </div>

        {/* Add form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-[#101661] mb-3">Add Reviewer</h2>
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
            />
            <button
              type="submit"
              disabled={adding}
              className="bg-[#b51f1f] hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-md text-sm transition-colors"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* Reviewer list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#101661]">Current Reviewers ({reviewers.length})</h2>
          </div>
          {reviewers.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No reviewer accounts found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reviewers.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.email}</p>
                    {r.name && r.name !== r.email.split("@")[0] && (
                      <p className="text-xs text-gray-400">{r.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {r.id === currentUserId && (
                      <span className="text-xs bg-blue-50 text-[#101661] border border-blue-200 px-2 py-0.5 rounded-full">You</span>
                    )}
                    <button
                      onClick={() => handleRemove(r)}
                      disabled={r.id === currentUserId}
                      className="text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
