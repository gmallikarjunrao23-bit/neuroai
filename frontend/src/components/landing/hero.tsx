"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Scale,
  Sparkles,
  Shield,
  FileText,
  CheckCircle2,
  Users,
  Globe,
  Zap,
} from "lucide-react";

const floatingIcons = [
  { Icon: FileText, delay: 0, x: 200, y: -80, size: 24 },
  { Icon: Shield, delay: 0.5, x: -220, y: 60, size: 28 },
  { Icon: Scale, delay: 1, x: 150, y: 120, size: 20 },
  { Icon: CheckCircle2, delay: 1.5, x: -180, y: -100, size: 22 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFC] via-white to-[#F0F4F8] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYigzMCA1OCA5NSAvIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-[#1E3A5F]/10 to-[#C9A84C]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-br from-[#C9A84C]/10 to-[#1E3A5F]/5 rounded-full blur-3xl" />

      {/* Floating Legal Icons */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map(({ Icon, delay, x, y, size }) => (
          <motion.div
            key={delay}
            className="absolute top-1/2 left-1/2 text-[#1E3A5F]/10 dark:text-white/5"
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              x: [0, x, 0],
              y: [0, y, 0],
            }}
            transition={{
              duration: 8,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ marginTop: -size / 2, marginLeft: -size / 2 }}
          >
            <Icon size={size * 4} />
          </motion.div>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="secondary"
              className="mb-8 px-4 py-2 rounded-full bg-gradient-to-r from-[#1E3A5F]/5 to-[#C9A84C]/10 dark:from-[#1E3A5F]/20 dark:to-[#C9A84C]/10 border border-[#C9A84C]/20 text-xs font-medium text-[#1E3A5F] dark:text-[#C9A84C] gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
              AI-Powered Legal Document Intelligence
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1E3A5F] dark:text-white"
          >
            Create{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#1E3A5F] to-[#C9A84C] bg-clip-text text-transparent">
                Professional
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[#C9A84C]/20 rounded-full blur-sm" />
            </span>{" "}
            Legal Documents
            <br />
            in{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#C9A84C] to-[#D4B96A] bg-clip-text text-transparent">
                Minutes
              </span>
              <svg
                className="absolute -bottom-2 left-0 right-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C50 2 100 2 198 10"
                  stroke="#C9A84C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeOpacity="0.3"
                />
              </svg>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed"
          >
            LegisBot combines the power of AI with Indian legal expertise to help you create, 
            review, and manage legally sound documents in multiple Indian languages — 
            without expensive lawyers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-[#1E3A5F] to-[#2A5A8F] hover:from-[#2A5A8F] hover:to-[#1E3A5F] text-white px-8 py-6 text-base rounded-full shadow-2xl shadow-[#1E3A5F]/25 hover:shadow-[#1E3A5F]/40 transition-all duration-500"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-[#C9A84C]/20 to-transparent transition-transform duration-500" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 dark:hover:bg-[#C9A84C]/5 transition-all duration-300"
              >
                <Scale className="mr-2 h-4 w-4" />
                View Templates
              </Button>
            </Link>
          </motion.div>

          {/* Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          >
            {[
              { icon: FileText, label: "Documents Created", value: "50,000+" },
              { icon: Users, label: "Active Users", value: "10,000+" },
              { icon: Globe, label: "Languages", value: "8+" },
              { icon: Zap, label: "Avg. Creation Time", value: "< 5 min" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1E3A5F]/5 to-[#C9A84C]/10 dark:from-[#1E3A5F]/20 dark:to-[#C9A84C]/5 border border-gray-100 dark:border-gray-800">
                    <stat.icon className="h-5 w-5 text-[#1E3A5F] dark:text-[#C9A84C]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1E3A5F] dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 w-full max-w-4xl"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1E3A5F]/20 to-[#C9A84C]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Rental Agreement — Preview</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      <div className="h-5 w-24 bg-[#C9A84C]/20 rounded-full" />
                    </div>
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700">
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    AI-Generated · Legally Verified
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="h-8 w-20 rounded-lg bg-[#1E3A5F] dark:bg-[#C9A84C]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
