"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Brain, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

const API_BASE = "https://backend-production-87c9.up.railway.app";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      fetch(API_BASE + "/api/v1/auth/me", { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (data.role) router.push(data.role === "admin" ? "/admin" : "/chat"); })
        .catch(() => {});
    }

    // Check URL params for Supabase session after OAuth redirect
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    if (accessToken) {
      handleSupabaseToken(accessToken);
    }
  }, []);

  const handleSupabaseToken = async (supabaseToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + "/api/v1/auth/supabase/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: supabaseToken }),
      });
      const data = await res.json();
      if (data.access_token) {
        api.setToken(data.access_token);
        router.push(data.user?.role === "admin" ? "/admin" : "/chat");
      } else {
        setError(data.detail || "Authentication failed");
      }
    } catch { setError("Something went wrong"); }
    setLoading(false);
  };

  const signInWithGitHub = async () => {
    setOauthLoading("github");
    window.location.href = "https://pxpxzasavltypdrkpmdw.supabase.co/auth/v1/authorize?provider=github&redirect_to=" + window.location.origin + "/auth/supabase-callback";
  };

  const signInWithDiscord = async () => {
    setOauthLoading("discord");
    window.location.href = "https://pxpxzasavltypdrkpmdw.supabase.co/auth/v1/authorize?provider=discord&redirect_to=" + window.location.origin + "/auth/supabase-callback";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await api.login(form.get("email") as string, form.get("password") as string);
      if (res.access_token) router.push(res.user?.role === "admin" ? "/admin" : "/chat");
      else setError(res.detail || "Invalid credentials");
    } catch { setError("Something went wrong"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b border-border flex items-center px-6 bg-background/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground group-hover:opacity-90 transition-opacity">
            <Brain className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">NeuroAI</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          {/* Supabase OAuth Buttons */}
          <div className="space-y-2 mb-6">
<button onClick={signInWithGitHub} disabled={oauthLoading === "github"}
              className="w-full h-10 rounded-xl border border-border bg-card hover:bg-secondary transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              {oauthLoading === "github" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )} Sign in with GitHub
            </button>
            <button onClick={signInWithDiscord} disabled={oauthLoading === "discord"}
              className="w-full h-10 rounded-xl border border-border bg-card hover:bg-secondary transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              {oauthLoading === "discord" ? <Loader2 className="w-4 h-4 animate-spin" /> : <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 7.298 7.298 0 01-1.8723.8923.076.076 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>} Sign in with Discord
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input name="email" type="email" placeholder="you@example.com" required autoFocus
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <span className="text-xs text-muted-foreground/40 cursor-not-allowed">Forgot?</span>
              </div>
              <div className="relative">
                <input name="password" type={showPw ? "text" : "password"} placeholder="Enter your password" required
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2">{error}</motion.p>
            )}
            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground font-medium hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
