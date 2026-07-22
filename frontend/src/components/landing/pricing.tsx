"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Starter",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for individuals getting started",
    features: [
      { text: "3 documents per month", included: true },
      { text: "Basic templates", included: true },
      { text: "English only", included: true },
      { text: "PDF download", included: true },
      { text: "Email support", included: true },
      { text: "AI-powered drafting", included: false },
      { text: "Multi-language support", included: false },
      { text: "Team collaboration", included: false },
      { text: "E-signature integration", included: false },
    ],
    highlighted: false,
    popular: false,
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
  },
  {
    id: "professional",
    name: "Professional",
    price: { monthly: 499, yearly: 4999 },
    description: "Ideal for professionals and small businesses",
    features: [
      { text: "25 documents per month", included: true },
      { text: "All templates", included: true },
      { text: "Multi-language (Hindi, Marathi, Telugu)", included: true },
      { text: "Premium PDF & DOCX export", included: true },
      { text: "AI-powered drafting", included: true },
      { text: "Smart document review", included: true },
      { text: "E-signature integration", included: true },
      { text: "Priority email support", included: true },
      { text: "API access", included: false },
    ],
    highlighted: true,
    popular: true,
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 1499, yearly: 14999 },
    description: "For growing teams and law firms",
    features: [
      { text: "Unlimited documents", included: true },
      { text: "All templates + custom templates", included: true },
      { text: "Multi-language support", included: true },
      { text: "Advanced AI drafting + review", included: true },
      { text: "Team collaboration (up to 20 users)", included: true },
      { text: "Client portal", included: true },
      { text: "Bulk document generation", included: true },
      { text: "API access", included: true },
      { text: "Priority phone & email support", included: true },
    ],
    highlighted: false,
    popular: false,
    cta: "Start Free Trial",
    ctaVariant: "outline" as const,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: 4999, yearly: 49999 },
    description: "For large organizations with custom needs",
    features: [
      { text: "Everything in Business", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Custom template builder", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom integrations", included: true },
      { text: "White-label option", included: true },
      { text: "SLA guarantees", included: true },
      { text: "On-premise deployment option", included: true },
      { text: "24/7 priority support", included: true },
    ],
    highlighted: false,
    popular: false,
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#F0F4F8] dark:from-slate-900 dark:to-slate-950" />
      
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
            Simple Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E3A5F] dark:text-white">
            Plans for Every{" "}
            <span className="bg-gradient-to-r from-[#1E3A5F] to-[#C9A84C] bg-clip-text text-transparent">
              Legal Need
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                !annual
                  ? "bg-white dark:bg-slate-700 text-[#1E3A5F] dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                annual
                  ? "bg-white dark:bg-slate-700 text-[#1E3A5F] dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              )}
            >
              Annual
              <span className="ml-1.5 text-[10px] text-emerald-500 font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative group",
                plan.popular && "lg:-mt-4 lg:mb-4"
              )}
            >
              <div
                className={cn(
                  "relative p-8 rounded-2xl border transition-all duration-500 h-full flex flex-col",
                  plan.popular
                    ? "bg-gradient-to-b from-white to-[#F0F4F8] dark:from-slate-900 dark:to-slate-800 border-[#C9A84C]/30 shadow-xl shadow-[#C9A84C]/10"
                    : "bg-white dark:bg-slate-900 border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#C9A84C] to-[#D4B96A] text-[#1E3A5F] border-0 px-4 py-1 text-xs font-semibold shadow-lg whitespace-nowrap">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#1E3A5F] dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#1E3A5F] dark:text-white">
                      ₹{annual ? plan.price.yearly.toLocaleString("en-IN") : plan.price.monthly.toLocaleString("en-IN")}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-sm text-gray-400">/{annual ? "year" : "month"}</span>
                    )}
                  </div>
                  {plan.price.monthly > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      ₹{plan.price.monthly}/month billed {annual ? "annually" : "monthly"}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          feature.included
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-500"
                        )}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href={plan.id === "enterprise" ? "/contact" : "/register"}>
                  <Button
                    variant={plan.ctaVariant}
                    className={cn(
                      "w-full rounded-full py-5 transition-all duration-300",
                      plan.popular
                        ? "bg-gradient-to-r from-[#1E3A5F] to-[#2A5A8F] hover:from-[#2A5A8F] hover:to-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25"
                        : "hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5"
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
