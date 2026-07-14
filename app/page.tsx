"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";

import { homePageStyles } from "@/styles/pages/home";
interface Opportunity {
  id: string;
  type: string;
  award: string | null;
  slots: number;
}

function parseAward(award: string | null): number {
  if (!award) return 0;
  const match = award.replace(/,/g, "").match(/\$(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    fetch("/api/opportunities").then((r) => r.json()).then(setOpportunities);
  }, []);

  const applyHref = !session
    ? "/login"
    : user?.role === "reviewer"
    ? "/reviewer"
    : "/portal";

  const totalAwarded = opportunities.reduce((sum, o) => {
    return sum + parseAward(o.award) * o.slots;
  }, 0);

  const totalSlots = opportunities.reduce((s, o) => s + o.slots, 0);
  const yearsOfService = "25+";

  const formatAward = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K+`;
    return `$${n}+`;
  };

  return (
    <div className={homePageStyles.flex01}>
      <Navbar />

      {/* Hero */}
      <section className={homePageStyles.text02}>
        <div className={homePageStyles.grid03}>
          <div>
            <div className={homePageStyles.text04}>
              <Image src="/logo.png" alt="PJ" width={20} height={20} className={homePageStyles.className05} />
              Philip Jaisohn Memorial Foundation · Est. 1975
            </div>
            <h1 className={homePageStyles.text06}>
              Apply for<br />Scholarships<br />and Internships
            </h1>
            <p className={homePageStyles.text07}>
              Empowering diverse students through education, opportunity, and community.
            </p>
            <div className={homePageStyles.flex08}>
              <Link
                href="/opportunities"
                className={homePageStyles.text09}
              >
                View Opportunities
              </Link>
              <Link
                href={applyHref}
                className={homePageStyles.text10}
              >
                Apply Now
              </Link>
            </div>
          </div>
          <div className={homePageStyles.flex11}>
            <div className={homePageStyles.white12}>
              <Image
                src="/logo.png"
                alt="Philip Jaisohn Foundation"
                width={260}
                height={220}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className={homePageStyles.white13}>
        <div className={homePageStyles.gridtext14}>
          {[
            { value: yearsOfService, label: "Years of Service" },
            { value: opportunities.length > 0 ? formatAward(totalAwarded) : "—", label: "Awarded Annually" },
            { value: opportunities.length > 0 ? `${totalSlots}+` : "—", label: "Recipients Per Year" },
            { value: `${opportunities.length || "—"}`, label: "Programs Available" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className={homePageStyles.text15}>{stat.value}</p>
              <p className={homePageStyles.text16}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About section */}
      <section className={homePageStyles.className17}>
        <div className={homePageStyles.grid03}>
          <div className={homePageStyles.className18}>
            <Image
              src="/graduation.jpg"
              alt="Students at graduation ceremony"
              fill
              className={homePageStyles.className19}
            />
            <div className={homePageStyles.className20} />
          </div>
          <div>
            <p className={homePageStyles.text21}>About Us</p>
            <h2 className={homePageStyles.text22}>About the Philip Jaisohn Memorial Foundation</h2>
            <p className={homePageStyles.text23}>
              The Philip Jaisohn Memorial Foundation is a non-profit organization established in 1975 in memory of Dr. Philip Jaisohn (Soh Jai-pil), a visionary Korean-American pioneer, physician, and the first Korean naturalized citizen of the United States.
            </p>
            <p className={homePageStyles.text23}>
              Located in Philadelphia, Pennsylvania, the Foundation serves the Asian-American and underserved communities across the Greater Philadelphia region through health services, cultural programs, senior care, and educational scholarships.
            </p>
            <p className={homePageStyles.text24}>
              Each year, the Foundation awards scholarships and internship opportunities to outstanding students who demonstrate academic excellence, community involvement, and a commitment to Dr. Jaisohn's legacy.
            </p>
            <a
              href="https://jaisohn.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={homePageStyles.text25}
            >
              Learn more at jaisohn.org →
            </a>
          </div>
        </div>
      </section>

      {/* Legacy section */}
      <section className={homePageStyles.className26}>
        <div className={homePageStyles.grid03}>
          <div>
            <p className={homePageStyles.text27}>Our Legacy</p>
            <h2 className={homePageStyles.text28}>The Legacy of Dr. Philip Jaisohn</h2>
            <p className={homePageStyles.text29}>
              Dr. Philip Jaisohn (1864–1951) was a groundbreaking figure in both Korean and American history. He fled Korea after leading the failed Gapsin Coup, came to America, became the first Korean to be naturalized as a United States citizen in 1890, then earned a medical degree from George Washington University in 1892.
            </p>
            <p className={homePageStyles.text29}>
              A physician, publisher, and reformer, Dr. Jaisohn devoted his life to justice, democracy, and the advancement of the Korean people. He founded The Independent, Korea's first modern newspaper, advocating for independence and modernization.
            </p>
            <p className={homePageStyles.text30}>
              The Foundation bearing his name continues his legacy — bridging cultures, empowering communities, and investing in the leaders of tomorrow.
            </p>
          </div>
          <div className={homePageStyles.white31}>
            <div className={homePageStyles.text32} style={{fontFamily:"Georgia,serif"}}>"</div>
            <p className={homePageStyles.text33}>
              The future of Korea depends upon the education and enlightenment of its people.
            </p>
            <div className={homePageStyles.flex34}>
              <div className={homePageStyles.className35} />
              <p className={homePageStyles.text36}>Dr. Philip Jaisohn</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section className={homePageStyles.className17}>
        <div className={homePageStyles.className37}>
          <div className={homePageStyles.text38}>
            <p className={homePageStyles.text21}>Get Started</p>
            <h2 className={homePageStyles.text15}>How to Apply</h2>
          </div>
          <div className={homePageStyles.grid39}>
            {[
              { step: "01", title: "Create Account", desc: "Sign up with Google or your email to get started in minutes." },
              { step: "02", title: "Explore Opportunities", desc: "Browse our scholarships and internship programs to find your fit." },
              { step: "03", title: "Complete Application", desc: "Fill out your application and upload required documents." },
              { step: "04", title: "Receive Decision", desc: "Track your status and receive a decision from our team." },
            ].map((item, i) => (
              <div key={item.step} className={homePageStyles.className40}>
                {i < 3 && (
                  <div className={homePageStyles.className41} />
                )}
                <div className={homePageStyles.flextext42}>
                  <div className={homePageStyles.flextext43}>
                    {item.step}
                  </div>
                  <h3 className={homePageStyles.text44}>{item.title}</h3>
                  <p className={homePageStyles.text45}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={homePageStyles.text46}>
            <Link
              href={applyHref}
              className={homePageStyles.text47}
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={homePageStyles.text48}>
        <div className={homePageStyles.flex49}>
          <div className={homePageStyles.flex50}>
            <Image src="/logo.png" alt="PJ Logo" width={48} height={48} className={homePageStyles.white51} />
            <div>
              <p className={homePageStyles.className52}>Philip Jaisohn Memorial Foundation</p>
              <p className={homePageStyles.text53}>Premier Health &amp; Human Services for the Asian American Community</p>
            </div>
          </div>
          <div className={homePageStyles.flextext54}>
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className={homePageStyles.className55}>Official Website</a>
            <Link href="/opportunities" className={homePageStyles.className55}>Opportunities</Link>
            <Link href="/alumni" className={homePageStyles.className55}>Alumni</Link>
            <Link href="/login" className={homePageStyles.className55}>Login</Link>
          </div>
        </div>
        <div className={homePageStyles.text56}>
          © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
        </div>
      </footer>
    </div>
  );
}
