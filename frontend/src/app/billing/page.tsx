"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import {
  Sparkles, Check, Copy, Upload, Loader2, CheckCircle2, XCircle,
  Crown, Zap, Infinity, ArrowRight, Clock, Shield, ChevronRight,
  Wallet, Banknote, CreditCard, Download, Search, FileText, Eye,
  MessageSquare, Image as ImageIcon, Bot, Phone,
  Brain,
} from "lucide-react";
import { Toaster, toast } from "sonner";

const PLANS = [
  {
    key: "basic", name: "Basic", price: 199,
    desc: "For starters",
    features: ["200 chats/day", "All AI models", "Basic support"],
    icon: Sparkles, color: "from-green-500 to-green-600", popular: false,
  },
  {
    key: "pro", name: "Pro", price: 499,
    desc: "Perfect for daily use",
    features: ["500 chats/day", "All AI models", "Image generation", "File analysis"],
    icon: Zap, color: "from-blue-500 to-blue-600", popular: true,
  },
  {
    key: "premium", name: "Premium", price: 999,
    desc: "For power users",
    features: ["Unlimited chats", "All AI models", "Image generation", "Priority support", "Early access"],
    icon: Crown, color: "from-amber-500 to-amber-600", popular: false,
  },
];

const STEPS = ["Choose Plan", "Pay via UPI", "Upload Screenshot", "Wait for Approval"];

export default function BillingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("pro");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [vr, setVr] = useState<Record<string, any>>({show: false});
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!api.getToken()) { router.push("/login"); return; }
    api.getMyPayments().then(d => setPayments(Array.isArray(d) ? d : [])).catch(() => {});
    api.getProfile().then(d => setProfile(d)).catch(() => {});
  }, []);

  const plan = PLANS.find(p => p.key === selected)!;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      setFilePreview(URL.createObjectURL(f));
      setCurrentStep(4);
    }
  };

  const [successData, setSuccessData] = useState<any>(null);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setVr({show: false});
    setSuccessData(null);
    const form = new FormData();
    form.append("plan", selected);
    form.append("amount", String(plan.price));
    form.append("upi_id", "toxic-karthik.sai@fam");
    form.append("file", file);
    try {
      const data = await api.initiatePayment(form);
      setSuccessData(data);
      setSuccess(true);
      toast.success("Payment submitted for admin review!");
      api.getMyPayments().then(d => setPayments(Array.isArray(d) ? d : [])).catch(() => {});
      api.getProfile().then(d => setProfile(d)).catch(() => {});
    } catch (err: any) {
      try {
        const raw = typeof err?.message === "string" ? err.message : "{}";
        const detail = JSON.parse(raw)?.detail || JSON.parse(raw);
        if (detail?.error === "ACCOUNT_BANNED") {
          setVr({show:true,banned:true,score:0,analysis:detail.reason||"",checks:[],reasons:["Account banned"],used:10,left:0,banReason:detail.reason||""});
          toast.error("Account Banned! Contact admin.");
        } else if (detail?.error === "INVALID_PAYMENT_SCREENSHOT") {
          setVr({show:true,banned:false,score:detail.score||0,analysis:detail.ai_analysis||"",checks:detail.checks||[],reasons:detail.rejection_reasons||[],used:detail.attempts_used||0,left:detail.attempts_remaining||0,banReason:"",detectedApp:detail.detected_app||null});
          toast.error("Verification Failed! See report below.");
        } else {
          toast.error(detail?.message || err.message);
        }
      } catch { toast.error(err?.message || "Upload failed."); }
    }
    setLoading(false);
  };


  const goToStep = (step: number) => {
    if (step === 2) { setCurrentStep(2); return; }
    if (step === 3 && currentStep >= 2) { setCurrentStep(3); return; }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[11px] font-medium"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[11px] font-medium"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-medium"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  if (success && profile?.subscription_status === "active") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <HeaderSection />
        <main className="flex-1 flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">You're a {profile?.subscription_plan} member! 🎉</h1>
            <p className="text-sm text-muted-foreground mb-8">Your subscription is active. Enjoy unlimited access to NeuroAI.</p>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-8 text-left">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Plan</span><p className="font-semibold capitalize">{profile?.subscription_plan}</p></div>
                <div><span className="text-muted-foreground">Status</span><p className="font-semibold text-green-500">Active</p></div>
                <div><span className="text-muted-foreground">Email</span><p className="font-semibold">{profile?.email}</p></div>
                <div><span className="text-muted-foreground">Member since</span><p className="font-semibold">{new Date(profile?.created_at).toLocaleDateString()}</p></div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/chat"><button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Go to Chat</button></Link>
              <Link href="/profile"><button className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground">View Profile</button></Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" toastOptions={{
        style: { background: "var(--color-card)", color: "var(--color-foreground)", border: "1px solid var(--color-border)" },
      }} />
      <HeaderSection />
      
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Upgrade to Premium</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Unlock all AI models, unlimited chats, and premium features.</p>
          </div>

          {/* Status Banner */}
          {profile?.subscription_status === "active" && (
            <div className="max-w-lg mx-auto mb-8 p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div className="text-sm"><span className="font-medium">Active {profile?.subscription_plan} plan</span> — You have full access!</div>
              <Link href="/chat" className="ml-auto text-sm font-medium text-green-500 hover:underline shrink-0">Chat now →</Link>
            </div>
          )}

          {/* Two columns: Plans + Payment Flow */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Plans */}
            <div className="lg:col-span-3 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Choose your plan</h2>
              {PLANS.map((p, i) => {
                const Icon = p.icon;
                const isSelected = selected === p.key;
                return (
                  <motion.button
                    key={p.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => { setSelected(p.key); if (currentStep > 1) setCurrentStep(1); }}
                    className={`w-full relative p-5 rounded-2xl border-2 text-left transition-all group ${
                      isSelected
                        ? 'border-foreground/30 bg-secondary shadow-lg'
                        : 'border-border bg-card hover:border-foreground/20 hover:bg-secondary/50'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-semibold shadow-lg">
                        POPULAR
                      </span>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold">{p.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">₹{p.price}{p.key !== "lifetime" ? <span className="text-xs">/mo</span> : ""}</span>
                          </div>
                          {isSelected && <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center"><Check className="w-3.5 h-3.5 text-background" /></div>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {p.features.map(f => (
                            <span key={f} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary border border-border">
                              <Check className="w-3 h-3 text-green-500" /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Right: Payment Flow */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Payment Steps</h2>
                
                {/* Steps */}
                <div className="p-5 rounded-2xl bg-card border border-border">
                  <div className="space-y-0">
                    {STEPS.map((step, i) => {
                      const stepNum = i + 1;
                      const isComplete = stepNum < currentStep;
                      const isCurrent = stepNum === currentStep;
                      return (
                        <div key={step} className="flex items-start gap-3 relative">
                          {i < STEPS.length - 1 && (
                            <div className={`absolute left-3.5 top-8 w-0.5 h-10 ${isComplete ? 'bg-green-500' : 'bg-border'}`} />
                          )}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 ${
                            isComplete ? 'bg-green-500 text-white' :
                            isCurrent ? 'bg-foreground text-background' :
                            'bg-secondary text-muted-foreground border border-border'
                          }`}>
                            {isComplete ? <Check className="w-3.5 h-3.5" /> : stepNum}
                          </div>
                          <div className="pb-6">
                            <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : isComplete ? 'text-green-500' : 'text-muted-foreground'}`}>{step}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border pt-4 mt-2 space-y-4">
                    {/* Step 1: Show selected plan summary */}
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Selected Plan</p>
                          <p className="font-bold text-lg">{plan.name}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                          <plan.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold">₹{plan.price}{plan.key !== "lifetime" ? <span className="text-xs text-muted-foreground">/mo</span> : ""}</span>
                      </div>
                      <button onClick={() => setCurrentStep(2)} className="w-full mt-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
                        Continue to Payment →
                      </button>
                    </div>

                    {/* Step 2: UPI Details */}
                    {currentStep >= 2 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 rounded-xl bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-2">Send exact amount to:</p>
                        <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                          <Wallet className="w-4 h-4 text-amber-500 shrink-0" />
                          <code className="text-sm font-mono text-amber-500 flex-1">toxic-karthik.sai@fam</code>
                          <button onClick={() => { navigator.clipboard.writeText("toxic-karthik.sai@fam"); setCopied(true); toast.success("UPI ID copied!"); setTimeout(() => setCopied(false), 2000); }}
                            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-muted-foreground">Amount to pay</span>
                          <div>
                            <span className="font-bold text-lg">₹{plan.price}</span>
                          </div>
                        </div>
                        <button onClick={() => setCurrentStep(3)} className="w-full mt-3 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-all">
                          I've Paid — Upload Screenshot →
                        </button>
                      </motion.div>
                    )}

                    {/* Step 3: Upload */}
                    {currentStep >= 3 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                        <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-amber-500/30 transition-all bg-secondary/30">
                          {filePreview ? (
                            <div className="relative w-full">
                              <img src={filePreview} alt="Screenshot preview" className="w-full h-32 object-cover rounded-lg" />
                              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <span className="text-xs text-white">Click to change</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-xs text-muted-foreground">Click to upload payment screenshot</span>
                              <span className="text-[10px] text-muted-foreground/50 mt-1">PNG, JPG accepted</span>
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </label>

                        {file && (
                          <button onClick={handleSubmit} disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI Scanning...</> : <><CheckCircle2 className="w-4 h-4" /> Submit for Approval</>}
                          </button>
                        )}

                        {/* VERIFICATION REPORT */}
                        {vr.show && !vr.banned && (
                          <div className="rounded-2xl border overflow-hidden bg-card">
                            <div className="p-4 bg-gradient-to-r from-red-500/10 to-red-600/5 border-b border-red-500/20">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 text-xl">X</div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-red-400">Verification Failed</p>
                                  <p className="text-xs text-red-300/80">AI rejected this screenshot</p>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-400">{vr.score}</div>
                                  <div className="text-[9px] text-red-300/60 uppercase">Score</div>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 space-y-3">
                              {vr.analysis && <div><p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">AI DETECTION</p><div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-xs text-red-400">{vr.analysis}</p></div></div>}
                              {vr.reasons && vr.reasons.length > 0 && <div><p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">FAILED CHECKS</p>{vr.reasons.map((r:any,i:number) => <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 mb-1"><span className="text-red-400 text-xs">-</span><p className="text-xs text-red-300">{r}</p></div>)}</div>}
                              {vr.checks && vr.checks.length > 0 && <div><p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">CHECKS</p>{vr.checks.map((c:any,i:number) => <div key={i} className={"flex items-center gap-2 p-2 rounded-lg text-xs mb-0.5 " + (c.passed ? "bg-emerald-500/5" : "bg-red-500/5")}><span>{c.passed ? "OK" : "NO"}</span><span className={"font-medium " + (c.passed ? "text-emerald-400" : "text-red-400")}>{c.name}</span><span className="text-muted-foreground ml-1">{c.detail}</span></div>)}</div>}
                              <div className={"p-2 rounded-lg flex items-center gap-2 text-xs " + (vr.left <= 3 ? "bg-red-500/10 text-red-300" : vr.left <= 6 ? "bg-amber-500/10 text-amber-300" : "bg-secondary/50 text-muted-foreground")}><span>Warning</span><span><strong>{vr.used}/10 used.</strong> {vr.left > 0 ? vr.left + " remaining." : "No attempts left!"}</span></div>
                            </div>
                          </div>
                        )}
                        {vr.show && vr.banned && (
                          <div className="rounded-2xl border overflow-hidden bg-card">
                            <div className="p-4 bg-gradient-to-r from-red-600 to-red-800">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-white text-xl">!</div>
                                <div><p className="text-sm font-bold text-white">Account Banned</p><p className="text-xs text-red-200">{vr.banReason}</p></div>
                              </div>
                            </div>
                            <div className="p-4"><div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"><p className="text-xs text-red-400 font-medium">Banned</p><p className="text-xs text-red-300/80 mt-1">Contact admin to appeal.</p></div></div>
                          </div>
                        )}

                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUCCESS REPORT - Premium */}
          {success && successData && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-2xl border overflow-hidden bg-card"
            >
              <div className="p-5 bg-gradient-to-r from-emerald-500/20 to-green-600/10 border-b border-emerald-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-emerald-400">Payment Submitted Successfully!</h3>
                    <p className="text-sm text-emerald-300/80">Your payment screenshot has been received and sent for admin review.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Plan</p>
                    <p className="text-sm font-bold capitalize mt-0.5">{plan.name}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Amount</p>
                    <p className="text-sm font-bold mt-0.5">Rs.{plan.price}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-400">Awaiting Admin Approval</p>
                    <p className="text-[10px] text-emerald-300/60">You will be notified once approved</p>
                  </div>
                </div>
                <Link href="/chat">
                  <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all inline-flex items-center justify-center gap-2">
                    Continue to Chat
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Payment History
              </h2>
              <div className="space-y-2">
                {payments.map((p: any) => (
                  <div key={p.id} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        p.status === 'approved' ? 'bg-green-500/10' : p.status === 'rejected' ? 'bg-red-500/10' : 'bg-amber-500/10'
                      }`}>
                        {p.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                         p.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-500" /> :
                         <Clock className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{p.plan} Plan</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{p.amount}</p>
                      {getStatusBadge(p.status)}
                      {p.admin_notes && <p className="text-[10px] text-muted-foreground mt-1">"{p.admin_notes}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-600/5 border border-green-500/20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">Payment Submitted! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-4">Admin will review and approve shortly.</p>
              <Link href="/chat"><button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Continue to Chat</button></Link>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function HeaderSection() {
  const router = useRouter();
  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
      <Link href="/chat" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight">Neuro<span className="text-amber-500">AI</span></span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/chat"><button className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Chat</button></Link>
        <Link href="/profile"><button className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Profile</button></Link>
        <button onClick={() => { api.clearToken(); router.push("/login"); }}
          className="text-xs text-muted-foreground hover:text-red-500 px-3 py-1.5">Sign out</button>
      </div>
    </header>
  );
}
