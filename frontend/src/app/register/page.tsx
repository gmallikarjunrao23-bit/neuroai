"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Brain, Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (api.getToken()) {
      router.push("/chat");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
    try {
      const res = await api.register(email, password, name);
      if (res.access_token) router.push("/chat");
      else setError(res.detail || "Registration failed");
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
              <UserPlus className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">Get started with NeuroAI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <input
                name="name"
                type="text"
                placeholder="Your name"
                required
                autoFocus
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
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
                "Create account"
              )}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
