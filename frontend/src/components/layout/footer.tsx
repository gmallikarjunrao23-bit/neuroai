"use client";

import Link from "next/link";
import { Scale, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const footerLinks = {
  product: [
    { href: "/features", label: "Features" },
    { href: "/templates", label: "Templates" },
    { href: "/pricing", label: "Pricing" },
    { href: "/api", label: "API" },
    { href: "/changelog", label: "Changelog" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/press", label: "Press Kit" },
    { href: "/contact", label: "Contact" },
  ],
  resources: [
    { href: "/docs", label: "Documentation" },
    { href: "/help", label: "Help Center" },
    { href: "/guides", label: "Legal Guides" },
    { href: "/community", label: "Community" },
    { href: "/status", label: "System Status" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/security", label: "Security" },
    { href: "/compliance", label: "Compliance" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-[#0F172A] dark:bg-black border-t border-white/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#D4B96A] shadow-lg">
                <Scale className="h-5 w-5 text-[#1E3A5F]" />
              </div>
              <span className="text-lg font-bold text-white">
                Legis<span className="text-[#C9A84C]">Bot</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              AI-powered legal document platform. Create, review, and manage professional legal documents in minutes.
            </p>
            <div className="space-y-2">
              <a href="mailto:hello@legisbot.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">
                <Mail className="h-3.5 w-3.5" />
                hello@legisbot.com
              </a>
              <a href="tel:+911234567890" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">
                <Phone className="h-3.5 w-3.5" />
                +91 1234 567 890
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                Mumbai, Maharashtra, India
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 LegisBot. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "GitHub", "YouTube"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm text-gray-500 hover:text-[#C9A84C] transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
