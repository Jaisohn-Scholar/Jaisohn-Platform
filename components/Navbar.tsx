"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { navbarStyles } from "@/styles";

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
    <nav className={navbarStyles.layout.nav}>
      <div className={navbarStyles.layout.container}>
        <div className={navbarStyles.layout.inner}>
          <Link href="/" className={navbarStyles.brand.link}>
            <Image src="/logo.png" alt="PJ Logo" width={40} height={40} className={navbarStyles.brand.logo} />
            <span className={navbarStyles.brand.name}>Philip Jaisohn Memorial Foundation</span>
          </Link>

          <div className={navbarStyles.desktop.navLinks}>
            <Link href="/opportunities" className={navbarStyles.desktop.link}>Opportunities</Link>
            <Link href="/alumni" className={navbarStyles.desktop.link}>Alumni</Link>
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className={navbarStyles.desktop.link}>About Us</a>
            <span className={navbarStyles.desktop.divider} />
            {!session ? (
              <>
                <Link href="/login" className={navbarStyles.desktop.link}>Sign In</Link>
                <Link href="/login" className={navbarStyles.desktop.primaryLink}>
                  Apply Now
                </Link>
              </>
            ) : (
              <>
                {user?.role !== "reviewer" && (
                  <Link href="/portal" className={navbarStyles.desktop.primaryLink}>
                    Apply Now
                  </Link>
                )}
                <div className={navbarStyles.desktop.userMenu}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={navbarStyles.desktop.userButton}
                  >
                    <div className={navbarStyles.desktop.avatar}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span>{user?.name || user?.email}</span>
                  </button>
                  {menuOpen && (
                    <div className={navbarStyles.desktop.dropdown}>
                      {user?.role === "reviewer" ? (
                        <Link href="/reviewer" className={navbarStyles.desktop.dropdownLink} onClick={() => setMenuOpen(false)}>
                          Reviewer Portal
                        </Link>
                      ) : (
                        <Link href="/portal" className={navbarStyles.desktop.dropdownLink} onClick={() => setMenuOpen(false)}>
                          My Portal
                        </Link>
                      )}
                      <Link href="/profile" className={navbarStyles.desktop.dropdownLink} onClick={() => setMenuOpen(false)}>
                        My Profile
                      </Link>
                      <div className={navbarStyles.desktop.dropdownDivider} />
                      <button
                        onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                        className={navbarStyles.desktop.signOutButton}
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
          <button className={navbarStyles.mobile.menuButton} onClick={() => setMenuOpen(!menuOpen)}>
            <div className={navbarStyles.mobile.menuIconLine}></div>
            <div className={navbarStyles.mobile.menuIconLine}></div>
            <div className={navbarStyles.mobile.menuIconLineLast}></div>
          </button>
        </div>

        {menuOpen && (
          <div className={navbarStyles.mobile.menu}>
            <Link href="/opportunities" className={navbarStyles.mobile.link} onClick={() => setMenuOpen(false)}>Opportunities</Link>
            <Link href="/alumni" className={navbarStyles.mobile.link} onClick={() => setMenuOpen(false)}>Alumni</Link>
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className={navbarStyles.mobile.link}>About Us</a>
            {!session ? (
              <>
                <Link href="/login" className={navbarStyles.mobile.link} onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/login" className={navbarStyles.mobile.primaryLink} onClick={() => setMenuOpen(false)}>Apply Now</Link>
              </>
            ) : user?.role === "reviewer" ? (
              <Link href="/reviewer" className={navbarStyles.mobile.link} onClick={() => setMenuOpen(false)}>Reviewer Portal</Link>
            ) : (
              <>
                <Link href="/portal" className={navbarStyles.mobile.link} onClick={() => setMenuOpen(false)}>My Portal</Link>
                <Link href="/portal" className={navbarStyles.mobile.primaryLink} onClick={() => setMenuOpen(false)}>Apply Now</Link>
              </>
            )}
            {session && (
              <button onClick={() => signOut({ callbackUrl: "/" })} className={navbarStyles.mobile.signOutButton}>Sign Out</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
