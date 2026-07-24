"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, MessageSquare, Zap, ArrowRight, Bot, Code2, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api";

const MODELS_PREVIEW = [
  { name: "GPT-5", icon: Brain, color: "from-purple-500 to-purple-600", desc: "Latest generation" },
  { name: "Gemini", icon: Sparkles, color: "from-amber-500 to-amber-600", desc: "Google AI" },
  { name: "DeepSeek R1", icon: Zap, color: "from-teal-500 to-teal-600", desc: "Reasoning model" },
  { name: "Llama 3", icon: Bot, color: "from-orange-500 to-orange-600", desc: "Open source" },
  { name: "DALL·E", icon: ImageIcon, color: "from-pink-500 to-pink-600", desc: "Image generation" },
  { name: "Copilot", icon: Code2, color: "from-green-500 to-emerald-600", desc: "Code assistant" },
];

const FEATURES = [
  { icon: MessageSquare, title: "10+ AI Models", desc: "Switch between GPT-5, Gemini, DeepSeek, and more mid-conversation." },
  { icon: Bot, title: "Smart Memory", desc: "Conversations persist across sessions. Pick up where you left off." },
  { icon: Zap, title: "File Analysis", desc: "Upload images, code, PDFs — AI reads and understands them all." },
  { icon: ImageIcon, title: "Image Generation", desc: "Generate images with DALL·E directly from your chat." },
];

export default function Home() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add("dark");
    if (api.getToken()) window.location.href = "/chat";
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">Neuro<span className="text-purple-400">AI</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">Sign in</Link>
            <Link href="/register">
              <button className="text-sm px-5 py-2 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-all inline-flex items-center gap-2">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-purple-500/10 via-transparent to-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -left-32 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-32 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary border border-border/50 text-xs text-muted-foreground mb-8">
                <Sparkles className="w-3 h-3 text-amber-400" /> 
                10 AI models · One platform
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              All the best AI,<br />
              <span className="text-gradient">one conversation</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Chat with GPT-5, Gemini, DeepSeek, and more. Generate images, analyze files — all in one beautiful interface.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-4">
              <Link href="/register">
                <button className="group px-8 py-3.5 rounded-2xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-xl">
                  Start free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/login">
                <button className="px-8 py-3.5 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  Sign in
                </button>
              </Link>
            </motion.div>

            {/* Model Cards Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-3xl mx-auto"
            >
              {MODELS_PREVIEW.map((m, i) => (
                <motion.div 
                  key={m.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.05 }}
                  className="p-4 rounded-2xl bg-card border border-border/50 hover:border-foreground/20 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <m.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{m.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 px-6 border-t border-border/50">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Built for how you work</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Everything you need to get the most out of AI.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div 
                  key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-foreground/20 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 border-t border-border/50">
          <div className="max-w-lg mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready?</h2>
              <p className="text-muted-foreground mb-8">No credit card required. 50 free chats/day.</p>
              <Link href="/register">
                <button className="px-8 py-3.5 rounded-2xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-all shadow-xl">
                  Get started free
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-muted-foreground">NeuroAI</span>
          </div>
          <div className="text-xs text-muted-foreground/40">© 2026 NeuroAI</div>
        </div>
      </footer>
    </div>
  );
}
