"use client";
import Link from "next/link";
import Image from "next/image";
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
    <nav className="bg-white text-gray-800 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="PJ Logo" width={40} height={40} className="rounded-lg" />
            <span className="font-bold text-lg hidden sm:block text-[#101661]">Philip Jaisohn Foundation</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/opportunities" className="hover:text-[#101661] transition-colors">Opportunities</Link>
            <Link href="/alumni" className="hover:text-[#101661] transition-colors">Alumni</Link>
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className="hover:text-[#101661] transition-colors">About Us</a>
            <span className="border-l border-gray-300 h-5" />
            {!session ? (
              <>
                <Link href="/login" className="hover:text-[#101661] transition-colors">Sign In</Link>
                <Link href="/login" className="bg-[#101661] hover:bg-blue-900 text-white px-4 py-2 rounded-md transition-colors">
                  Apply Now
                </Link>
              </>
            ) : (
              <>
                {user?.role !== "reviewer" && (
                  <Link href="/portal" className="bg-[#101661] hover:bg-blue-900 text-white px-4 py-2 rounded-md transition-colors">
                    Apply Now
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 hover:text-[#101661] transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#101661] rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span>{user?.name || user?.email}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg z-50 border border-gray-100">
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
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-2 space-y-2">
            <Link href="/opportunities" className="block px-2 py-1 hover:text-[#101661]" onClick={() => setMenuOpen(false)}>Opportunities</Link>
            <Link href="/alumni" className="block px-2 py-1 hover:text-[#101661]" onClick={() => setMenuOpen(false)}>Alumni</Link>
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 hover:text-[#101661]">About Us</a>
            {!session ? (
              <>
                <Link href="/login" className="block px-2 py-1 hover:text-[#101661]" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/login" className="block px-2 py-1 text-[#101661] font-semibold" onClick={() => setMenuOpen(false)}>Apply Now</Link>
              </>
            ) : user?.role === "reviewer" ? (
              <Link href="/reviewer" className="block px-2 py-1 hover:text-[#101661]" onClick={() => setMenuOpen(false)}>Reviewer Portal</Link>
            ) : (
              <>
                <Link href="/portal" className="block px-2 py-1 hover:text-[#101661]" onClick={() => setMenuOpen(false)}>My Portal</Link>
                <Link href="/portal" className="block px-2 py-1 text-[#101661] font-semibold" onClick={() => setMenuOpen(false)}>Apply Now</Link>
              </>
            )}
            {session && (
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block px-2 py-1 text-red-500 hover:text-red-700">Sign Out</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
