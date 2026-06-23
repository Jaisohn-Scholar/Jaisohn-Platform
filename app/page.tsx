"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const applyHref = !session
    ? "/login"
    : user?.role === "reviewer"
    ? "/reviewer"
    : "/portal";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#101661] text-white py-20 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center border border-white/30 rounded-full px-4 py-1 text-sm text-white/80 mb-6">
              Philip Jaisohn Memorial Foundation
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight mb-6">
              Apply for<br />Scholarships and<br />Internships
            </h1>
            <p className="text-blue-200 text-lg mb-8 max-w-lg">
              Empowering the next generation of Asian-American leaders through education, opportunity, and community since 1975.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/scholarships"
                className="border border-white/60 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-md text-lg transition-colors"
              >
                View Opportunities
              </Link>
              <Link
                href="/login"
                className="border border-white/60 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-md text-lg transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center border border-white/20 p-8">
              <Image src="/logo.svg" alt="Philip Jaisohn Foundation" width={200} height={200} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#f3f4f6] py-10 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "30+", label: "Years of Service" },
            { value: "$500K+", label: "Awarded Annually" },
            { value: "500+", label: "Alumni Scholars" },
            { value: "2", label: "Programs Available" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-bold text-[#101661]">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About section */}
      <section className="py-20 px-8 sm:px-12 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-xl bg-gray-200 aspect-video flex items-center justify-center text-6xl">
            🎓
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#101661] mb-6">About the Philip Jaisohn Memorial Foundation</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The Philip Jaisohn Memorial Foundation is a non-profit organization established in 1975 in memory of Dr. Philip Jaisohn (Seo Jae-pil), a visionary Korean-American pioneer, physician, and the first Korean naturalized citizen of the United States.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Located in Philadelphia, Pennsylvania, the Foundation serves the Korean-American community across the Greater Philadelphia region through health services, cultural programs, senior care, and educational scholarships. Our mission is to foster integration, self-sufficiency, and civic participation among Korean Americans and the broader Asian-American community.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Each year, the Foundation awards scholarships and internship opportunities to outstanding students who demonstrate academic excellence, community involvement, and a commitment to carrying forward Dr. Jaisohn's legacy of service and leadership.
            </p>
            <a
              href="https://jaisohn.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b51f1f] font-semibold hover:underline"
            >
              Learn more at jaisohn.org →
            </a>
          </div>
        </div>
      </section>

      {/* Legacy section */}
      <section className="bg-[#101661] py-20 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">The Legacy of Dr. Philip Jaisohn</h2>
            <p className="text-blue-100 mb-4 leading-relaxed">
              Dr. Philip Jaisohn (1864–1951) was a groundbreaking figure in both Korean and American history. He fled Korea after leading the failed Gapsin Coup, came to America, earned a medical degree from George Washington University, and became the first Korean to be naturalized as a United States citizen in 1890.
            </p>
            <p className="text-blue-100 mb-4 leading-relaxed">
              A physician, publisher, and reformer, Dr. Jaisohn devoted his life to justice, democracy, and the advancement of the Korean people. He founded The Independent, Korea's first modern newspaper published in both Korean and English, advocating for independence and modernization.
            </p>
            <p className="text-blue-100 leading-relaxed">
              The Foundation bearing his name continues his work — bridging cultures, empowering communities, and investing in the leaders of tomorrow.
            </p>
          </div>
          <div className="bg-indigo-900 rounded-xl p-8">
            <div className="text-3xl mb-4">⭐</div>
            <p className="text-white text-xl italic mb-6 leading-relaxed">
              "The future of Korea depends upon the education and enlightenment of its people."
            </p>
            <p className="text-blue-300 font-semibold">— Dr. Philip Jaisohn</p>
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section className="py-20 px-8 sm:px-12 lg:px-20 bg-[#f3f4f6]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#101661] text-center mb-12">How to Apply</h2>
          <div className="grid sm:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Create Account", desc: "Sign up with Google or your email to get started." },
              { step: "2", title: "Explore Opportunities", desc: "Browse our scholarships and internship programs." },
              { step: "3", title: "Complete Application", desc: "Fill out your application and upload required documents." },
              { step: "4", title: "Receive Decision", desc: "Track your status and receive a decision from our team." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#101661] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[#101661] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href={applyHref}
              className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-10 py-3 rounded-md text-lg transition-colors inline-block"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#101661] text-white py-8 px-8 sm:px-12 lg:px-20 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold">Philip Jaisohn Memorial Foundation</p>
            <p className="text-blue-300 text-sm">Premier Health &amp; Human Services for the Asian American Community</p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">Official Website</a>
            <Link href="/scholarships" className="hover:text-blue-300 transition-colors">Opportunities</Link>
            <Link href="/alumni" className="hover:text-blue-300 transition-colors">Alumni</Link>
            <Link href="/login" className="hover:text-blue-300 transition-colors">Login</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-blue-900 text-center text-blue-400 text-xs">
          © {new Date().getFullYear()} Philip Jaisohn Memorial Foundation. 501(c)(3) Non-profit Organization.
        </div>
      </footer>
    </div>
  );
}
