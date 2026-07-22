"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import {
  User, Crown, CheckCircle2, XCircle, Clock, Sparkles, Brain,
  MessageSquare, Zap, Calendar, Mail, Shield, CreditCard, LogOut,
  ArrowRight, Copy, Check, Loader2, Heart, Gift, Star, Gem, Infinity
} from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!api.getToken()) { router.push("/login"); return; }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch { router.push("/login"); }
    setLoading(false);
  };

  const logout = () => { api.clearToken(); router.push("/login"); };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
    </div>
  );

  const isActive = profile?.subscription_status === "active" || profile?.subscription_status === "active";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" toastOptions={{
        style: { background: "var(--color-card)", color: "var(--color-foreground)", border: "1px solid var(--color-border)" },
      }} />

      {/* Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <Link href="/chat" className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-tight">NeuroAI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/chat"><button className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Chat</button></Link>
          <Link href="/billing"><button className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Billing</button></Link>
          <button onClick={logout} className="text-xs text-muted-foreground hover:text-red-500 px-3 py-1.5">Sign out</button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Thank You / Active Status Banner */}
          {isActive ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-purple-500/10 border border-emerald-500/20 mb-8 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/20">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                  Thank You! 🎉
                </h1>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You're a valued <strong className="text-foreground capitalize">{profile?.subscription_plan}</strong> member! 
                  We appreciate your support and trust in NeuroAI.
                </p>
                
                {/* Premium Features Accessible */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
                  {[
                    { icon: Infinity, label: "Unlimited", color: "from-purple-400 to-purple-600" },
                    { icon: Zap, label: "All Models", color: "from-amber-400 to-amber-600" },
                    { icon: Star, label: "Priority", color: "from-rose-400 to-rose-600" },
                  ].map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/50 text-center">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-1`}>
                        <f.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-[10px] font-medium">{f.label}</p>
                    </div>
                  ))}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-medium capitalize">{profile?.subscription_plan} Plan Active</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Upgrade CTA for non-active users */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/20 mb-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
              <p className="text-sm text-muted-foreground mb-4">Unlock unlimited chats, all AI models, and more.</p>
              <Link href="/billing">
                <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-medium inline-flex items-center gap-2 shadow-lg shadow-amber-500/20">
                  View Plans <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          )}

          {/* Profile Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{profile?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{profile?.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Role</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[11px]">
                    <Shield className="w-3 h-3" /> {profile?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API calls today</span>
                  <span className="font-medium">{profile?.api_calls_today || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Crown className="w-3.5 h-3.5" /> Subscription
              </h3>
              {isActive ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{profile?.subscription_plan} Plan</p>
                      <p className="text-xs text-emerald-400">Active</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    <Heart className="w-3.5 h-3.5 inline mr-1 text-red-400" />
                    Thank you for supporting NeuroAI!
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Free Plan</p>
                  <p className="text-xs text-muted-foreground/60">Upgrade to unlock premium features.</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {profile?.payments && profile.payments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment History
              </h2>
              <div className="space-y-2">
                {profile.payments.map((p: any) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border transition-all ${
                      p.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/20' :
                      p.status === 'rejected' ? 'bg-red-500/5 border-red-500/20' :
                      'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          p.status === 'approved' ? 'bg-emerald-500/10' :
                          p.status === 'rejected' ? 'bg-red-500/10' : 'bg-amber-500/10'
                        }`}>
                          {p.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                           p.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-400" /> :
                           <Clock className="w-5 h-5 text-amber-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{p.plan} Plan</p>
                          <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">₹{p.amount}</p>
                        {getStatusBadge(p.status)}
                        {p.admin_notes && (
                          <p className="text-[10px] text-muted-foreground mt-1 italic">"{p.admin_notes}"</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/chat">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-foreground/20 transition-all group">
                <MessageSquare className="w-5 h-5 mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                <p className="text-sm font-medium">Go to Chat</p>
                <p className="text-xs text-muted-foreground">Continue your conversations</p>
              </div>
            </Link>
            <Link href="/billing">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-foreground/20 transition-all group">
                <Sparkles className="w-5 h-5 mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                <p className="text-sm font-medium">{isActive ? 'Manage Plan' : 'Upgrade'}</p>
                <p className="text-xs text-muted-foreground">{isActive ? 'View subscription details' : 'See available plans'}</p>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-muted-foreground/30 mt-8">
            NeuroAI v1.0 · Made with <Heart className="w-3 h-3 inline text-red-400/50" /> for you
          </p>
        </motion.div>
      </main>
    </div>
  );
}
