"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This will permanently remove all your data and applications. This cannot be undone.")) return;
    if (!confirm("Final confirmation: delete your account permanently?")) return;
    await fetch("/api/account", { method: "DELETE" });
    await signOut({ callbackUrl: "/" });
  }

  if (status === "loading" || !session) {
    return (
      <div className="flex flex-col min-h-screen"><Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
      </div>
    );
  }

  const portalHref = user?.role === "reviewer" ? "/reviewer" : "/portal";
  const portalLabel = user?.role === "reviewer" ? "Reviewer Portal" : "My Applications";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto w-full px-6 py-10 flex-1">
        <Link href={portalHref} className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">← Back to {portalLabel}</Link>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-[#101661] px-6 py-8 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.name || "—"}</h1>
              <p className="text-blue-200 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-white/20 text-white px-2 py-0.5 rounded-full capitalize">
                {user?.role || "applicant"}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex justify-between">
              <span className="text-sm font-medium text-gray-500">Full Name</span>
              <span className="text-sm text-gray-800">{user?.name || "—"}</span>
            </div>
            <div className="px-6 py-4 flex justify-between">
              <span className="text-sm font-medium text-gray-500">Email Address</span>
              <span className="text-sm text-gray-800">{user?.email}</span>
            </div>
            <div className="px-6 py-4 flex justify-between">
              <span className="text-sm font-medium text-gray-500">Account Type</span>
              <span className="text-sm text-gray-800 capitalize">{user?.role || "Applicant"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <h2 className="font-semibold text-red-700 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Deleting your account is permanent. All your applications and data will be removed and cannot be recovered.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-white border border-red-300 text-red-600 hover:bg-red-50 font-medium px-4 py-2 rounded-md text-sm transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
