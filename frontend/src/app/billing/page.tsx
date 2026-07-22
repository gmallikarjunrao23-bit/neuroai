"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Sparkles, ArrowLeft, Check, Copy, Upload, Loader2, CheckCircle2, LogOut } from "lucide-react";

const PLANS = [
  { key: "pro", name: "Pro", price: 499, desc: "500 chats/day, all models, image gen" },
  { key: "premium", name: "Premium", price: 999, desc: "Unlimited chats, all models, priority" },
  { key: "lifetime", name: "Lifetime", price: 4999, desc: "One-time, lifetime access" },
];

export default function BillingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("pro");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!api.getToken()) { router.push("/login"); return; }
    api.getMyPayments().then(d => setPayments(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    const plan = PLANS.find(p => p.key === selected)!;
    const form = new FormData();
    form.append("plan", selected);
    form.append("amount", String(plan.price));
    form.append("upi_id", "toxic-karthik.sai@fam");
    form.append("file", file);
    try { await api.initiatePayment(form); setSuccess(true); } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border glass flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Neuro<span className="text-indigo-500">AI</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/chat"><button className="text-sm text-muted-foreground hover:text-foreground">Back to chat</button></Link>
          <button onClick={() => { api.clearToken(); router.push("/login"); }} className="text-sm text-muted-foreground hover:text-red-500"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Upgrade</h1>
          <p className="text-sm text-muted-foreground mb-8">Choose a plan and pay via UPI.</p>

          {!success && (
            <>
              <div className="space-y-2 mb-6">
                {PLANS.map((plan) => (
                  <button key={plan.key} onClick={() => setSelected(plan.key)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selected === plan.key ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-border bg-card hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{plan.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">₹{plan.price}{plan.key !== "lifetime" ? "/mo" : ""}</span>
                      </div>
                      {selected === plan.key && <Check className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-secondary border border-border mb-4">
                <p className="text-xs text-muted-foreground mb-2">Send exact amount to:</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-indigo-500">toxic-karthik.sai@fam</code>
                  <button onClick={() => { navigator.clipboard.writeText("toxic-karthik.sai@fam"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-lg font-bold mt-2">₹{PLANS.find(p => p.key === selected)?.price}</div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Upload payment screenshot</label>
                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">{file ? file.name : "Click to upload"}</span>
                  <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>

              <button onClick={submit} disabled={!file || loading}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for approval"}
              </button>
            </>
          )}

          {success && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-lg font-bold mb-2">Submitted! 🎉</h2>
              <p className="text-sm text-muted-foreground mb-6">Admin will approve within 24 hours.</p>
              <Link href="/chat"><button className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Continue chatting</button></Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
