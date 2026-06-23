"use client";
import Link from "next/link";
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
      <section className="bg-[#101661] text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[#101661] font-bold text-2xl">PJ</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Philip Jaisohn Foundation<br />Scholarship Platform
          </h1>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Supporting the next generation of Asian American leaders through scholarships and internships.
            Apply easily, track your progress, and take the next step in your journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={applyHref}
              className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-md text-lg transition-colors shadow-lg"
            >
              Apply Now
            </Link>
            <Link
              href="/scholarships"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-md text-lg transition-colors border border-white/30"
            >
              View Opportunities
            </Link>
            <a
              href="https://jaisohn.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-md text-lg transition-colors border border-white/30"
            >
              About Us
            </a>
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#101661] text-center mb-4">About the Foundation</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            The Philip Jaisohn Memorial Foundation has become the premier health and human services organization
            of the Asian American community. Founded in 1975, we are a 501(c)(3) non-profit organization.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎓", title: "Education", desc: "Supporting academic excellence for Asian American students pursuing higher education and professional careers." },
              { icon: "🤝", title: "Community", desc: "Strengthening and expanding health and human services for the Korean American community since 1975." },
              { icon: "🌟", title: "Leadership", desc: "Cultivating the next generation of leaders to carry on Dr. Philip Jaisohn's legacy of service and excellence." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-[#101661] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#101661] mb-4">How It Works</h2>
          <p className="text-gray-600 mb-12">Our streamlined platform makes applying simple and transparent.</p>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Create Account", desc: "Sign up with Google or your email" },
              { step: "2", title: "Choose & Apply", desc: "Browse opportunities and start your application" },
              { step: "3", title: "Track Progress", desc: "Monitor your application status in real-time" },
              { step: "4", title: "Get Notified", desc: "Receive updates on interviews and decisions" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#101661] text-white rounded-full flex items-center justify-center font-bold text-xl mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[#101661] mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link
              href={applyHref}
              className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-md text-lg transition-colors inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#101661] text-white py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold">Philip Jaisohn Memorial Foundation</p>
            <p className="text-blue-300 text-sm">Premier Health &amp; Human Services for the Asian American Community</p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="https://jaisohn.org/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">Official Website</a>
            <Link href="/scholarships" className="hover:text-blue-300 transition-colors">Opportunities</Link>
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
