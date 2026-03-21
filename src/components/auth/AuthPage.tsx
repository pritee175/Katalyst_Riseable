"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Scan,
  Mic,
  Fingerprint,
  ArrowRight,
  Loader2,
} from "lucide-react";

type AuthMode = "login" | "signup";
type AuthMethod = "traditional" | "face" | "voice" | "biometric";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [method, setMethod] = useState<AuthMethod>("traditional");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [faceStatus, setFaceStatus] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");

  const { login, signup, loginWithGoogle, loginWithFace, loginWithVoice } = useAuth();
  const router = useRouter();

  const handleTraditionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let success: boolean;
      if (mode === "login") {
        success = await login(email, password);
      } else {
        success = await signup(name, email, password);
      }
      if (success) router.push("/");
      else setError("Authentication failed. Please try again.");
    } catch {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const success = await loginWithGoogle();
    if (success) router.push("/");
    setLoading(false);
  };

  const handleFaceLogin = async () => {
    setFaceStatus("Accessing camera...");
    setTimeout(() => setFaceStatus("Scanning face..."), 1000);
    setTimeout(() => setFaceStatus("Matching features..."), 2000);
    setLoading(true);
    const success = await loginWithFace();
    if (success) {
      setFaceStatus("Face recognized! Logging in...");
      setTimeout(() => router.push("/"), 500);
    } else {
      setFaceStatus("Face not recognized. Please try again.");
    }
    setLoading(false);
  };

  const handleVoiceLogin = async () => {
    setVoiceStatus("Listening... Please say your passphrase");
    setLoading(true);
    const success = await loginWithVoice();
    if (success) {
      setVoiceStatus("Voice recognized! Logging in...");
      setTimeout(() => router.push("/"), 500);
    } else {
      setVoiceStatus("Voice not recognized. Please try again.");
    }
    setLoading(false);
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const success = await login("biometric@demo.com", "demo");
    if (success) router.push("/");
    setLoading(false);
  };

  const authMethods: { id: AuthMethod; label: string; icon: React.ComponentType<{ size: number }>; description: string }[] = [
    { id: "traditional", label: "Email & Password", icon: Mail, description: "Sign in with email and password" },
    { id: "face", label: "Face Recognition", icon: Scan, description: "Sign in using your face" },
    { id: "voice", label: "Voice Auth", icon: Mic, description: "Sign in with your voice" },
    { id: "biometric", label: "Biometric", icon: Fingerprint, description: "Use fingerprint or biometric" },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden pb-16 md:pb-0">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob blob-purple" style={{ width: "500px", height: "500px", top: "-10%", right: "-5%" }} />
        <div className="blob blob-cyan" style={{ width: "400px", height: "400px", bottom: "-5%", left: "30%" }} />
      </div>

      {/* Left Panel — Inspiring Image */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80"
          alt="Person with disability achieving success in a collaborative environment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.75), rgba(10,10,15,0.85))" }} />

        {/* 3D Orb (CSS-only) */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full animate-float-slow" aria-hidden="true"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.6), rgba(6,182,212,0.3), transparent)",
            boxShadow: "0 0 60px rgba(124,58,237,0.3), 0 0 120px rgba(6,182,212,0.15)",
          }} />

        <div className="relative z-10 text-center px-12">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome to RiseAble</h2>
          <p className="text-lg text-white/80 mb-8">
            &ldquo;The only disability in life is a bad attitude.&rdquo;
          </p>
          <p className="text-sm text-white/60">— Scott Hamilton</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-6 sm:py-12 relative" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {mode === "login"
                ? "Sign in to access your dashboard"
                : "Join RiseAble to start learning"}
            </p>
          </div>

          {/* Auth Method Selector */}
          <fieldset className="mb-6">
            <legend className="sr-only">Choose authentication method</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {authMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all duration-200 glass-card"
                  style={{
                    borderColor: method === m.id ? "var(--color-primary)" : "var(--color-border)",
                    color: method === m.id ? "var(--color-primary)" : "var(--color-text-muted)",
                    boxShadow: method === m.id ? "0 0 16px var(--glow-purple)" : "none",
                  }}
                  aria-pressed={method === m.id}
                  aria-label={m.description}
                >
                  <m.icon size={20} />
                  <span className="leading-tight text-center">{m.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {error && (
            <div
              className="p-3 mb-4 rounded-lg text-sm"
              role="alert"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--color-error)" }}
            >
              {error}
            </div>
          )}

          {/* Traditional Login/Signup */}
          {method === "traditional" && (
            <form onSubmit={handleTraditionalSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="relative">
                  <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} aria-hidden="true" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 glass-card"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 glass-card"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all duration-200 glass-card"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} style={{ color: "var(--color-text-muted)" }} /> : <Eye size={18} style={{ color: "var(--color-text-muted)" }} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60 cta-shimmer"
                style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>

              {/* Google login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all glass-card hover:scale-[1.01]"
                style={{ color: "var(--color-text)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>
          )}

          {/* Face Recognition */}
          {method === "face" && (
            <div className="text-center py-6 space-y-4">
              <div
                className="w-40 h-40 mx-auto rounded-full border-4 border-dashed flex items-center justify-center glass-card"
                style={{ borderColor: "var(--color-primary)" }}
                role="img"
                aria-label="Face recognition scanner area"
              >
                <Scan size={64} style={{ color: "var(--color-primary)" }} />
              </div>
              {faceStatus && (
                <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }} role="status">
                  {faceStatus}
                </p>
              )}
              <button
                onClick={handleFaceLogin}
                disabled={loading}
                className="px-8 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60 cta-shimmer"
                style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
              >
                {loading ? <Loader2 size={20} className="animate-spin inline mr-2" /> : null}
                Start Face Scan
              </button>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Position your face within the circle and ensure good lighting
              </p>
            </div>
          )}

          {/* Voice Authentication */}
          {method === "voice" && (
            <div className="text-center py-6 space-y-4">
              <div
                className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center glass-card ${loading ? "animate-pulse" : ""}`}
                style={{ borderColor: loading ? "var(--color-success)" : "var(--color-secondary)" }}
                role="img"
                aria-label="Voice authentication microphone"
              >
                <Mic size={64} style={{ color: "var(--color-secondary)" }} />
              </div>
              {voiceStatus && (
                <p className="text-sm font-medium" style={{ color: "var(--color-secondary)" }} role="status">
                  {voiceStatus}
                </p>
              )}
              <button
                onClick={handleVoiceLogin}
                disabled={loading}
                className="px-8 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--color-secondary), #0891B2)" }}
              >
                {loading ? <Loader2 size={20} className="animate-spin inline mr-2" /> : null}
                Start Voice Auth
              </button>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Say your registered passphrase clearly
              </p>
            </div>
          )}

          {/* Biometric */}
          {method === "biometric" && (
            <div className="text-center py-6 space-y-4">
              <div
                className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center glass-card ${loading ? "animate-pulse" : ""}`}
                style={{ borderColor: "var(--color-accent)" }}
                role="img"
                aria-label="Biometric scanner"
              >
                <Fingerprint size={64} style={{ color: "var(--color-accent)" }} />
              </div>
              <button
                onClick={handleBiometricLogin}
                disabled={loading}
                className="px-8 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))" }}
              >
                {loading ? <Loader2 size={20} className="animate-spin inline mr-2" /> : null}
                Authenticate with Biometric
              </button>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Touch your fingerprint sensor or use Windows Hello
              </p>
            </div>
          )}

          {/* Toggle login/signup */}
          <div className="mt-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {mode === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setMode("signup"); setMethod("traditional"); }}
                  className="font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
