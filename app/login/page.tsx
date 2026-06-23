"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (status === "authenticated") {
    const user = session.user as any;
    router.push(user?.role === "reviewer" ? "/reviewer" : "/portal");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      name: mode === "signup" ? name : undefined,
      isSignUp: mode === "signup" ? "true" : "false",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error);
    } else {
      // Session will update, redirect will happen
      router.refresh();
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/portal" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-[#101661] py-4 px-6">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#101661] font-bold text-xs">PJ</span>
          </div>
          <span className="text-white font-semibold">Philip Jaisohn Foundation</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-[#101661] mb-2 text-center">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-500 text-sm text-center mb-6">
              {mode === "login"
                ? "Sign in to access your applications"
                : "Create an account to start applying"}
            </p>

            {/* Google Sign In */}
            {mode !== "login" || true ? (
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            ) : null}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs text-gray-400">
                <span className="px-2 bg-white">or</span>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-md border border-gray-200 mb-4 overflow-hidden">
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-[#101661] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => { setMode("login"); setError(""); }}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "signup" ? "bg-[#101661] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => { setMode("signup"); setError(""); }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] focus:border-transparent"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#b51f1f] hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-md transition-colors"
              >
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              Reviewer accounts must be created by a Jaisohn Foundation administrator.
            </p>
          </div>

          <p className="text-center mt-4">
            <Link href="/" className="text-sm text-[#101661] hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
