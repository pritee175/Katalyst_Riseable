"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t mt-8 sm:mt-16 relative overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>R</div>
              <span style={{ color: "var(--color-text)" }}>Rise<span style={{ color: "var(--color-primary)" }}>Able</span></span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Empowering specially-abled individuals with skills, jobs, and opportunities.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text)" }}>Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/courses", label: "Courses" },
                { href: "/jobs", label: "Find Jobs" },
                { href: "/schemes", label: "Gov. Schemes" },
                { href: "/auth", label: "Sign In" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs hover:underline" style={{ color: "var(--color-text-muted)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text)" }}>Accessibility</h3>
            <ul className="space-y-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <li>Screen Reader Support</li>
              <li>Voice Navigation</li>
              <li>High Contrast Mode</li>
              <li>Keyboard Navigation</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text)" }}>Contact</h3>
            <ul className="space-y-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <li className="flex items-center gap-2"><Mail size={12} aria-hidden="true" />support@riseable.in</li>
              <li className="flex items-center gap-2"><Phone size={12} aria-hidden="true" />+91 1800-XXX-XXXX</li>
              <li className="flex items-center gap-2"><MapPin size={12} aria-hidden="true" />Pune, Maharashtra</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-xs"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
          <p>&copy; {new Date().getFullYear()} RiseAble. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
