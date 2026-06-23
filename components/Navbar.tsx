"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [menuOpen, setMenuOpen] = useState(false);

  const applyHref = !session
    ? "/login"
    : user?.role === "reviewer"
    ? "/reviewer"
    : "/portal";

  return (
    <nav className="bg-[#101661] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#101661] font-bold text-sm">PJ</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">Philip Jaisohn Foundation</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/scholarships" className="hover:text-gray-300 transition-colors">Scholarships</Link>
            <Link href="/alumni" className="hover:text-gray-300 transition-colors">Alumni</Link>
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">About Us</a>
            <span className="border-l border-white/30 h-5" />
            {!session ? (
              <>
                <Link href="/login" className="hover:text-gray-300 transition-colors">Sign In</Link>
                <Link href="/login" className="bg-[#b51f1f] hover:bg-red-700 px-4 py-2 rounded-md transition-colors">
                  Apply Now
                </Link>
              </>
            ) : (
              <>
                {user?.role !== "reviewer" && (
                  <Link href="/portal" className="bg-[#b51f1f] hover:bg-red-700 px-4 py-2 rounded-md transition-colors">
                    Apply Now
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 hover:text-gray-300 transition-colors"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span>{user?.name || user?.email}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg z-50">
                      {user?.role === "reviewer" ? (
                        <Link href="/reviewer" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                          Reviewer Portal
                        </Link>
                      ) : (
                        <Link href="/portal" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                          My Portal
                        </Link>
                      )}
                      <button
                        onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white"></div>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-blue-900 mt-2 pt-2 space-y-2">
            <Link href="/scholarships" className="block px-2 py-1 hover:text-gray-300" onClick={() => setMenuOpen(false)}>Scholarships</Link>
            <Link href="/alumni" className="block px-2 py-1 hover:text-gray-300" onClick={() => setMenuOpen(false)}>Alumni</Link>
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 hover:text-gray-300">About Us</a>
            {!session ? (
              <>
                <Link href="/login" className="block px-2 py-1 hover:text-gray-300" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/login" className="block px-2 py-1 text-[#b51f1f] font-semibold" onClick={() => setMenuOpen(false)}>Apply Now</Link>
              </>
            ) : user?.role === "reviewer" ? (
              <Link href="/reviewer" className="block px-2 py-1 hover:text-gray-300" onClick={() => setMenuOpen(false)}>Reviewer Portal</Link>
            ) : (
              <>
                <Link href="/portal" className="block px-2 py-1 hover:text-gray-300" onClick={() => setMenuOpen(false)}>My Portal</Link>
                <Link href="/portal" className="block px-2 py-1 text-[#b51f1f] font-semibold" onClick={() => setMenuOpen(false)}>Apply Now</Link>
              </>
            )}
            {session && (
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block px-2 py-1 text-red-400 hover:text-red-300">Sign Out</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
