"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import {
  Brain, Users, CreditCard, CheckCircle2, XCircle, Eye, Loader2,
  DollarSign, Search, ChevronDown, Clock, Shield, LogOut, Sparkles,
  Ban, Check, MessageSquare, Filter, RefreshCw, ArrowUpRight, FileText,
  Crown, ChevronRight
} from "lucide-react";
import { Toaster, toast } from "sonner";

const API_BASE = "https://backend-production-87c9.up.railway.app";

export default function AdminPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("payments");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandPayment, setExpandPayment] = useState<string | null>(null);

  useEffect(() => {
    if (!api.getToken()) { router.push("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dash, usersData, paymentsData] = await Promise.all([
        api.getAdminDashboard(), api.getAdminUsers(), api.getAdminPayments()
      ]);
      setDashboard(dash);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err: any) {
      const msg = err?.message || "Failed to load admin data";
      if (msg.includes("403") || msg.includes("Admin access")) {
        toast.error("You need admin access. Use /chat page and visit /api/v1/auth/become-admin first.");
      } else if (msg.includes("401") || msg.includes("Unauthorized")) {
        router.push("/login");
        return;
      }
    }
    setLoading(false);
  };

  const approvePayment = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await api.approvePayment(id, status, adminNotes[id] || "");
      toast.success(status === "approved" ? "✅ Payment Approved!" : "❌ Payment Rejected");
      await fetchAll();
    } catch { toast.error("Action failed"); }
    setActionLoading(null);
  };

  const toggleKyc = async (userId: string, userName: string) => {
    await api.toggleKyc(userId);
    toast.success(`${userName} KYC updated`);
    await fetchAll();
  };

  const logout = () => { api.clearToken(); router.push("/login"); };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-medium"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const filteredPayments = filterStatus === "all" ? payments : payments.filter(p => p.status === filterStatus);
  const pendingCount = payments.filter(p => p.status === "pending").length;

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/50 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" toastOptions={{
        style: { background: "var(--color-card)", color: "var(--color-foreground)", border: "1px solid var(--color-border)" },
      }} />

      {/* Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Neuro<span className="text-purple-500">Admin</span></span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">ENTERPRISE</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/chat"><button className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Back to App</button></Link>
          <button onClick={logout} className="p-2 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Users, label: "Total Users", value: dashboard?.total_users || 0, color: "from-blue-500 to-blue-600", change: "+12%" },
              { icon: CreditCard, label: "Payments", value: dashboard?.total_payments || 0, color: "from-green-500 to-green-600", change: "+5%" },
              { icon: Clock, label: "Pending", value: pendingCount, color: "from-amber-500 to-amber-600", change: "", highlight: pendingCount > 0 },
              { icon: DollarSign, label: "Revenue", value: `₹${dashboard?.revenue || 0}`, color: "from-purple-500 to-purple-600", change: "" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl bg-card border ${s.highlight ? 'border-amber-500/30 ring-1 ring-amber-500/20' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${s.color}`}><s.icon className="w-4 h-4 text-white" /></div>
                  {s.change && <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">{s.change}</span>}
                </div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-border mb-6 gap-0">
            {[
              { key: "payments", label: "Payments", icon: CreditCard, count: pendingCount },
              { key: "users", label: "Users", icon: Users, count: 0 },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.key ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div>
              {/* Filter */}
              <div className="flex items-center gap-2 mb-4">
                {["all", "pending", "approved", "rejected"].map(status => (
                  <button key={status} onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterStatus === status ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground hover:text-foreground border border-transparent'
                    }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {filteredPayments.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No {filterStatus !== "all" ? filterStatus : ""} payments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredPayments.map((p: any) => (
                      <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl bg-card border transition-all ${
                          p.status === 'pending' ? 'border-amber-500/30 shadow-sm shadow-amber-500/5' : 'border-border'
                        }`}>
                        <div className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{p.user_name}</span>
                                {getStatusBadge(p.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">{p.user_email}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                <span>Plan: <strong className="text-foreground capitalize">{p.plan}</strong></span>
                                <span>Amount: <strong className="text-foreground">₹{p.amount}</strong></span>
                                <span>UPI: <strong className="text-foreground">{p.upi_id}</strong></span>
                                <span>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 lg:items-end">
                              {/* Screenshot */}
                              {p.screenshot_path && (
                                <a href={`${API_BASE}${p.screenshot_path}`} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> View Screenshot
                                </a>
                              )}

                              {/* Approve/Reject for pending */}
                              {p.status === 'pending' && (
                                <div className="flex flex-col gap-2">
                                  <textarea
                                    placeholder="Admin notes (optional)..."
                                    className="w-48 text-[11px] bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 outline-none resize-none h-14 placeholder:text-muted-foreground/30"
                                    value={adminNotes[p.id] || ""}
                                    onChange={e => setAdminNotes({...adminNotes, [p.id]: e.target.value})}
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => approvePayment(p.id, "approved")} disabled={actionLoading === p.id}
                                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-all disabled:opacity-50">
                                      {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                      Approve
                                    </button>
                                    <button onClick={() => approvePayment(p.id, "rejected")} disabled={actionLoading === p.id}
                                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-all disabled:opacity-50">
                                      {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                              {p.admin_notes && p.status !== 'pending' && (
                                <p className="text-[10px] text-muted-foreground italic">Admin note: {p.admin_notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">User</th>
                      <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Role</th>
                      <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Plan</th>
                      <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">KYC</th>
                      <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Chats</th>
                      <th className="text-right p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No users found</td></tr>
                    ) : (
                      users.map((u: any, i: number) => (
                        <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{u.name}</p>
                                <p className="text-[11px] text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-secondary text-muted-foreground border border-border'
                            }`}>
                              {u.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              u.subscription_status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-secondary text-muted-foreground border border-border'
                            }`}>
                              {u.subscription_status === 'active' && <Crown className="w-3 h-3" />}
                              {u.subscription_plan !== 'none' ? u.subscription_plan : 'Free'}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.kyc_verified 
                              ? <span className="inline-flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                              : <span className="inline-flex items-center gap-1 text-amber-400 text-xs"><Clock className="w-3.5 h-3.5" /> Pending</span>
                            }
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{u.api_calls_today}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => toggleKyc(u.id, u.name)}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                                Toggle KYC
                              </button>
                              {u.role !== 'admin' && (
                                <span className="text-[10px] text-muted-foreground/50">{u.created_at?.slice(0, 10)}</span>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
