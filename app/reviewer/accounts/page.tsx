"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

import { reviewerAccountsPageStyles } from "@/styles/pages/reviewer-accounts";
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
      <div className={reviewerAccountsPageStyles.flex01}><Navbar />
        <div className={reviewerAccountsPageStyles.flextext02}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={reviewerAccountsPageStyles.flex03}>
      <Navbar />
      <div className={reviewerAccountsPageStyles.className04}>
        <div className={reviewerAccountsPageStyles.className05}>
          <Link href="/reviewer" className={reviewerAccountsPageStyles.text06}>← Back to Reviewer Portal</Link>
          <h1 className={reviewerAccountsPageStyles.text07}>Manage Reviewer Accounts</h1>
          <p className={reviewerAccountsPageStyles.text08}>
            Add an email address to grant reviewer access. If the person logs in with Google using that email, they will automatically have reviewer privileges.
          </p>
        </div>

        {/* Add form */}
        <div className={reviewerAccountsPageStyles.white09}>
          <h2 className={reviewerAccountsPageStyles.text10}>Add Reviewer</h2>
          <form onSubmit={handleAdd} className={reviewerAccountsPageStyles.flex11}>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="email@example.com"
              className={reviewerAccountsPageStyles.text12}
            />
            <button
              type="submit"
              disabled={adding}
              className={reviewerAccountsPageStyles.text13}
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
          {error && <p className={reviewerAccountsPageStyles.text14}>{error}</p>}
        </div>

        {/* Reviewer list */}
        <div className={reviewerAccountsPageStyles.white15}>
          <div className={reviewerAccountsPageStyles.className16}>
            <h2 className={reviewerAccountsPageStyles.text17}>Current Reviewers ({reviewers.length})</h2>
          </div>
          {reviewers.length === 0 ? (
            <div className={reviewerAccountsPageStyles.text18}>No reviewer accounts found.</div>
          ) : (
            <ul className={reviewerAccountsPageStyles.className19}>
              {reviewers.map((r) => (
                <li key={r.id} className={reviewerAccountsPageStyles.flex20}>
                  <div>
                    <p className={reviewerAccountsPageStyles.text21}>{r.email}</p>
                    {r.name && r.name !== r.email.split("@")[0] && (
                      <p className={reviewerAccountsPageStyles.text22}>{r.name}</p>
                    )}
                  </div>
                  <div className={reviewerAccountsPageStyles.flex23}>
                    {r.id === currentUserId && (
                      <span className={reviewerAccountsPageStyles.text24}>You</span>
                    )}
                    <button
                      onClick={() => handleRemove(r)}
                      disabled={r.id === currentUserId}
                      className={reviewerAccountsPageStyles.text25}
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
