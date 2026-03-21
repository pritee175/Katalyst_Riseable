"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Briefcase, ArrowRight, Shield, Mic, Sparkles } from "lucide-react";
import { HeroIllustration } from "./Illustrations";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[80vh] sm:min-h-[92vh] flex items-center overflow-hidden particles grid-pattern"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.07] animate-float-slow"
          style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full opacity-[0.06] animate-float delay-300"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }} />
        <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] rounded-full opacity-[0.04] animate-float-slow delay-500"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-purple-400/20 animate-ping" />
        <div className="absolute bottom-40 right-20 w-3 h-3 rounded-full bg-blue-400/20 animate-ping" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-indigo-400/20 animate-ping" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left — Copy */}
          <div>
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 glass-card"
              style={{ color: "var(--color-primary)" }}>
              <Sparkles size={14} aria-hidden="true" />
              Accessibility-First Platform
            </div>

            <h1
              id="hero-heading"
              className="animate-fade-in-up delay-100 text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.12] mb-4 sm:mb-6 tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Your abilities{" "}
              <span className="shimmer-text">define you.</span>
            </h1>

            <p className="animate-fade-in-up delay-200 text-base sm:text-lg mb-6 sm:mb-10 max-w-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}>
              Learn accessible skills. Find inclusive jobs. Access government benefits — all in one platform.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up delay-300 flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Link
                href="/courses"
                className="btn-glow inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 animate-glow"
                style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
              >
                <BookOpen size={18} aria-hidden="true" />
                Explore Courses
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base border transition-all hover:scale-105 active:scale-95 gradient-border"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                <Briefcase size={18} aria-hidden="true" />
                Find Jobs
              </Link>
            </div>

            {/* Trust bar */}
            <div className="animate-fade-in-up delay-400 flex flex-wrap gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
              <span className="flex items-center gap-1.5">
                <Shield size={14} style={{ color: "var(--color-success)" }} aria-hidden="true" />
                WCAG 2.1 Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Mic size={14} style={{ color: "var(--color-primary)" }} aria-hidden="true" />
                Voice Navigation
              </span>
            </div>
          </div>

          {/* Right — Real hero image */}
          <div className="hidden lg:block animate-fade-in-up delay-300 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main hero image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-glow">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="People collaborating and learning together"
                  className="w-full h-auto aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Floating image cards */}
              <div className="absolute -top-6 -left-6 w-32 h-32 rounded-2xl overflow-hidden shadow-xl animate-float delay-200">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80"
                  alt="Student learning online"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-2xl overflow-hidden shadow-xl animate-float-slow delay-400">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80"
                  alt="Professional working at desk"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute top-1/2 -right-8 w-24 h-24 rounded-2xl overflow-hidden shadow-xl animate-float delay-600">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80"
                  alt="Person using assistive technology"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="animate-fade-in-up delay-500 mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden glass-card">
          {[
            { number: "9+", label: "Courses" },
            { number: "50+", label: "Jobs" },
            { number: "8", label: "Schemes" },
            { number: "Free", label: "Forever" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center py-6 px-4"
              style={{ borderRight: i < 3 ? "1px solid var(--color-border)" : "none" }}>
              <p className="text-2xl font-bold shimmer-text">{stat.number}</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
