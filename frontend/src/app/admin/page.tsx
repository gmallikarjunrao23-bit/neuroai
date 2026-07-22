"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import {
  Brain, Users, CreditCard, CheckCircle2, XCircle, Eye, Loader2,
  DollarSign, Clock, Shield, LogOut, Sparkles,
  Check, RefreshCw, Crown, Search,
  Ban, AlertTriangle, UserX, UserCheck, FileText, AlertCircle
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
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userAttempts, setUserAttempts] = useState<any[]>([]);
  const [showAttempts, setShowAttempts] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

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
      const msg = err?.message || "";
      if (msg.includes("403") || msg.includes("Admin")) {
        toast.error("Admin access required. Use /api/v1/auth/become-admin first.");
      } else if (msg.includes("401") || msg.includes("Unauthorized")) {
        router.push("/login");
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

  const toggleBan = async (userId: string, userName: string, currentlyBanned: boolean) => {
    setActionLoading(`ban-${userId}`);
    try {
      await api.toggleBan(userId, currentlyBanned ? "" : "Multiple fake payment attempts");
      toast.success(currentlyBanned ? `✅ ${userName} unbanned!` : `🔨 ${userName} banned!`);
      await fetchAll();
    } catch { toast.error("Ban action failed"); }
    setActionLoading(null);
  };

  const viewAttempts = async (user: any) => {
    setSelectedUser(user);
    setLoadingAttempts(true);
    setShowAttempts(true);
    try {
      const attempts = await api.getUserAttempts(user.id);
      setUserAttempts(Array.isArray(attempts) ? attempts : []);
    } catch { toast.error("Failed to load attempts"); setUserAttempts([]); }
    setLoadingAttempts(false);
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
  const bannedUsers = users.filter(u => u.is_banned);
  const flaggedUsers = users.filter(u => (u.failed_payment_attempts || 0) >= 10);

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

      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Neuro<span className="text-purple-500">Admin</span></span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">ENTERPRISE</span>
          {flaggedUsers.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> {flaggedUsers.length} flagged
            </span>
          )}
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {[
              { icon: Users, label: "Total Users", value: dashboard?.total_users || 0, color: "from-blue-500 to-blue-600", key: "users" },
              { icon: CreditCard, label: "Payments", value: dashboard?.total_payments || 0, color: "from-green-500 to-green-600", key: "payments" },
              { icon: Clock, label: "Pending", value: pendingCount, color: "from-amber-500 to-amber-600", highlight: pendingCount > 0, key: "pending" },
              { icon: Ban, label: "Banned", value: bannedUsers.length, color: "from-red-500 to-red-600", highlight: bannedUsers.length > 0, key: "banned" },
              { icon: DollarSign, label: "Revenue", value: `₹${dashboard?.revenue || 0}`, color: "from-purple-500 to-purple-600", key: "revenue" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl bg-card border ${s.highlight ? 'border-amber-500/30 ring-1 ring-amber-500/20' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${s.color}`}><s.icon className="w-4 h-4 text-white" /></div>
                </div>
                <div className={`text-xl font-bold ${s.key === 'banned' && bannedUsers.length > 0 ? 'text-red-400' : ''}`}>{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-border mb-6 gap-0 overflow-x-auto">
            {[
              { key: "payments", label: "Payments", icon: CreditCard, count: pendingCount },
              { key: "users", label: "Users", icon: Users, count: bannedUsers.length, alert: bannedUsers.length > 0 },
              { key: "flagged", label: "Flagged Users", icon: AlertTriangle, count: flaggedUsers.length, alert: flaggedUsers.length > 0 },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                <tab.icon className={`w-4 h-4 ${tab.alert ? 'text-red-400' : ''}`} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    tab.alert ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
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
                  {filteredPayments.map((p: any) => (
                    <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl bg-card border transition-all ${
                        p.status === 'pending' ? 'border-amber-500/30 shadow-sm shadow-amber-500/5' : 'border-border'
                      }`}>
                      <div className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{p.user_name}</span>
                              {getStatusBadge(p.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">{p.user_email}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                              <span>Plan: <strong className="text-foreground capitalize">{p.plan}</strong></span>
                              <span>Amount: <strong className="text-foreground">₹{p.amount}</strong></span>
                              <span>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {p.admin_notes && (
                              <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{p.admin_notes}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 lg:items-end">
                            {p.screenshot_path && (
                              <a href={`${API_BASE}${p.screenshot_path}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                <Eye className="w-3.5 h-3.5" /> View Screenshot
                              </a>
                            )}
                            {p.status === 'pending' && (
                              <div className="flex flex-col gap-2">
                                <textarea
                                  placeholder="Admin notes..."
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
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-foreground/30 transition-colors"
                />
              </div>

              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">User / ID</th>
                        <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Plan</th>
                        <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Failed Attempts</th>
                        <th className="text-left p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Status</th>
                        <th className="text-right p-4 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                        .length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No users found</td></tr>
                      ) : (
                        users
                          .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                          .map((u: any, i: number) => (
                            <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                              className={`border-b border-border hover:bg-secondary/30 transition-colors ${u.is_banned ? 'bg-red-500/5' : ''}`}>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                                    u.is_banned ? 'bg-red-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                                  }`}>
                                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm flex items-center gap-1">
                                      {u.name}
                                      {u.is_banned && <Ban className="w-3 h-3 text-red-400" />}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-mono">ID: {u.id.slice(0, 12)}...</p>
                                    <p className="text-[10px] text-muted-foreground">{u.email}</p>
                                  </div>
                                </div>
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
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                  (u.failed_payment_attempts || 0) >= 10
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : (u.failed_payment_attempts || 0) >= 5
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-secondary text-muted-foreground border border-border'
                                }`}>
                                  {(u.failed_payment_attempts || 0) >= 10 ? <AlertCircle className="w-3 h-3" /> : null}
                                  {u.failed_payment_attempts || 0}/10
                                </span>
                              </td>
                              <td className="p-4">
                                {u.is_banned ? (
                                  <span className="inline-flex items-center gap-1 text-red-400 text-xs"><Ban className="w-3.5 h-3.5" /> Banned</span>
                                ) : u.subscription_status === 'active' ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">Free</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => viewAttempts(u)}
                                    className="px-2 py-1.5 rounded-lg text-[10px] font-medium bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                                    Logs
                                  </button>
                                  <button onClick={() => toggleBan(u.id, u.name, u.is_banned)} disabled={actionLoading === `ban-${u.id}` || u.role === 'admin'}
                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                                      u.is_banned
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                    } disabled:opacity-30`}>
                                    {actionLoading === `ban-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : u.is_banned ? 'Unban' : 'Ban'}
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ATTEMPT LOGS MODAL */}
              <AnimatePresence>
                {showAttempts && selectedUser && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowAttempts(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-background border border-border rounded-2xl shadow-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold">Attempt Logs: {selectedUser.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">ID: {selectedUser.id}</p>
                        </div>
                        <button onClick={() => setShowAttempts(false)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      {loadingAttempts ? (
                        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                      ) : userAttempts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No payment attempts found</p>
                      ) : (
                        <div className="space-y-2">
                          {userAttempts.map((a: any) => (
                            <div key={a.id} className={`p-3 rounded-xl border text-sm ${
                              a.is_payment_screenshot ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-medium text-xs ${a.is_payment_screenshot ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {a.is_payment_screenshot ? '✅ Payment SS' : '❌ Fake SS'} · Score: {a.ai_score}/100
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">{a.ai_analysis || "No AI analysis"}</p>
                              {a.ai_checks && a.ai_checks.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {a.ai_checks.map((c: any, ci: number) => (
                                    <span key={ci} className={`text-[9px] px-1.5 py-0.5 rounded ${
                                      c.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                      {c.passed ? '✓' : '✗'} {c.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {a.screenshot_path && (
                                <a href={`${API_BASE}${a.screenshot_path}`} target="_blank"
                                  className="text-[10px] text-purple-400 hover:underline mt-1 inline-block">
                                  View SS →
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* FLAGGED USERS TAB */}
          {activeTab === "flagged" && (
            <div>
              {flaggedUsers.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <Shield className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No flagged users. All clear!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flaggedUsers.map((u: any) => (
                    <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{u.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">ID: {u.id.slice(0, 16)}...</p>
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {u.failed_payment_attempts} failed attempts · {u.is_banned ? 'BANNED' : 'Not banned'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => viewAttempts(u)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                            View Logs
                          </button>
                          {!u.is_banned && (
                            <button onClick={() => toggleBan(u.id, u.name, false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                              Ban User
                            </button>
                          )}
                          {u.is_banned && (
                            <button onClick={() => toggleBan(u.id, u.name, true)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                              Unban
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
