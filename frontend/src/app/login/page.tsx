"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Brain, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <span className="text-xs text-muted-foreground/40 cursor-not-allowed">Forgot?</span>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
