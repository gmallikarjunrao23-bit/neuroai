"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, MessageSquare, Zap, ArrowRight, Bot, Code2, Image as ImageIcon, Moon, Sun } from "lucide-react";
import { api } from "@/lib/api";

const MODELS_PREVIEW = [
  { name: "GPT-5", icon: Brain, color: "from-purple-500 to-purple-600", desc: "Latest generation" },
  { name: "Gemini", icon: Sparkles, color: "from-amber-500 to-amber-600", desc: "Google AI" },
  { name: "DeepSeek R1", icon: Zap, color: "from-teal-500 to-teal-600", desc: "Reasoning model" },
  { name: "Llama 3", icon: Bot, color: "from-orange-500 to-orange-600", desc: "Open source" },
  { name: "DALL·E", icon: ImageIcon, color: "from-pink-500 to-pink-600", desc: "Image generation" },
  { name: "Copilot", icon: Code2, color: "from-green-500 to-emerald-600", desc: "Code assistant" },
];

const STATS = [
  { value: "10+", label: "AI Models" },
  { value: "50K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "Free", label: "To start" },
];

export default function Home() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add("dark");
    // 🔥 If already logged in, redirect to chat
    if (api.getToken()) {
      window.location.href = "/chat";
    }
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 h-14 border-b border-border bg-background/80 backdrop-blur-xl z-50">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">NeuroAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/register">
              <button className="text-sm px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-14">
        {/* Hero */}
        <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/3 via-transparent to-amber-500/3 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-muted-foreground mb-8">
                <Sparkles className="w-3 h-3 text-amber-500" />
                10 AI models · One platform · Free to start
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              All the best AI models,
              <br />
              <span className="bg-gradient-to-r from-purple-500 via-amber-500 to-pink-500 bg-clip-text text-transparent">
                one conversation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Chat with GPT-5, Gemini, DeepSeek, Claude, and more — all in one place. 
              Switch models mid-conversation, generate images, and analyze files.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <Link href="/register">
                <button className="group px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all inline-flex items-center gap-2">
                  Get started free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/login">
                <button className="px-6 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  Sign in
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-4 gap-8 max-w-lg mx-auto"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Models Grid */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-3">Choose from 10+ models</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Each model has unique strengths. Switch anytime — your conversation stays intact.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {MODELS_PREVIEW.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border hover:border-foreground/20 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <m.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{m.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-3">Everything you need</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Built for developers, researchers, and curious minds.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, title: "Conversation memory", desc: "Your chat history persists across sessions. Pick up where you left off." },
                { icon: Zap, title: "File analysis", desc: "Upload images, code, PDFs, and documents. AI reads and analyzes them." },
                { icon: ImageIcon, title: "Image generation", desc: "Generate images with DALL·E. Describe what you want and watch it create." },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-card border border-border"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-lg mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold tracking-tight mb-3">Ready to get started?</h2>
              <p className="text-sm text-muted-foreground mb-8">
                No credit card required. Free tier gives you 50 chats/day.
              </p>
              <Link href="/register">
                <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all">
                  Create free account
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">NeuroAI</span>
          </div>
          <div className="text-xs text-muted-foreground/40">
            © 2026 NeuroAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
