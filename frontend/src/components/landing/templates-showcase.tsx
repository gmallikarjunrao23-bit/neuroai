"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { documentTemplates, templateCategories } from "@/data/templates";
import {
  ArrowRight,
  Home,
  FileLock,
  Gavel,
  Briefcase,
  Handshake,
  FileText,
  Landmark,
  ClipboardList,
  ScrollText,
  BookOpen,
  FileSignature,
  Shield,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Home,
  FileLock,
  Gavel,
  Briefcase,
  Handshake,
  FileText,
  Landmark,
  ClipboardList,
  ScrollText,
  BookOpen,
  FileSignature,
  Shield,
};

export function TemplatesShowcase() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const filteredTemplates =
    activeCategory === "all"
      ? documentTemplates
      : documentTemplates.filter((t) => t.category === activeCategory);

  return (
    <section id="templates" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4F8] to-white dark:from-slate-950 dark:to-slate-900" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1E3A5F]/5 to-[#C9A84C]/10 dark:from-[#1E3A5F]/20 dark:to-[#C9A84C]/10 border border-[#C9A84C]/20 text-xs font-semibold text-[#1E3A5F] dark:text-[#C9A84C] mb-4">
            Legal Templates
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E3A5F] dark:text-white">
            Choose from{" "}
            <span className="bg-gradient-to-r from-[#1E3A5F] to-[#C9A84C] bg-clip-text text-transparent">
              200+ Templates
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Professionally drafted templates for every legal need — from rental agreements to legal notices.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {templateCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                activeCategory === category.value
                  ? "bg-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25"
                  : "bg-white dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-gray-700"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {filteredTemplates.slice(0, 6).map((template, index) => {
              const Icon = iconMap[template.icon] || FileText;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  className="group relative"
                >
                  <Link href={`/templates/${template.id}`}>
                    <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                      {/* Premium Badge */}
                      {template.isPremium && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-[#C9A84C] to-[#D4B96A] text-[#1E3A5F] border-0 text-[10px] font-semibold gap-1">
                            <Sparkles className="h-3 w-3" />
                            Premium
                          </Badge>
                        </div>
                      )}
                      
                      {template.popular && !template.isPremium && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-[10px] font-semibold">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />
                            Popular
                          </Badge>
                        </div>
                      )}

                      {/* Icon */}
                      <div className="mb-4">
                        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[#1E3A5F]/5 to-[#C9A84C]/10 dark:from-[#1E3A5F]/20 dark:to-[#C9A84C]/10 border border-gray-100 dark:border-gray-700">
                          <Icon className="h-6 w-6 text-[#1E3A5F] dark:text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-[#1E3A5F] dark:text-white mb-1.5">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                        {template.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {template.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex flex-wrap gap-1">
                            {template.language.slice(0, 2).map((lang) => (
                              <span key={lang} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-[10px]">
                                {lang}
                              </span>
                            ))}
                            {template.language.length > 2 && (
                              <span className="text-[10px]">+{template.language.length - 2}</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Hover Arrow */}
                      <div
                        className={cn(
                          "absolute bottom-6 right-6 p-2 rounded-full bg-[#1E3A5F] dark:bg-[#C9A84C] text-white dark:text-[#1E3A5F] shadow-lg transition-all duration-300",
                          hoveredTemplate === template.id
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-2"
                        )}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/templates">
            <Button
              variant="outline"
              className="px-8 py-5 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 text-base"
            >
              View All Templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
