"use client";

import React from "react";
import { Monitor, Mic, Type, Eye, Keyboard, Captions, Hand, Moon } from "lucide-react";
import { WaveDivider } from "./Illustrations";

const features = [
  { icon: Monitor, title: "Screen Reader Compatible", description: "Full ARIA labels and semantic HTML. Works with NVDA, JAWS, VoiceOver.", color: "#818cf8" },
  { icon: Mic, title: "Voice Navigation", description: "Navigate using voice commands. Say 'open courses' or 'find jobs'.", color: "#a78bfa" },
  { icon: Type, title: "Adjustable Text & Fonts", description: "Increase text size, switch to dyslexia-friendly fonts.", color: "#38bdf8" },
  { icon: Eye, title: "High Contrast Mode", description: "Light, dark, and high contrast themes for optimal visibility.", color: "#34d399" },
  { icon: Keyboard, title: "Keyboard Navigation", description: "Tab through every element with clear focus indicators.", color: "#818cf8" },
  { icon: Captions, title: "Captions & Transcripts", description: "All content includes captions, audio, and text transcripts.", color: "#a78bfa" },
  { icon: Hand, title: "Sign Language Support", description: "Select courses feature sign language interpretation.", color: "#38bdf8" },
  { icon: Moon, title: "Reduced Motion", description: "Respects system preferences. Toggle animations on or off.", color: "#34d399" },
];

export default function FeaturesSection() {
  return (
    <>
      <WaveDivider />
      <section
        aria-labelledby="features-heading"
        className="py-24 px-4 sm:px-6 lg:px-8 relative"
        style={{ backgroundColor: "var(--color-bg-secondary)" }}
      >
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 grid-pattern pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)" }}>
              Accessibility
            </p>
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
              Built for real accessibility
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "var(--color-text-muted)" }}>
              Not just compliant — designed for users with disabilities.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group p-5 rounded-2xl border card-hover gradient-border animate-fade-in-up relative overflow-hidden"
                style={{
                  backgroundColor: "var(--color-bg-card)",
                  borderColor: "var(--color-border)",
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at top right, ${feature.color}15, transparent 70%)` }}
                  aria-hidden="true" />

                {/* Animated icon container */}
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}15)` }}>
                  <feature.icon size={28} style={{ color: feature.color }} aria-hidden="true" />
                  {/* Pulse ring on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"
                    style={{ boxShadow: `0 0 30px ${feature.color}40` }} />
                </div>

                <h3 className="relative font-semibold text-base mb-2" style={{ color: "var(--color-text)" }}>{feature.title}</h3>
                <p className="relative text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider flip />
    </>
  );
}
