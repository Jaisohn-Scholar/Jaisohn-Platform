"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";

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
  const yearsOfService = new Date().getFullYear() - 1975;

  const formatAward = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K+`;
    return `$${n}+`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#101661] text-white py-24 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center border border-white/30 rounded-full px-4 py-1.5 text-sm text-white/80 mb-8 gap-2">
              <Image src="/logo.png" alt="PJ" width={20} height={20} className="rounded-full bg-white/90 p-0.5" />
              Philip Jaisohn Memorial Foundation · Est. 1975
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Apply for<br />Scholarships<br />and Internships
            </h1>
            <p className="text-blue-200 text-lg mb-10 max-w-lg leading-relaxed">
              Empowering Asian-American students through education, opportunity, and community since 1975.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/opportunities"
                className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-md text-base transition-colors"
              >
                View Opportunities
              </Link>
              <Link
                href={applyHref}
                className="border border-white/50 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-md text-base transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="bg-white rounded-2xl p-10 shadow-2xl">
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
      <section className="bg-white border-b border-gray-100 py-10 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: `${yearsOfService}+`, label: "Years of Service" },
            { value: opportunities.length > 0 ? formatAward(totalAwarded) : "—", label: "Awarded Annually" },
            { value: opportunities.length > 0 ? `${totalSlots}+` : "—", label: "Recipients Per Year" },
            { value: `${opportunities.length || "—"}`, label: "Programs Available" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-bold text-[#101661]">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About section */}
      <section className="py-24 px-8 sm:px-12 lg:px-20 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video relative">
            <Image
              src="/graduation.jpg"
              alt="Students at graduation ceremony"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101661]/20 to-transparent" />
          </div>
          <div>
            <p className="text-[#b51f1f] font-semibold text-sm uppercase tracking-widest mb-3">About Us</p>
            <h2 className="text-4xl font-bold text-[#101661] mb-6 leading-tight">About the Philip Jaisohn Memorial Foundation</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The Philip Jaisohn Memorial Foundation is a non-profit organization established in 1975 in memory of Dr. Philip Jaisohn (Seo Jae-pil), a visionary Korean-American pioneer, physician, and the first Korean naturalized citizen of the United States.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Located in Philadelphia, Pennsylvania, the Foundation serves the Korean-American community across the Greater Philadelphia region through health services, cultural programs, senior care, and educational scholarships.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Each year, the Foundation awards scholarships and internship opportunities to outstanding students who demonstrate academic excellence, community involvement, and a commitment to Dr. Jaisohn's legacy.
            </p>
            <a
              href="https://jaisohn.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#b51f1f] font-semibold hover:gap-3 transition-all"
            >
              Learn more at jaisohn.org →
            </a>
          </div>
        </div>
      </section>

      {/* Legacy section */}
      <section className="bg-[#101661] py-24 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-200 font-semibold text-sm uppercase tracking-widest mb-3">Our Legacy</p>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">The Legacy of Dr. Philip Jaisohn</h2>
            <p className="text-blue-100 mb-4 leading-relaxed">
              Dr. Philip Jaisohn (1864–1951) was a groundbreaking figure in both Korean and American history. He fled Korea after leading the failed Gapsin Coup, came to America, earned a medical degree from George Washington University, and became the first Korean to be naturalized as a United States citizen in 1890.
            </p>
            <p className="text-blue-100 mb-4 leading-relaxed">
              A physician, publisher, and reformer, Dr. Jaisohn devoted his life to justice, democracy, and the advancement of the Korean people. He founded The Independent, Korea's first modern newspaper, advocating for independence and modernization.
            </p>
            <p className="text-blue-100 leading-relaxed">
              The Foundation bearing his name continues his work — bridging cultures, empowering communities, and investing in the leaders of tomorrow.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-10 shadow-xl">
            <div className="text-6xl text-[#b51f1f] leading-none mb-4" style={{fontFamily:"Georgia,serif"}}>"</div>
            <p className="text-[#101661] text-2xl font-bold leading-relaxed mb-8">
              The future of Korea depends upon the education and enlightenment of its people.
            </p>
            <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
              <div className="w-1 h-8 bg-[#b51f1f] rounded-full" />
              <p className="text-gray-500 font-medium">Dr. Philip Jaisohn</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section className="py-24 px-8 sm:px-12 lg:px-20 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#b51f1f] font-semibold text-sm uppercase tracking-widest mb-3">Get Started</p>
            <h2 className="text-4xl font-bold text-[#101661]">How to Apply</h2>
          </div>
          <div className="grid sm:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with Google or your email to get started in minutes." },
              { step: "02", title: "Explore Opportunities", desc: "Browse our scholarships and internship programs to find your fit." },
              { step: "03", title: "Complete Application", desc: "Fill out your application and upload required documents." },
              { step: "04", title: "Receive Decision", desc: "Track your status and receive a decision from our team." },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 3 && (
                  <div className="hidden sm:block absolute top-6 left-[calc(50%+28px)] right-0 h-0.5 bg-gray-200" />
                )}
                <div className="flex flex-col items-center text-center relative">
                  <div className="w-12 h-12 bg-[#101661] text-white rounded-full flex items-center justify-center font-bold text-sm mb-4 z-10">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-[#101661] text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href={applyHref}
              className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-12 py-4 rounded-md text-lg transition-colors inline-block"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#101661] text-white py-10 px-8 sm:px-12 lg:px-20 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="PJ Logo" width={48} height={48} className="rounded-full bg-white p-1" />
            <div>
              <p className="font-semibold">Philip Jaisohn Memorial Foundation</p>
              <p className="text-blue-300 text-sm">Premier Health &amp; Human Services for the Asian American Community</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">Official Website</a>
            <Link href="/opportunities" className="hover:text-blue-300 transition-colors">Opportunities</Link>
            <Link href="/alumni" className="hover:text-blue-300 transition-colors">Alumni</Link>
            <Link href="/login" className="hover:text-blue-300 transition-colors">Login</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-blue-900 text-center text-blue-400 text-xs">
          © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
        </div>
      </footer>
    </div>
  );
}
