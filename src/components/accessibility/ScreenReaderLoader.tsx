"use client";

import dynamic from "next/dynamic";

const ScreenReader = dynamic(
  () => import("@/components/accessibility/ScreenReader"),
  { ssr: false }
);

export default function ScreenReaderLoader() {
  return <ScreenReader />;
}
