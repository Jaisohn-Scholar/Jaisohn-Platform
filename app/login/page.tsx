"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { loginPageStyles } from "@/styles/pages/login";
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      router.refresh();
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/portal" });
  }

  return (
    <div className={loginPageStyles.flex01}>
      <div className={loginPageStyles.className02}>
        <Link href="/" className={loginPageStyles.flex03}>
          <Image src="/logo.png" alt="PJ Logo" width={32} height={32} className={loginPageStyles.white04} />
          <span className={loginPageStyles.text05}>Philip Jaisohn Foundation</span>
        </Link>
      </div>

      <div className={loginPageStyles.flex06}>
        <div className={loginPageStyles.className07}>
          <div className={loginPageStyles.white08}>
            <h1 className={loginPageStyles.text09}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className={loginPageStyles.text10}>
              {mode === "login"
                ? "Sign in to access your applications"
                : "Create an account to start applying"}
            </p>

            <button
              onClick={handleGoogle}
              className={loginPageStyles.flextext11}
            >
              <svg className={loginPageStyles.className12} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className={loginPageStyles.className13}>
              <div className={loginPageStyles.flex14}>
                <div className={loginPageStyles.className15}></div>
              </div>
              <div className={loginPageStyles.flextext16}>
                <span className={loginPageStyles.white17}>or</span>
              </div>
            </div>

            <div className={loginPageStyles.flex18}>
              <button
                className={`${loginPageStyles.modeTab} ${mode === "login" ? loginPageStyles.modeTabActive : loginPageStyles.modeTabInactive}`}
                onClick={() => { setMode("login"); setError(""); }}
              >
                Sign In
              </button>
              <button
                className={`${loginPageStyles.modeTab} ${mode === "signup" ? loginPageStyles.modeTabActive : loginPageStyles.modeTabInactive}`}
                onClick={() => { setMode("signup"); setError(""); }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className={loginPageStyles.className19}>
              {mode === "signup" && (
                <div>
                  <label className={loginPageStyles.text20}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className={loginPageStyles.text21}
                  />
                </div>
              )}
              <div>
                <label className={loginPageStyles.text20}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={loginPageStyles.text21}
                />
              </div>
              <div>
                <label className={loginPageStyles.text20}>Password</label>
                <div className={loginPageStyles.className22}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={loginPageStyles.text23}
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    className={loginPageStyles.text24}
                    tabIndex={-1}
                    aria-label="Hold to reveal password"
                  >
                    {showPassword ? (
                      <svg className={loginPageStyles.className12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className={loginPageStyles.className12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className={loginPageStyles.text25}>Hold the eye icon to reveal your password</p>
              </div>

              {error && (
                <div className={loginPageStyles.text26}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={loginPageStyles.text27}
              >
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className={loginPageStyles.text28}>
              Reviewer accounts must be created by a Jaisohn Foundation administrator.
            </p>
          </div>

          <p className={loginPageStyles.text29}>
            <Link href="/" className={loginPageStyles.text30}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
