"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, GraduationCap, Building2, Mail, Lock, Phone, MapPin, FileText, Upload, CheckCircle } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";

type UserRole = "student" | "tutor" | "company";

interface FormData {
  role: UserRole;
  // Common fields
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // Student specific
  disabilityType?: string;
  assistiveNeeds?: string;
  
  // Tutor specific
  expertise?: string;
  experience?: string;
  qualifications?: string;
  
  // Company specific
  companyName?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  description?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { announceToScreenReader } = useAccessibility();
  const [step, setStep] = useState<"role" | "details">("role");
  const [formData, setFormData] = useState<FormData>({
    role: "student",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles = [
    {
      value: "student" as const,
      title: "Specially-Abled User",
      description: "Learn new skills and find accessible job opportunities",
      icon: User,
      color: "#818cf8",
    },
    {
      value: "tutor" as const,
      title: "Tutor / Educator",
      description: "Upload courses and help specially-abled individuals learn",
      icon: GraduationCap,
      color: "#10b981",
    },
    {
      value: "company" as const,
      title: "Company / Employer",
      description: "Post accessible jobs and hire talented individuals",
      icon: Building2,
      color: "#f59e0b",
    },
  ];

  const disabilityTypes = [
    "Visual Impairment",
    "Hearing Impairment",
    "Physical Disability",
    "Learning Disability",
    "Speech Impairment",
    "Multiple Disabilities",
    "Other",
  ];

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
    setStep("details");
    announceToScreenReader(`Selected ${role} registration`);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    // Role-specific validation
    if (formData.role === "student" && !formData.disabilityType) {
      newErrors.disabilityType = "Please select disability type";
    }

    if (formData.role === "tutor") {
      if (!formData.expertise?.trim()) newErrors.expertise = "Expertise is required";
      if (!formData.qualifications?.trim()) newErrors.qualifications = "Qualifications are required";
    }

    if (formData.role === "company") {
      if (!formData.companyName?.trim()) newErrors.companyName = "Company name is required";
      if (!formData.industry?.trim()) newErrors.industry = "Industry is required";
      if (!formData.location?.trim()) newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announceToScreenReader("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    announceToScreenReader("Submitting registration...");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        announceToScreenReader("Registration successful! Redirecting to login...");
        setTimeout(() => router.push("/auth?registered=true"), 1500);
      } else {
        const data = await res.json();
        setErrors({ submit: data.error || "Registration failed" });
        announceToScreenReader("Registration failed. Please try again.");
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
      announceToScreenReader("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob blob-purple" style={{ width: "500px", height: "500px", top: "-10%", right: "-5%" }} />
        <div className="blob blob-cyan" style={{ width: "400px", height: "400px", bottom: "10%", left: "-5%" }} />
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
              Join <span className="shimmer-text">RiseAble</span>
            </h1>
            <p className="text-base sm:text-lg" style={{ color: "var(--color-text-muted)" }}>
              Create your account and start your journey
            </p>
          </div>

          {/* Role Selection */}
          {step === "role" && (
            <div className="grid md:grid-cols-3 gap-6">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleSelect(role.value)}
                  className="p-6 rounded-2xl border-2 transition-all hover:scale-105 text-left glass-card-strong card-hover tilt-card"
                  style={{
                    borderColor: "var(--color-border)",
                  }}
                  aria-label={`Register as ${role.title}`}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${role.color}20` }}
                  >
                    <role.icon size={32} style={{ color: role.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
                    {role.title}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {role.description}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Registration Form */}
          {step === "details" && (
            <div
              className="rounded-2xl border p-8 glass-card-strong"
              style={{
                borderColor: "var(--color-border)",
              }}
            >
              {/* Back Button */}
              <button
                onClick={() => setStep("role")}
                className="mb-6 text-sm flex items-center gap-2"
                style={{ color: "var(--color-primary)" }}
              >
                ← Change Role
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${roles.find(r => r.value === formData.role)?.color}20` }}
                >
                  {formData.role === "student" && <User size={24} style={{ color: roles[0].color }} />}
                  {formData.role === "tutor" && <GraduationCap size={24} style={{ color: roles[1].color }} />}
                  {formData.role === "company" && <Building2 size={24} style={{ color: roles[2].color }} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                    {roles.find(r => r.value === formData.role)?.title}
                  </h2>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Fill in your details below
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderColor: errors.name ? "#ef4444" : "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                      placeholder="Enter your full name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderColor: errors.email ? "#ef4444" : "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                      placeholder="your@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderColor: errors.password ? "#ef4444" : "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                      placeholder="Min. 6 characters"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password && (
                      <p id="password-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderColor: errors.confirmPassword ? "#ef4444" : "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                      placeholder="Re-enter password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    />
                    {errors.confirmPassword && (
                      <p id="confirm-password-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      borderColor: errors.phone ? "#ef4444" : "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                    placeholder="+91 XXXXX XXXXX"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Student Specific Fields */}
                {formData.role === "student" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                        Disability Type *
                      </label>
                      <select
                        value={formData.disabilityType || ""}
                        onChange={(e) => handleInputChange("disabilityType", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderColor: errors.disabilityType ? "#ef4444" : "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                        aria-invalid={!!errors.disabilityType}
                        aria-describedby={errors.disabilityType ? "disability-error" : undefined}
                      >
                        <option value="">Select disability type</option>
                        {disabilityTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.disabilityType && (
                        <p id="disability-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                          {errors.disabilityType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                        Assistive Needs (Optional)
                      </label>
                      <textarea
                        value={formData.assistiveNeeds || ""}
                        onChange={(e) => handleInputChange("assistiveNeeds", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                        rows={3}
                        placeholder="Describe any specific assistive technologies or accommodations you need"
                      />
                    </div>
                  </>
                )}

                {/* Tutor Specific Fields */}
                {formData.role === "tutor" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                        Area of Expertise *
                      </label>
                      <input
                        type="text"
                        value={formData.expertise || ""}
                        onChange={(e) => handleInputChange("expertise", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderColor: errors.expertise ? "#ef4444" : "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                        placeholder="e.g., Web Development, Graphic Design, Data Science"
                        aria-invalid={!!errors.expertise}
                        aria-describedby={errors.expertise ? "expertise-error" : undefined}
                      />
                      {errors.expertise && (
                        <p id="expertise-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                          {errors.expertise}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        value={formData.experience || ""}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                        placeholder="e.g., 5 years"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                        Qualifications *
                      </label>
                      <textarea
                        value={formData.qualifications || ""}
                        onChange={(e) => handleInputChange("qualifications", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderColor: errors.qualifications ? "#ef4444" : "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                        rows={3}
                        placeholder="List your degrees, certifications, and relevant qualifications"
                        aria-invalid={!!errors.qualifications}
                        aria-describedby={errors.qualifications ? "qualifications-error" : undefined}
                      />
                      {errors.qualifications && (
                        <p id="qualifications-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                          {errors.qualifications}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Company Specific Fields */}
                {formData.role === "company" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={formData.companyName || ""}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border"
                          style={{
                            backgroundColor: "var(--color-bg-secondary)",
                            borderColor: errors.companyName ? "#ef4444" : "var(--color-border)",
                            color: "var(--color-text)",
                          }}
                          placeholder="Your company name"
                          aria-invalid={!!errors.companyName}
                          aria-describedby={errors.companyName ? "company-name-error" : undefined}
                        />
                        {errors.companyName && (
                          <p id="company-name-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                          Industry *
                        </label>
                        <input
                          type="text"
                          value={formData.industry || ""}
                          onChange={(e) => handleInputChange("industry", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border"
                          style={{
                            backgroundColor: "var(--color-bg-secondary)",
                            borderColor: errors.industry ? "#ef4444" : "var(--color-border)",
                            color: "var(--color-text)",
                          }}
                          placeholder="e.g., Technology, Healthcare"
                          aria-invalid={!!errors.industry}
                          aria-describedby={errors.industry ? "industry-error" : undefined}
                        />
                        {errors.industry && (
                          <p id="industry-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                            {errors.industry}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                          Location *
                        </label>
                        <input
                          type="text"
                          value={formData.location || ""}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border"
                          style={{
                            backgroundColor: "var(--color-bg-secondary)",
                            borderColor: errors.location ? "#ef4444" : "var(--color-border)",
                            color: "var(--color-text)",
                          }}
                          placeholder="City, State"
                          aria-invalid={!!errors.location}
                          aria-describedby={errors.location ? "location-error" : undefined}
                        />
                        {errors.location && (
                          <p id="location-error" className="text-xs mt-1" style={{ color: "#ef4444" }}>
                            {errors.location}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                          Company Size
                        </label>
                        <select
                          value={formData.companySize || ""}
                          onChange={(e) => handleInputChange("companySize", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border"
                          style={{
                            backgroundColor: "var(--color-bg-secondary)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text)",
                          }}
                        >
                          <option value="">Select size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                        Company Description
                      </label>
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                        rows={3}
                        placeholder="Brief description of your company and accessibility initiatives"
                      />
                    </div>
                  </>
                )}

                {/* Submit Error */}
                {errors.submit && (
                  <div
                    className="p-4 rounded-xl text-sm"
                    style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
                    role="alert"
                  >
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-semibold text-white text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cta-shimmer"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>

                {/* Login Link */}
                <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Already have an account?{" "}
                  <a
                    href="/auth"
                    className="font-semibold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Sign In
                  </a>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
