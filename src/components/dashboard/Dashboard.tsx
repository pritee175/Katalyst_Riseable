"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { courses } from "@/data/courses";
import { jobs } from "@/data/jobs";
import {
  BookOpen, Briefcase, TrendingUp, Bookmark, Award,
  ChevronRight, Play, X, User, Globe, Keyboard,
  Volume2, Hand, Settings, ArrowRight, Zap, Target,
  Calendar, Flame, Trophy, Clock, CheckCircle2,
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, unenrollCourse, unsaveJob } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 particles grid-pattern">
        <div className="text-center max-w-sm animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-glow"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>Sign in to continue</h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>Access your courses, saved jobs, and progress.</p>
          <Link href="/auth" className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
            Sign In <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const enrolledCourseData = courses.filter(c => user.enrolledCourses.includes(c.id));
  const savedJobData = jobs.filter(j => user.savedJobs.includes(j.id));
  const totalProgress = enrolledCourseData.length
    ? Math.round(enrolledCourseData.reduce((sum, c) => sum + (user.courseProgress[c.id] ?? 0), 0) / enrolledCourseData.length)
    : 0;
  const certificates = enrolledCourseData.filter(c => (user.courseProgress[c.id] ?? 0) >= 100).length;

  // Generate streak calendar data (last 30 days)
  const generateStreakData = () => {
    const days: { date: Date; intensity: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Simulate activity (random for demo)
      const hasActivity = Math.random() > 0.3;
      const intensity = hasActivity ? Math.floor(Math.random() * 3) + 1 : 0;
      days.push({ date, intensity });
    }
    return days;
  };

  const streakData = generateStreakData();
  const currentStreak = 7; // Demo value
  const longestStreak = 15; // Demo value

  // Weekly activity data for chart
  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.2 },
    { day: "Wed", hours: 1.8 },
    { day: "Thu", hours: 4.1 },
    { day: "Fri", hours: 2.9 },
    { day: "Sat", hours: 3.5 },
    { day: "Sun", hours: 2.2 },
  ];
  const maxHours = Math.max(...weeklyData.map(d => d.hours));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob blob-purple" style={{ width: "500px", height: "500px", top: "-10%", right: "-5%" }} />
        <div className="blob blob-cyan" style={{ width: "400px", height: "400px", bottom: "10%", left: "-5%" }} />
      </div>
      <div className="absolute inset-0 grid-pattern pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ===== Header with Profile Image ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-offset-2 ring-offset-[var(--color-bg)]"
                style={{ ["--tw-ring-color" as string]: "var(--color-primary)" } as React.CSSProperties}>
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--color-success), #059669)" }}>
                <CheckCircle2 size={14} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                Welcome back, {user.name}!
              </h1>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Keep up the great work on your learning journey
              </p>
            </div>
          </div>
        </div>

        {/* ===== Stats Grid with Images ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: "Enrolled Courses", 
              value: user.enrolledCourses.length, 
              icon: BookOpen, 
              gradient: "linear-gradient(135deg, #818cf8, #6366f1)", 
              accent: "#818cf8",
              image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80"
            },
            { 
              label: "Saved Jobs", 
              value: user.savedJobs.length, 
              icon: Bookmark, 
              gradient: "linear-gradient(135deg, #a78bfa, #7c3aed)", 
              accent: "#a78bfa",
              image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80"
            },
            { 
              label: "Avg. Progress", 
              value: `${totalProgress}%`, 
              icon: TrendingUp, 
              gradient: "linear-gradient(135deg, #34d399, #059669)", 
              accent: "#34d399",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80"
            },
            { 
              label: "Certificates", 
              value: certificates, 
              icon: Award, 
              gradient: "linear-gradient(135deg, #fbbf24, #d97706)", 
              accent: "#fbbf24",
              image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80"
            },
          ].map((stat, i) => (
            <div key={stat.label}
              className="group relative overflow-hidden rounded-2xl border card-hover glass-card-strong gradient-top-border animate-fade-in-up"
              style={{
                borderColor: "var(--color-border)",
                animationDelay: `${i * 0.1}s`,
              }}>
              {/* Gradient accent */}
              <div className="absolute inset-0" style={{ background: stat.gradient, opacity: 0.04 }} />
              
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg"
                    style={{ background: stat.gradient }}>
                    <stat.icon size={20} className="text-white" aria-hidden="true" />
                  </div>
                  <span className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>{stat.value}</span>
                </div>
                <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Main Layout ===== */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Courses + Progress Chart (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Weekly Activity Chart */}
            <section className="rounded-2xl border p-6 glass-card animate-fade-in-up delay-100"
              style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--color-accent), #0284c7)" }}>
                    <TrendingUp size={16} className="text-white" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Weekly Activity</h2>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-muted)" }}>
                  Last 7 days
                </span>
              </div>

              {/* Line Chart */}
              <div className="relative h-48">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full h-px" style={{ backgroundColor: "var(--color-border)", opacity: 0.3 }} />
                  ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] pr-2" style={{ color: "var(--color-text-muted)" }}>
                  {[maxHours, maxHours * 0.75, maxHours * 0.5, maxHours * 0.25, 0].map((val, i) => (
                    <span key={i}>{val.toFixed(1)}h</span>
                  ))}
                </div>

                {/* SVG Line Chart */}
                <svg className="w-full h-full pl-8" viewBox="0 0 700 192" preserveAspectRatio="none">
                  <defs>
                    {/* Gradient for line */}
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="50%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    
                    {/* Gradient for area fill */}
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Area under the line */}
                  <path
                    d={`M 0 ${192 - (weeklyData[0].hours / maxHours) * 192} 
                        ${weeklyData.map((data, i) => 
                          `L ${(i * 100)} ${192 - (data.hours / maxHours) * 192}`
                        ).join(' ')} 
                        L ${(weeklyData.length - 1) * 100} 192 
                        L 0 192 Z`}
                    fill="url(#areaGradient)"
                    className="animate-fade-in"
                  />

                  {/* Line */}
                  <path
                    d={weeklyData.map((data, i) => 
                      `${i === 0 ? 'M' : 'L'} ${i * 100} ${192 - (data.hours / maxHours) * 192}`
                    ).join(' ')}
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-fade-in"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(129, 140, 248, 0.3))"
                    }}
                  />

                  {/* Data points */}
                  {weeklyData.map((data, i) => {
                    const y = 192 - (data.hours / maxHours) * 192;
                    return (
                      <g key={i} className="animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        {/* Outer glow circle */}
                        <circle
                          cx={i * 100}
                          cy={y}
                          r="8"
                          fill="#818cf8"
                          opacity="0.2"
                          className="animate-ping"
                          style={{ animationDuration: "2s", animationDelay: `${i * 0.1}s` }}
                        />
                        {/* Main point */}
                        <circle
                          cx={i * 100}
                          cy={y}
                          r="5"
                          fill="#ffffff"
                          stroke="#818cf8"
                          strokeWidth="3"
                          className="cursor-pointer transition-all hover:r-7"
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(129, 140, 248, 0.4))"
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="flex justify-between mt-3 pl-8">
                  {weeklyData.map((data, i) => (
                    <div key={i} className="flex-1 text-center">
                      <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                        {data.day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hover tooltips */}
                <div className="absolute inset-0 flex justify-between pl-8 pointer-events-none">
                  {weeklyData.map((data, i) => (
                    <div key={i} className="flex-1 flex justify-center">
                      <div className="group relative">
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-auto"
                          style={{ 
                            backgroundColor: "var(--color-bg-card)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            border: "1px solid var(--color-border)"
                          }}>
                          <div className="text-xs font-bold" style={{ color: "var(--color-text)" }}>
                            {data.hours} hours
                          </div>
                          <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                            {data.day}
                          </div>
                        </div>
                        <div className="w-full h-48 cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)" }} />
                  <Clock size={14} style={{ color: "var(--color-primary)" }} />
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    Total: <strong style={{ color: "var(--color-text)" }}>20.2 hours</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={14} style={{ color: "var(--color-success)" }} />
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    Avg: <strong style={{ color: "var(--color-text)" }}>2.9 hrs/day</strong>
                  </span>
                </div>
              </div>
            </section>

            {/* My Courses with Images */}
            <section className="rounded-2xl border p-6 glass-card animate-fade-in-up delay-200"
              style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
                    <BookOpen size={16} className="text-white" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>My Courses</h2>
                </div>
                <Link href="/courses" className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: "var(--color-primary)" }}>
                  Browse All <ArrowRight size={12} />
                </Link>
              </div>

              {enrolledCourseData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" 
                      alt="Start learning"
                      className="w-full h-full object-cover opacity-50"
                    />
                  </div>
                  <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>No courses enrolled yet.</p>
                  <Link href="/courses" className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>Explore Courses</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledCourseData.map((course, i) => {
                    const progress = user.courseProgress[course.id] ?? 0;
                    return (
                      <div key={course.id}
                        className="group flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-[rgba(129,140,248,0.3)] animate-fade-in-up"
                        style={{ backgroundColor: "var(--color-bg-secondary)", borderColor: "transparent", animationDelay: `${0.3 + i * 0.08}s` }}>

                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate mb-1" style={{ color: "var(--color-text)" }}>{course.title}</h3>
                          <p className="text-[11px] mb-2" style={{ color: "var(--color-text-muted)" }}>
                            {course.lessons} lessons • {course.duration}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
                              <div className="h-2 rounded-full transition-all duration-700"
                                style={{
                                  width: `${progress}%`,
                                  background: progress >= 100
                                    ? "linear-gradient(90deg, #34d399, #059669)"
                                    : "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
                                }}
                                role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${course.title}: ${progress}%`} />
                            </div>
                            <span className="text-xs font-bold w-10 text-right"
                              style={{ color: progress >= 100 ? "var(--color-success)" : "var(--color-primary)" }}>
                              {progress}%
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <Link href={`/courses/${course.id}`}
                            className="btn-glow p-2.5 rounded-lg text-white transition-transform hover:scale-110"
                            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                            aria-label={`Continue ${course.title}`}>
                            <Play size={14} />
                          </Link>
                          <button onClick={() => unenrollCourse(course.id)}
                            className="p-2.5 rounded-lg transition-all hover:scale-110"
                            style={{ backgroundColor: "var(--color-bg-card)", color: "var(--color-text-muted)" }}
                            aria-label={`Remove ${course.title}`}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Streak Calendar */}
            <section className="rounded-2xl border p-5 glass-card animate-fade-in-up delay-200"
              style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame size={16} style={{ color: "var(--color-warning)" }} aria-hidden="true" />
                  <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>Learning Streak</h2>
                </div>
              </div>

              {/* Streak Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame size={16} style={{ color: "var(--color-warning)" }} />
                    <span className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{currentStreak}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Current Streak</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy size={16} style={{ color: "var(--color-primary)" }} />
                    <span className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{longestStreak}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Longest Streak</p>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {streakData.map((day, i) => {
                    const colors = [
                      "var(--color-border)",
                      "rgba(129, 140, 248, 0.3)",
                      "rgba(129, 140, 248, 0.6)",
                      "var(--color-primary)"
                    ];
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded transition-all hover:scale-110"
                        style={{ 
                          backgroundColor: colors[day.intensity],
                          cursor: "pointer"
                        }}
                        title={`${day.date.toLocaleDateString()}: ${day.intensity > 0 ? 'Active' : 'No activity'}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="w-3 h-3 rounded" 
                      style={{ backgroundColor: ["var(--color-border)", "rgba(129, 140, 248, 0.3)", "rgba(129, 140, 248, 0.6)", "var(--color-primary)"][i] }} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-2xl border p-5 glass-card animate-fade-in-up delay-300"
              style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} style={{ color: "var(--color-warning)" }} aria-hidden="true" />
                <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>Quick Actions</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Explore Courses", href: "/courses", icon: BookOpen, color: "#818cf8" },
                  { label: "Find Jobs", href: "/jobs", icon: Briefcase, color: "#a78bfa" },
                  { label: "Gov. Schemes", href: "/schemes", icon: Award, color: "#34d399" },
                ].map(a => (
                  <Link key={a.href} href={a.href}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:translate-x-1"
                    style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${a.color}15` }}>
                      <a.icon size={14} style={{ color: a.color }} aria-hidden="true" />
                    </div>
                    {a.label}
                    <ChevronRight size={14} className="ml-auto transition-transform group-hover:translate-x-1" style={{ color: "var(--color-text-muted)" }} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Progress Overview */}
            <section className="rounded-2xl border p-5 glass-card animate-fade-in-up delay-400"
              style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Target size={14} style={{ color: "var(--color-success)" }} aria-hidden="true" />
                <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>Course Progress</h2>
              </div>

              {/* Circular Progress */}
              {enrolledCourseData.length > 0 && (
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    {/* Background circle */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="var(--color-border)"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - totalProgress / 100)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7C3AED" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
                        {totalProgress}%
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                        Overall
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {enrolledCourseData.length > 0 ? enrolledCourseData.map(course => {
                  const p = user.courseProgress[course.id] ?? 0;
                  return (
                    <div key={course.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs truncate max-w-[70%]" style={{ color: "var(--color-text-secondary)" }}>{course.title}</span>
                        <span className="text-xs font-bold" style={{ color: p >= 100 ? "var(--color-success)" : "var(--color-primary)" }}>{p}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
                        <div className="h-2 rounded-full transition-all duration-1000 relative overflow-hidden progress-glow"
                          style={{
                            width: `${p}%`,
                            background: p >= 100
                              ? "linear-gradient(90deg, #34d399, #059669)"
                              : "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
                          }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                            style={{ backgroundSize: "200% 100%" }} />
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-center py-6" style={{ color: "var(--color-text-muted)" }}>Enroll in a course to track progress.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
