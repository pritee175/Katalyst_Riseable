import type { Metadata } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccessibilityToolbar from "@/components/accessibility/AccessibilityToolbar";
import VoiceNavigationLoader from "@/components/accessibility/VoiceNavigationLoader";
import SignNavigationLoader from "@/components/accessibility/SignNavigationLoader";

export const metadata: Metadata = {
  title: "RiseAble — Learn Skills & Find Accessible Jobs",
  description:
    "An accessibility-first platform empowering specially-abled individuals to learn skills, find disability-friendly jobs, and access government schemes. WCAG 2.1 compliant.",
  keywords: [
    "disability",
    "accessible",
    "jobs",
    "courses",
    "skills",
    "specially-abled",
    "WCAG",
    "inclusive",
    "screen reader",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-text-size="normal" data-font="default">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AccessibilityProvider>
          <AuthProvider>
            {/* Skip to main content — essential for keyboard users */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>

            <Navbar />

            <main id="main-content" tabIndex={-1}>
              {children}
            </main>

            <Footer />

            {/* Floating tools */}
            <SignNavigationLoader />
            <AccessibilityToolbar />
            <VoiceNavigationLoader />
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
