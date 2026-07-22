"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { Brain, Users, CreditCard, CheckCircle2, XCircle, Eye, Loader2, LogOut, DollarSign } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

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
    } catch { router.push("/login"); }
    setLoading(false);
  };

  const approvePayment = async (id: string, status: string) => {
    setActionLoading(id);
    await api.approvePayment(id, status, adminNotes[id] || "");
    await fetchAll();
    setActionLoading(null);
  };

  const toggleKyc = async (userId: string) => {
    await api.toggleKyc(userId);
    await fetchAll();
  };

  const logout = () => { api.clearToken(); router.push("/login"); };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#6C63FF]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border glass flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D]">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">Model<span className="text-[#FF6B9D]">Hub</span></span>
          <Badge className="ml-2 bg-[#6C63FF] text-[10px]">Admin</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchAll} className="rounded-full border-border text-gray-400"><Loader2 className="h-3.5 w-3.5 mr-1" /> Refresh</Button>
          <button onClick={logout} className="p-2 rounded-lg text-gray-500 hover:text-white"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-6">Admin Panel</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: "Total Users", value: dashboard?.total_users || 0, color: "from-blue-500 to-blue-600" },
              { icon: CreditCard, label: "Total Payments", value: dashboard?.total_payments || 0, color: "from-green-500 to-green-600" },
              { icon: Loader2, label: "Pending Approvals", value: dashboard?.pending_payments || 0, color: "from-amber-500 to-amber-600" },
              { icon: DollarSign, label: "Revenue", value: `₹${dashboard?.revenue || 0}`, color: "from-purple-500 to-purple-600" },
            ].map((s, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} w-fit mb-3`}><s.icon className="h-5 w-5 text-white" /></div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="payments" className="space-y-6">
            <TabsList className="bg-[#1E2028] border-border">
              <TabsTrigger value="payments" className="data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white">Payments {dashboard?.pending_payments > 0 && <Badge className="ml-2 bg-red-500 text-white text-[10px]">{dashboard.pending_payments}</Badge>}</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white">Users</TabsTrigger>
            </TabsList>

            {/* Payments Tab */}
            <TabsContent value="payments">
              {payments.length === 0 ? (
                <Card className="bg-card border-border"><CardContent className="p-8 text-center text-gray-400">No payments yet.</CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {payments.map((p: any) => (
                    <Card key={p.id} className={`bg-card border-border ${p.status === 'pending' ? 'ring-1 ring-amber-500/30' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white">{p.user_name}</span>
                              <Badge className={`${p.status === 'approved' ? 'bg-green-500' : p.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'} text-white text-[10px]`}>{p.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-400">{p.user_email}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-gray-300">Plan: <strong className="text-white capitalize">{p.plan}</strong></span>
                              <span className="text-gray-300">Amount: <strong className="text-white">₹{p.amount}</strong></span>
                              <span className="text-gray-300">UPI: <strong className="text-[#FF6B9D]">{p.upi_id}</strong></span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{new Date(p.created_at).toLocaleString()}</p>
                          </div>

                          <div className="flex flex-col gap-2">
                            {p.screenshot_path && (
                              <a href={`http://localhost:8000${p.screenshot_path}`} target="_blank" className="text-xs text-[#6C63FF] hover:underline flex items-center gap-1">
                                <Eye className="h-3 w-3" /> View Screenshot
                              </a>
                            )}
                            {p.status === 'pending' && (
                              <div className="flex flex-col gap-2">
                                <Textarea
                                  placeholder="Admin notes (optional)"
                                  className="text-xs bg-[#1E2028] border-border h-16 min-h-0"
                                  value={adminNotes[p.id] || ""}
                                  onChange={e => setAdminNotes({...adminNotes, [p.id]: e.target.value})}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => approvePayment(p.id, "approved")} disabled={actionLoading === p.id}
                                    className="flex-1 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs h-8">
                                    {actionLoading === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle2 className="h-3 w-3 mr-1" /> Approve</>}
                                  </Button>
                                  <Button size="sm" onClick={() => approvePayment(p.id, "rejected")} disabled={actionLoading === p.id}
                                    className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs h-8">
                                    <XCircle className="h-3 w-3 mr-1" /> Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                            {p.admin_notes && <p className="text-xs text-gray-500">Notes: {p.admin_notes}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-gray-400 text-xs">
                          <th className="text-left p-4">Name</th>
                          <th className="text-left p-4">Email</th>
                          <th className="text-left p-4">Role</th>
                          <th className="text-left p-4">Plan</th>
                          <th className="text-left p-4">KYC</th>
                          <th className="text-left p-4">Chats Today</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u: any) => (
                          <tr key={u.id} className="border-b border-border hover:bg-[#1E2028]/50">
                            <td className="p-4 text-white">{u.name}</td>
                            <td className="p-4 text-gray-400">{u.email}</td>
                            <td className="p-4"><Badge className={`text-[10px] ${u.role === 'admin' ? 'bg-[#6C63FF]' : 'bg-[#1E2028] text-gray-300'}`}>{u.role}</Badge></td>
                            <td className="p-4"><Badge className={`text-[10px] ${u.subscription_status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}>{u.subscription_plan || 'Free'}</Badge></td>
                            <td className="p-4">{u.kyc_verified ? <Badge className="bg-green-500 text-[10px]">✅ Verified</Badge> : <Badge className="bg-amber-500 text-[10px]">Pending</Badge>}</td>
                            <td className="p-4 text-gray-300">{u.api_calls_today}</td>
                            <td className="p-4">
                              <Button size="sm" variant="outline" onClick={() => toggleKyc(u.id)} className="rounded-full border-border text-[10px] h-7 text-gray-400">
                                Toggle KYC
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
