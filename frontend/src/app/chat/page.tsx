"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { ThinkingIndicator } from "@/components/chat/ThinkingIndicator";
import { FileUpload } from "@/components/chat/FileUpload";
import { Toaster, toast } from "sonner";
import {
  ChevronDown,
  PanelLeft,
  Plus,
  SendHorizontal,
  MessageSquare,
  Moon,
  Sun,
  Brain,
  Sparkles,
  Bot,
  Code2,
  Zap,
  Image as ImageIcon,
  Search,
  X,
  Clock,
  User,
  Keyboard,
} from "lucide-react";

const API_BASE = "https://backend-production-87c9.up.railway.app";

const MODELS = [
  { id: "gpt-5", label: "GPT-5", icon: Brain, desc: "Latest GPT generation", color: "from-purple-500 to-purple-600" },
  { id: "gemini", label: "Gemini", icon: Sparkles, desc: "Google Gemini AI", color: "from-amber-500 to-amber-600" },
  { id: "deepseek-v3", label: "DeepSeek V3", icon: Zap, desc: "Latest DeepSeek model", color: "from-cyan-500 to-cyan-600" },
  { id: "deepseek-r1", label: "DeepSeek R1", icon: Brain, desc: "Reasoning model", color: "from-teal-500 to-teal-600" },
  { id: "llama-meta", label: "Llama 3", icon: Bot, desc: "Meta's open-source LLM", color: "from-orange-500 to-orange-600" },
  { id: "gpt-logic", label: "GPT Logic", icon: Bot, desc: "Advanced reasoning", color: "from-blue-500 to-blue-600" },
  { id: "gpt-3", label: "GPT-3", icon: Bot, desc: "Classic GPT-3 model", color: "from-sky-500 to-sky-600" },
  { id: "copilot", label: "Copilot", icon: Code2, desc: "Code-focused assistant", color: "from-green-500 to-emerald-600" },
  { id: "deep-ai", label: "Deep AI", icon: Sparkles, desc: "Deep learning model", color: "from-indigo-500 to-indigo-600" },
  { id: "dalle", label: "DALL·E", icon: ImageIcon, desc: "AI Image Generation", color: "from-pink-500 to-pink-600" },
];

function makeId() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python script to analyze CSV data",
  "What's the best way to learn TypeScript?",
  "Help me debug a React component",
];

function getThinkingText(model: string): string {
  const map: Record<string, string> = {
    "gpt-5": "GPT-5 is thinking",
    "gemini": "Gemini is analyzing",
    "deepseek-v3": "DeepSeek is processing",
    "deepseek-r1": "DeepSeek is reasoning",
    "llama-meta": "Llama is generating",
    "gpt-logic": "GPT Logic is computing",
    "gpt-3": "GPT-3 is responding",
    "copilot": "Copilot is coding",
    "deep-ai": "Deep AI is analyzing",
    "dalle": "DALL·E is creating",
  };
  return map[model] || "Thinking";
}

export default function ChatPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const [showModels, setShowModels] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [dark, setDark] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [modelSearch, setModelSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const modelSearchRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showCmdK, setShowCmdK] = useState(false);

  useEffect(() => {
    if (!api.getToken()) { router.push("/login"); return; }
    document.documentElement.classList.add("dark");
    newConversation();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [msgs, busy]);

  const toggleDark = () => { setDark(!dark); document.documentElement.classList.toggle("dark"); };

  const newConversation = () => {
    setMsgs([]);
    setSessionId(makeId());
    setInput("");
    setFiles([]);
    loadSessions();
  };

  const loadSessions = async () => {
    try { const r = await api.getSessions(); if (Array.isArray(r)) setSessions(r); } catch {}
  };

  const loadSession = async (sid: string) => {
    setSessionId(sid); setSidebar(false);
    try {
      const r = await api.getChatHistory(sid);
      if (Array.isArray(r)) {
        const loaded = r.reverse().flatMap((c: any) => [
          { role: "user", content: c.prompt },
          { role: "assistant", content: c.response, model: c.model, image_url: c.image_url, reasoning: c.reasoning }
        ]);
        setMsgs(loaded);
      }
    } catch {}
  };

  const deleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Since there's no delete endpoint, just remove from UI
    setSessions(prev => prev.filter(s => s.session_id !== sid));
  };

  const send = async () => {
    const text = input.trim();
    if (!text && files.length === 0) return;
    const toSend = [...files];
    setMsgs((p: any) => [...p, { role: "user", content: text || "See attached files", files: toSend }]);
    setInput(""); setFiles([]);
    if (taRef.current) taRef.current.style.height = "auto";
    setBusy(true);
    try {
      const r = await api.chat(model.id, text || "Analyze attached files", sessionId, toSend);
      const m: any = { role: "assistant", content: r.response || "No response", model: model.label };
      if (r.image_url) m.image_url = r.image_url;
      if (r.reasoning) m.reasoning = r.reasoning;
      setMsgs((p: any) => [...p, m]);
      loadSessions();
    } catch (err: any) {
      toast.error(err?.message || "Failed to get response");
      setMsgs((p: any) => [...p, { role: "assistant", content: "Sorry, I encountered an error. Please try again.", model: model.label, error: true }]);
    }
    setBusy(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K = open model search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCmdK(true);
        setModelSearch("");
        setTimeout(() => modelSearchRef.current?.focus(), 100);
      }
      // Cmd/Ctrl + Shift + N = new conversation
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "n") {
        e.preventDefault();
        newConversation();
      }
      // Escape = close modals
      if (e.key === "Escape") {
        setShowCmdK(false);
        setShowModels(false);
        setSidebar(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filteredModels = MODELS.filter(m =>
    m.label.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.desc.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const selectModel = (m: typeof MODELS[0]) => {
    setModel(m);
    setShowCmdK(false);
    setShowModels(false);
    setModelSearch("");
    toast.success(`Switched to ${m.label}`);
  };

  // Claude-style Anthropic mark icon
  const NeuroMark = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  );

  // Message variants for animation
  const messageVariants = {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  // Cmd+K Modal
  const CmdKModal = () => {
    if (!showCmdK) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setShowCmdK(false)}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={modelSearchRef}
              value={modelSearch}
              onChange={e => setModelSearch(e.target.value)}
              placeholder="Search models..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">ESC</kbd>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredModels.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">No models found</div>
            ) : (
              filteredModels.map(m => (
                <button
                  key={m.id}
                  onClick={() => selectModel(m)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    model.id === m.id ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0`}>
                    <m.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                  {model.id === m.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  )}
                </button>
              ))
            )}
          </div>
          <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-secondary/50">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Keyboard className="w-3 h-3" /> <kbd className="px-1 py-0.5 rounded bg-background border border-border font-mono">↑↓</kbd> navigate
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-background border border-border font-mono">⏎</kbd> select
            </span>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "var(--color-card)", color: "var(--color-foreground)", border: "1px solid var(--color-border)" },
          className: "text-sm",
        }}
      />

      {/* Cmd+K Modal */}
      <AnimatePresence>
        <CmdKModal />
      </AnimatePresence>

      {/* Sidebar — Claude style with animations */}
      <AnimatePresence>
        {sidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setSidebar(false)}
            />
            <motion.aside
              ref={sidebarRef}
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-background border-r border-border flex flex-col"
            >
              <div className="h-12 px-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                    <NeuroMark />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">NeuroAI</span>
                </div>
                <button onClick={() => setSidebar(false)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button onClick={newConversation}
                className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors group">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                New conversation
                <kbd className="ml-auto text-[10px] px-1 py-0.5 rounded bg-secondary text-muted-foreground/60 font-mono border border-border">
                  <span className="text-[8px]">⌘</span>⇧N
                </kbd>
              </button>

              <div className="flex-1 overflow-y-auto p-3 mt-2 space-y-0.5">
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground/50">No conversations yet</p>
                  </div>
                ) : (
                  sessions.map((s: any) => (
                    <motion.button
                      key={s.session_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => loadSession(s.session_id)}
                      className={`w-full group text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        s.session_id === sessionId
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/50" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px]">{s.preview || "New conversation"}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground/40" />
                            <span className="text-[10px] text-muted-foreground/40">{s.msg_count} messages</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-border space-y-1">
                <Link href="/profile"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link href="/billing"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Sparkles className="w-4 h-4" /> Upgrade
                </Link>
                <button onClick={() => { api.clearToken(); router.push("/login"); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-colors">
                  Sign out
                </button>
                <div className="text-[10px] text-muted-foreground/30 px-3">
                  NeuroAI v1.0
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — clean, minimal */}
        <header className="h-12 border-b border-border flex items-center px-3 bg-background shrink-0">
          <button onClick={() => setSidebar(true)}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
            <PanelLeft className="w-4.5 h-4.5" />
          </button>

          <div className="ml-3 relative">
            <button onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-md hover:bg-secondary transition-colors group">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                <model.icon className="w-3 h-3 text-white" />
              </div>
              {model.label}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <AnimatePresence>
              {showModels && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowModels(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-background border border-border rounded-xl shadow-xl p-1 z-20"
                  >
                    {MODELS.map(m => (
                      <button key={m.id} onClick={() => { setModel(m); setShowModels(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          model.id === m.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                        }`}>
                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0`}>
                          <m.icon className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-[13px] font-medium">{m.label}</div>
                          <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                        </div>
                        {model.id === m.id && <div className="w-1 h-1 rounded-full bg-foreground" />}
                      </button>
                    ))}
                    <div className="border-t border-border mt-1 pt-1 px-2 pb-1">
                      <button onClick={() => { setShowModels(false); setShowCmdK(true); setTimeout(() => modelSearchRef.current?.focus(), 150); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
                        <Search className="w-3 h-3" />
                        Search models...
                        <kbd className="ml-auto text-[9px] px-1 py-0.5 rounded bg-secondary border border-border font-mono">⌘K</kbd>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button onClick={newConversation} title="New conversation (⌘⇧N)"
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors hidden sm:block">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={toggleDark} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {msgs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center max-w-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                  <NeuroMark />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight mb-2">What would you like to know?</h1>
                <p className="text-sm text-muted-foreground mb-8">Ask <span className="text-foreground font-medium">{model.label}</span> anything.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="grid grid-cols-2 gap-2 w-full max-w-md"
              >
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                    onClick={() => { setInput(s); taRef.current?.focus(); }}
                    className="text-left px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary hover:border-foreground/20 transition-all text-[13px] text-muted-foreground hover:text-foreground leading-snug"
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-[11px] text-muted-foreground/40 flex items-center gap-3"
              >
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-secondary border-border border text-[9px] font-mono">⌘K</kbd> Search models</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-secondary border-border border text-[9px] font-mono">⌘⇧N</kbd> New chat</span>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-[768px] mx-auto px-4 py-6 space-y-5">
              <AnimatePresence initial={false}>
                {msgs.map((m: any, i: number) => {
                  const userMsg = m.role === "user";
                  return (
                    <motion.div
                      key={`msg-${i}`}
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      className={`flex gap-3 ${userMsg ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl shrink-0 mt-0.5 flex items-center justify-center shadow-sm ${
                        userMsg
                          ? 'bg-secondary border border-border'
                          : m.error
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-foreground text-background'
                      }`}>
                        {userMsg ? (
                          <User className="w-4 h-4" />
                        ) : m.error ? (
                          <Zap className="w-4 h-4" />
                        ) : (
                          <NeuroMark />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 min-w-0 ${userMsg ? 'text-right' : ''}`}>
                        {/* Model badge for assistant */}
                        {!userMsg && m.model && !m.error && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className={`w-3.5 h-3.5 rounded-sm bg-gradient-to-br ${MODELS.find(x => x.label === m.model)?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                              {(() => {
                                const found = MODELS.find(x => x.label === m.model);
                                const Icon = found?.icon || Bot;
                                return <Icon className="w-2 h-2 text-white" />;
                              })()}
                            </div>
                            <span className="text-[11px] text-muted-foreground/60 font-medium">{m.model}</span>
                          </div>
                        )}

                        {/* Error badge */}
                        {!userMsg && m.error && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[11px] text-red-400/60 font-medium">Error</span>
                          </div>
                        )}

                        {/* Image response */}
                        {m.image_url ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl overflow-hidden border border-border inline-block shadow-sm"
                          >
                            <img src={`${API_BASE}${m.image_url}`} alt="" className="max-w-md h-auto" loading="lazy" />
                          </motion.div>
                        ) : userMsg ? (
                          <div className="inline-block max-w-[85%]">
                            {/* File previews for user */}
                            {m.files && m.files.length > 0 && (
                              <div className={`flex flex-wrap gap-2 mb-2 ${userMsg ? 'justify-end' : ''}`}>
                                {m.files.map((f: any, fi: number) => (
                                  f.type?.startsWith("image/")
                                    ? <div key={fi} className="rounded-lg overflow-hidden border border-border w-20 h-20 shadow-sm">
                                        <img src={`${API_BASE}${f.url}`} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    : <a key={fi} href={`${API_BASE}${f.url}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        <Code2 className="w-3.5 h-3.5" />{f.name}
                                      </a>
                                ))}
                              </div>
                            )}
                            <div className="px-4 py-2.5 rounded-2xl bg-secondary text-sm leading-relaxed text-left">
                              {m.content}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm leading-relaxed">
                            {/* Reasoning collapsible */}
                            {m.reasoning && (
                              <details className="mb-3 group">
                                <summary className="text-xs text-muted-foreground/50 cursor-pointer hover:text-foreground transition-colors select-none list-none flex items-center gap-1.5 py-1">
                                  <Brain className="w-3 h-3" />
                                  <span>Thought process</span>
                                  <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform duration-200" />
                                </summary>
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-2 p-4 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap"
                                >
                                  {m.reasoning}
                                </motion.div>
                              </details>
                            )}
                            <MarkdownRenderer content={m.content} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Thinking indicator */}
              {busy && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 shadow-sm">
                    <NeuroMark />
                  </div>
                  <div className="flex items-center gap-1.5 pt-2">
                    <ThinkingIndicator text={getThinkingText(model.id)} />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Input area — Claude style */}
        <div className="shrink-0 bg-background pb-3 pt-1">
          <div className="max-w-[768px] mx-auto px-4">
            <div className="flex items-end gap-1.5 p-2 rounded-2xl border border-border bg-card shadow-sm hover:border-foreground/20 focus-within:border-foreground/30 transition-colors duration-200">
              <FileUpload onFilesReady={setFiles} disabled={busy} />
              <textarea
                ref={taRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Message NeuroAI..."
                rows={1}
                className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none resize-none placeholder:text-muted-foreground/40 max-h-[160px] leading-relaxed"
              />
              <button
                onClick={send}
                disabled={(!input.trim() && files.length === 0) || busy}
                className="p-2 rounded-xl bg-foreground text-background disabled:opacity-20 transition-all hover:opacity-90 hover:scale-105 active:scale-95 shrink-0"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground/30 mt-2">
              NeuroAI may produce inaccurate information. Verify important facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
