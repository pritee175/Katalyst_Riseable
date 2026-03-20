"use client";

import dynamic from "next/dynamic";

const SignNavigation = dynamic(
  () => import("@/components/accessibility/SignNavigation"),
  { ssr: false }
);

export default function SignNavigationLoader() {
  return <SignNavigation />;
}
