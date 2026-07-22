"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  Scale,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
  Bell,
  FileText,
  HelpCircle,
  Sparkles,
} from "lucide-react";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
];

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  subscriptionTier?: string;
}

export function Navbar({
  isLoggedIn = false,
  userName = "User",
  userEmail = "user@example.com",
  userAvatar,
  subscriptionTier = "free",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2A5A8F] shadow-lg shadow-[#1E3A5F]/20 transition-all duration-300 group-hover:shadow-[#1E3A5F]/30 group-hover:scale-105">
              <Scale className="h-5 w-5 text-[#C9A84C]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#1E3A5F] dark:text-white">
                Legis<span className="text-[#C9A84C]">Bot</span>
              </span>
              <span className="-mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                Legal Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1E3A5F] dark:hover:text-white transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[#C9A84C] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 rounded-full text-gray-500 hover:text-[#1E3A5F] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#C9A84C] text-[9px] font-bold text-white flex items-center justify-center shadow-lg">
                    3
                  </span>
                </button>

                {/* AI Credits Badge */}
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>100 AI Credits</span>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer">
                      <Avatar className="h-8 w-8 ring-2 ring-[#C9A84C]/20">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#2A5A8F] text-white text-xs font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:flex flex-col items-start text-left">
                        <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                          {userName}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                          {subscriptionTier === "free" ? "Free Plan" : `${subscriptionTier} Plan`}
                        </span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-72 mt-2 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl"
                  >
                    <DropdownMenuLabel className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-[#C9A84C]/20">
                          <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#2A5A8F] text-white">
                            {userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="mx-2" />
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3">
                      <User className="mr-3 h-4 w-4 text-gray-500" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3">
                      <FileText className="mr-3 h-4 w-4 text-gray-500" />
                      <span>My Documents</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] bg-[#1E3A5F]/10 text-[#1E3A5F] dark:bg-[#C9A84C]/10 dark:text-[#C9A84C]">
                        12
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3">
                      <CreditCard className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Billing & Plans</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3">
                      <Settings className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3">
                      <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                      <span>Help & Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-2" />
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3 text-red-500 focus:text-red-500">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#1E3A5F] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full px-5"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-[#1E3A5F] to-[#2A5A8F] hover:from-[#2A5A8F] hover:to-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25 hover:shadow-[#1E3A5F]/35 rounded-full px-6 transition-all duration-300">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1E3A5F] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200/50 dark:border-gray-800/50 space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2A5A8F] text-white rounded-full shadow-lg">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
