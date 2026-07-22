"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  FolderOpen,
  Scale,
  Users,
  Settings,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  MessageSquare,
  Bell,
  Search,
  BarChart3,
  Shield,
  LogOut,
} from "lucide-react";

const sidebarItems = [
  {
    section: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
      { href: "/dashboard/documents", icon: FileText, label: "My Documents", badge: "12" },
      { href: "/dashboard/documents/new", icon: FilePlus, label: "New Document", badge: null },
      { href: "/dashboard/templates", icon: FolderOpen, label: "Templates", badge: null },
    ],
  },
  {
    section: "AI Tools",
    items: [
      { href: "/dashboard/ai-chat", icon: MessageSquare, label: "AI Legal Chat", badge: "New" },
      { href: "/dashboard/document-review", icon: Shield, label: "Document Review", badge: null },
    ],
  },
  {
    section: "Organization",
    items: [
      { href: "/dashboard/team", icon: Users, label: "Team", badge: null },
      { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", badge: null },
      { href: "/dashboard/billing", icon: CreditCard, label: "Billing", badge: null },
    ],
  },
  {
    section: "Settings",
    items: [
      { href: "/dashboard/settings", icon: Settings, label: "Settings", badge: null },
      { href: "/dashboard/help", icon: HelpCircle, label: "Help & Support", badge: null },
    ],
  },
];

const recentDocuments = [
  { name: "Rental Agreement - Mumbai", date: "2 hours ago", status: "completed" },
  { name: "NDA - TechCorp India", date: "Yesterday", status: "draft" },
  { name: "Legal Notice - Property Dispute", date: "2 days ago", status: "completed" },
];

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function DashboardSidebar({ collapsed = false, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2A5A8F] shadow-lg shrink-0">
            <Scale className="h-4.5 w-4.5 text-[#C9A84C]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#1E3A5F] dark:text-white leading-tight">
                Legis<span className="text-[#C9A84C]">Bot</span>
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 leading-tight">
                Dashboard
              </span>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-[#1E3A5F] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Sidebar Sections */}
        {sidebarItems.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {section.section}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-gradient-to-r from-[#1E3A5F]/10 to-[#C9A84C]/10 dark:from-[#1E3A5F]/30 dark:to-[#C9A84C]/10 text-[#1E3A5F] dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-[#1E3A5F] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <item.icon className={cn("h-4.5 w-4.5 shrink-0", isActive && "text-[#C9A84C]")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full",
                              item.badge === "New"
                                ? "bg-[#C9A84C] text-[#1E3A5F]"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {isActive && !collapsed && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-6 rounded-r-full bg-[#C9A84C]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* AI Credits */}
        {!collapsed && (
          <div className="px-3 py-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/5 to-[#C9A84C]/10 dark:from-[#1E3A5F]/20 dark:to-[#C9A84C]/5 border border-[#C9A84C]/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#C9A84C]" />
                <span className="text-sm font-semibold text-[#1E3A5F] dark:text-white">AI Credits</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Used this month</span>
                <span className="text-xs font-medium text-[#1E3A5F] dark:text-white">45 / 100</span>
              </div>
              <Progress value={45} className="[&>[data-slot=progress-track]]:h-1.5 [&>[data-slot=progress-track]]:bg-gray-200 dark:[&>[data-slot=progress-track]]:bg-gray-700 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-[#C9A84C] [&>[data-slot=progress-indicator]]:to-[#D4B96A]" />
              <Button
                variant="link"
                size="sm"
                className="mt-2 text-[10px] text-[#C9A84C] hover:text-[#D4B96A] p-0 h-auto"
              >
                Upgrade plan →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        {!collapsed && (
          <div className="space-y-1">
            {[
              { href: "#", icon: Bell, label: "Notifications", badge: "3" },
              { href: "#", icon: LogOut, label: "Sign Out" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#1E3A5F] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {"badge" in item && item.badge && (
                  <Badge className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white border-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-screen bg-white dark:bg-slate-950 border-r border-gray-200/50 dark:border-gray-800/50 hidden lg:block transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-screen w-72 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-gray-800 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
