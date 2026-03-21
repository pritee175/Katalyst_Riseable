"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();

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
    <>
      {/* Top Navbar */}
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight"
              aria-label="RiseAble Home"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
                <span className="text-white text-xs sm:text-sm font-black">R</span>
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
                  style={{
                    color: pathname === link.href ? "var(--color-primary)" : "var(--color-text-secondary)",
                    backgroundColor: pathname === link.href ? "rgba(124, 58, 237, 0.1)" : "transparent",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
                    e.currentTarget.style.color = "var(--color-text)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = pathname === link.href ? "rgba(124, 58, 237, 0.1)" : "transparent";
                    e.currentTarget.style.color = pathname === link.href ? "var(--color-primary)" : "var(--color-text-secondary)";
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

            {/* Mobile Header Right */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={toggleGestureNavigation}
                className="p-2.5 rounded-lg active:scale-95 transition-transform"
                style={{ color: gestureNavigationEnabled ? "var(--color-primary)" : "var(--color-text)" }}
                aria-label={gestureNavigationEnabled ? "Disable sign navigation" : "Enable sign navigation"}
              >
                <Camera size={20} />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg active:scale-95 transition-transform"
                style={{ color: "var(--color-text)" }}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                className="p-2.5 rounded-lg active:scale-95 transition-transform"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                style={{ color: "var(--color-text)" }}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t animate-slide-up"
            style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
            role="menu"
          >
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {/* User profile card */}
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl"
                    style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))", color: "#fff" }}>
                      {user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{user?.name}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{user?.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium active:scale-[0.98] transition-transform"
                    onClick={() => setMobileMenuOpen(false)} role="menuitem" style={{ color: "var(--color-text)" }}>
                    <LayoutDashboard size={20} aria-hidden="true" />Dashboard
                  </Link>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium active:scale-[0.98] transition-transform"
                    onClick={() => setMobileMenuOpen(false)} role="menuitem" style={{ color: "var(--color-text)" }}>
                    <UserCircle size={20} aria-hidden="true" />Profile
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium w-full active:scale-[0.98] transition-transform"
                    style={{ color: "var(--color-error)" }} role="menuitem">
                    <LogOut size={20} aria-hidden="true" />Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-1">
                  <Link href="/auth"
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-base font-semibold text-white active:scale-[0.98] transition-transform"
                    style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                    onClick={() => setMobileMenuOpen(false)} role="menuitem">
                    Sign In
                  </Link>
                  <Link href="/register"
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-base font-semibold active:scale-[0.98] transition-transform"
                    style={{
                      color: "var(--color-primary)",
                      border: "2px solid var(--color-primary)"
                    }}
                    onClick={() => setMobileMenuOpen(false)} role="menuitem">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Tab Bar — like Udemy/Coursera */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t safe-area-bottom"
        style={{
          backgroundColor: theme === "light" ? "rgba(248, 250, 252, 0.95)" : "rgba(10, 10, 15, 0.95)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          borderColor: "rgba(124, 58, 237, 0.15)",
        }}
      >
        <div className="flex items-center justify-around h-16 px-1">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.requireAuth)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl active:scale-90 transition-transform"
                aria-label={link.label}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon
                  size={22}
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                  }}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  aria-hidden="true"
                />
                <span
                  className="text-[10px] font-semibold leading-tight"
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                  }}
                >
                  {link.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: "var(--color-primary)" }} />
                )}
              </Link>
            );
          })}
          {/* Profile/Auth tab */}
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl active:scale-90 transition-transform"
              aria-label="Dashboard"
              aria-current={pathname === "/dashboard" ? "page" : undefined}
            >
              <LayoutDashboard
                size={22}
                style={{ color: pathname === "/dashboard" ? "var(--color-primary)" : "var(--color-text-muted)" }}
                strokeWidth={pathname === "/dashboard" ? 2.5 : 1.5}
                aria-hidden="true"
              />
              <span className="text-[10px] font-semibold leading-tight"
                style={{ color: pathname === "/dashboard" ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                Dashboard
              </span>
              {pathname === "/dashboard" && (
                <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: "var(--color-primary)" }} />
              )}
            </Link>
          ) : (
            <Link
              href="/auth"
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl active:scale-90 transition-transform"
              aria-label="Sign In"
              aria-current={pathname === "/auth" ? "page" : undefined}
            >
              <User
                size={22}
                style={{ color: pathname === "/auth" ? "var(--color-primary)" : "var(--color-text-muted)" }}
                strokeWidth={pathname === "/auth" ? 2.5 : 1.5}
                aria-hidden="true"
              />
              <span className="text-[10px] font-semibold leading-tight"
                style={{ color: pathname === "/auth" ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                Sign In
              </span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
