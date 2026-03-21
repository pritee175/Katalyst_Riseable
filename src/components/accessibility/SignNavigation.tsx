"use client";

import { useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { GestureNavigation } from "@/components/accessibility/GestureNavigation";

export default function SignNavigation() {
  const { gestureNavigationEnabled, toggleGestureNavigation } = useAccessibility();

  return (
    <>
      {gestureNavigationEnabled && (
        <GestureNavigation onClose={toggleGestureNavigation} />
      )}
    </>
  );
}
