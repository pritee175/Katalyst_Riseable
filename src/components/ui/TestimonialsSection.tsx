"use client";

import React from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Web Developer",
    quote: "RiseAble's screen reader support is excellent. I completed the web dev course and landed a remote job within 3 months.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    gradient: "linear-gradient(135deg, #818cf8, #6366f1)",
  },
  {
    name: "Sneha Deshmukh",
    role: "Data Entry Specialist",
    quote: "Voice navigation changed everything for me. I browse courses and apply for jobs without struggling with a mouse.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    gradient: "linear-gradient(135deg, #a78bfa, #7c3aed)",
  },
  {
    name: "Ravi Kumar",
    role: "Freelance Designer",
    quote: "Every video has captions and transcripts. The sign language videos in some courses are a great touch.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    gradient: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 relative particles"
    >
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-8 sm:mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2 sm:mb-3" style={{ color: "var(--color-secondary)" }}>
            Testimonials
          </p>
          <h2 id="testimonials-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{ color: "var(--color-text)" }}>
            Community stories
          </h2>
          <p className="text-sm sm:text-base max-w-lg mx-auto" style={{ color: "var(--color-text-muted)" }}>
            Real people, real impact.
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: "none" }}>
          {testimonials.map((t, i) => (
            <article
              key={t.name}
              className="group p-5 sm:p-7 rounded-2xl border card-hover gradient-border animate-fade-in-up relative overflow-hidden min-w-[280px] sm:min-w-[300px] md:min-w-0 snap-start flex-shrink-0 md:flex-shrink"
              style={{
                backgroundColor: "var(--color-bg-card)",
                borderColor: "var(--color-border)",
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {/* Background gradient effect */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                style={{ background: t.gradient }} aria-hidden="true" />

              {/* Quote icon with animated background */}
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                style={{ background: `${t.gradient}20` }}>
                <Quote size={24} style={{ color: "var(--color-primary)" }} aria-hidden="true" />
              </div>

              <p className="relative text-base leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="relative flex items-center gap-1 mb-5" aria-label={`Rating: ${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} fill="var(--color-warning)" style={{ color: "var(--color-warning)" }}
                    className="animate-bounce-subtle"
                    aria-hidden="true" />
                ))}
              </div>

              <div className="relative flex items-center gap-4">
                {/* Avatar with real photo */}
                <div className="relative w-14 h-14 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-lg ring-2 ring-offset-2 ring-offset-[var(--color-bg-card)]"
                  style={{ ["--tw-ring-color" as string]: t.gradient } as React.CSSProperties}>
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ boxShadow: `0 0 20px ${t.gradient}` }} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-base" style={{ color: "var(--color-text)" }}>{t.name}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
