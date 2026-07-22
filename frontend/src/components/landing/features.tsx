"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Languages,
  Shield,
  FileText,
  Zap,
  Smartphone,
  Users,
  Cloud,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Drafting",
    description: "Our advanced AI understands your requirements and generates legally sound documents tailored to Indian law.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Languages,
    title: "Multi-Language Support",
    description: "Create and review documents in Hindi, Marathi, Telugu, Tamil, English, and more regional languages.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Legally Verified Templates",
    description: "Every template is reviewed by legal experts and updated to comply with the latest Indian legal requirements.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Generate in Minutes",
    description: "Answer a few simple questions and get a complete, professional legal document in under 5 minutes.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: FileText,
    title: "Smart Document Review",
    description: "AI-powered review highlights potential issues, suggests improvements, and ensures completeness.",
    gradient: "from-rose-500 to-red-500",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Create and manage documents on the go with our fully responsive mobile-optimized platform.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members, assign roles, and collaborate on documents in real-time.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Cloud,
    title: "Secure Cloud Storage",
    description: "All documents are encrypted at rest and in transit with enterprise-grade security.",
    gradient: "from-sky-500 to-cyan-500",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Get help when you need it with our dedicated support team available via chat, email, and phone.",
    gradient: "from-green-500 to-emerald-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#F0F4F8] dark:from-slate-900 dark:to-slate-950" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1E3A5F]/5 to-[#C9A84C]/10 dark:from-[#1E3A5F]/20 dark:to-[#C9A84C]/10 border border-[#C9A84C]/20 text-xs font-semibold text-[#1E3A5F] dark:text-[#C9A84C] mb-4">
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E3A5F] dark:text-white">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-[#1E3A5F] to-[#C9A84C] bg-clip-text text-transparent">
              Legal Excellence
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            From AI-powered drafting to multi-language support — LegisBot has everything covered.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1">
                {/* Icon */}
                <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 shadow-lg mb-5`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-[#1E3A5F] dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1E3A5F]/0 to-[#C9A84C]/0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
