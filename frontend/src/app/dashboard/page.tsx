"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Brain, MessageSquare, MessageCircle, Zap, CreditCard, ArrowRight, LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (!api.getToken()) { router.push("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usageData, chatData] = await Promise.all([
        api.getUsage(), api.getChatHistory()
      ]);
      setUsage(usageData);
      setChats(Array.isArray(chatData) ? chatData.slice(0, 10) : []);
    } catch {}
  };

  const logout = () => { api.clearToken(); router.push("/login"); };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border glass flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D]">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">Model<span className="text-[#FF6B9D]">Hub</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/chat"><Button size="sm" className="rounded-full bg-gradient-to-r from-[#6C63FF] to-[#FF6B9D] text-white"><MessageSquare className="h-4 w-4 mr-1" /> Chat</Button></Link>
          <Link href="/billing"><Button variant="outline" size="sm" className="rounded-full border-border text-gray-400"><CreditCard className="h-4 w-4 mr-1" /> Billing</Button></Link>
          <button onClick={logout} className="p-2 rounded-lg text-gray-500 hover:text-white"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400">Your AI usage overview</p>
            </div>
            <Link href="/chat"><Button className="rounded-full bg-gradient-to-r from-[#6C63FF] to-[#FF6B9D] text-white"><MessageSquare className="mr-2 h-4 w-4" /> New Chat</Button></Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: MessageCircle, label: "Today's Chats", value: usage?.api_calls_today || 0, color: "from-blue-500 to-blue-600" },
              { icon: Zap, label: "Total Tokens", value: usage?.total_tokens_used?.toLocaleString() || 0, color: "from-purple-500 to-purple-600" },
              { icon: CreditCard, label: "Plan", value: usage?.subscription_plan || "Free", color: "from-green-500 to-green-600" },
              { icon: Badge, label: "KYC Status", value: usage?.kyc_verified ? "Verified ✅" : "Pending", color: "from-amber-500 to-amber-600" },
            ].map((s, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color}`}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/chat"><Button className="w-full justify-between rounded-xl bg-[#1E2028] hover:bg-border text-gray-300"><span>💬 Start Chatting</span><ArrowRight className="h-4 w-4" /></Button></Link>
                  <Link href="/billing"><Button className="w-full justify-between rounded-xl bg-[#1E2028] hover:bg-border text-gray-300"><span>💰 Subscribe to Premium</span><ArrowRight className="h-4 w-4" /></Button></Link>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Recent Chats</h3>
                {chats.length === 0 ? (
                  <p className="text-sm text-gray-500">No chats yet. Start a conversation!</p>
                ) : (
                  <div className="space-y-2">
                    {chats.map((c: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-[#1E2028]">
                        <p className="text-sm text-gray-300 truncate">{c.prompt}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{new Date(c.created_at).toLocaleDateString()} • {c.model}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
