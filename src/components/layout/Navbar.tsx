"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Menu, X, User, LogOut, Home, BookOpen, Briefcase, Landmark, LayoutDashboard, UserCircle, MessageCircle, Sun, Moon, Camera } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home, requireAuth: false },
  { href: "/courses", label: "Courses", icon: BookOpen, requireAuth: true },
  { href: "/jobs", label: "Jobs", icon: Briefcase, requireAuth: true },
  { href: "/schemes", label: "Schemes", icon: Landmark, requireAuth: true },
  { href: "/chat", label: "AI Chat", icon: MessageCircle, requireAuth: false },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme, gestureNavigationEnabled, toggleGestureNavigation } = useAccessibility();
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent, href: string, requireAuth: boolean) => {
    if (requireAuth && !isAuthenticated) {
      e.preventDefault();
      router.push("/auth");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: theme === "light" ? "rgba(248, 250, 252, 0.85)" : "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderColor: "rgba(124, 58, 237, 0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight"
            aria-label="RiseAble Home"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
              <span className="text-white text-sm font-black">R</span>
            </div>
            <span style={{ color: "var(--color-text)" }}>Rise<span style={{ color: "var(--color-primary)" }}>Able</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.requireAuth)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
                  e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                <link.icon size={16} aria-hidden="true" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth + Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sign Navigation Camera Toggle */}
            <button
              onClick={toggleGestureNavigation}
              className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: gestureNavigationEnabled ? "var(--color-primary)" : "var(--color-bg-secondary)",
                border: gestureNavigationEnabled ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
              }}
              aria-label={gestureNavigationEnabled ? "Disable sign navigation camera" : "Enable sign navigation camera"}
              title="Sign Navigation (Camera)"
            >
              <Camera size={18} style={{ color: gestureNavigationEnabled ? "#ffffff" : "var(--color-text-muted)" }} />
            </button>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
              }}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun size={18} style={{ color: "var(--color-warning)" }} />
              ) : (
                <Moon size={18} style={{ color: "var(--color-primary)" }} />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <LayoutDashboard size={16} aria-hidden="true" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <UserCircle size={16} aria-hidden="true" />
                  Profile
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))", color: "#fff" }}>
                    {user?.name?.[0] || "U"}
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: "var(--color-text-muted)" }}
                  aria-label="Sign out"
                >
                  <LogOut size={16} aria-hidden="true" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    color: "var(--color-primary)",
                    border: "1px solid var(--color-primary)"
                  }}
                >
                  Register
                </Link>
                <Link
                  href="/auth"
                  className="cta-shimmer px-5 py-2 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-105"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleGestureNavigation}
              className="p-2 rounded-lg"
              style={{ color: gestureNavigationEnabled ? "var(--color-primary)" : "var(--color-text)" }}
              aria-label={gestureNavigationEnabled ? "Disable sign navigation" : "Enable sign navigation"}
            >
              <Camera size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg"
              style={{ color: "var(--color-text)" }}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              style={{ color: "var(--color-text)" }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t animate-slide-up"
          style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
          role="menu"
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href, link.requireAuth);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium"
                style={{ color: "var(--color-text)" }}
                role="menuitem"
              >
                <link.icon size={18} aria-hidden="true" />
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)} role="menuitem" style={{ color: "var(--color-text)" }}>
                  <LayoutDashboard size={18} aria-hidden="true" />Dashboard
                </Link>
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)} role="menuitem" style={{ color: "var(--color-text)" }}>
                  <UserCircle size={18} aria-hidden="true" />Profile
                </Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full"
                  style={{ color: "var(--color-error)" }} role="menuitem">
                  <LogOut size={18} aria-hidden="true" />Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/register"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-semibold"
                  style={{
                    color: "var(--color-primary)",
                    border: "2px solid var(--color-primary)"
                  }}
                  onClick={() => setMobileMenuOpen(false)} role="menuitem">
                  Register
                </Link>
                <Link href="/auth"
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-center text-white mt-2"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                  onClick={() => setMobileMenuOpen(false)} role="menuitem">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
