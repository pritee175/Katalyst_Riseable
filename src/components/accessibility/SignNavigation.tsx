"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CameraOff, X, Hand, Navigation, ChevronUp, ChevronDown, Home, BookOpen, Briefcase, MessageCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccessibility } from "@/context/AccessibilityContext";

/*
  Sign Navigation — Camera-based gesture recognition for hands-free navigation.

  Gestures detected via simple hand position tracking using the webcam:
  - Open palm (5 fingers) → Navigate to Courses
  - Fist (closed hand) → Navigate to Jobs
  - Thumbs up → Scroll Up
  - Wave (hand side-to-side) → Navigate Home
  - Point up → Scroll Up
  - Point down → Scroll Down
  - Two fingers (peace sign) → Navigate to Chat
  - "L" shape → Go Back

  Uses simple color/motion detection (no external ML library needed).
  For a production app, you'd integrate MediaPipe Hands or TensorFlow.js HandPose.
*/

// Gesture-to-action mapping
interface GestureAction {
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  gesture: string;
}

export default function SignNavigation() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [gestureConfidence, setGestureConfidence] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [motionLevel, setMotionLevel] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  const [lastAction, setLastAction] = useState<string>("");
  const [showGuide, setShowGuide] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const animFrameRef = useRef<number>(0);
  const gestureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef(false);

  const router = useRouter();
  const { announceToScreenReader } = useAccessibility();

  // Define gesture actions
  const gestureActions: GestureAction[] = [
    {
      name: "Open Palm",
      description: "Navigate to Courses",
      icon: <BookOpen size={16} />,
      gesture: "open_palm",
      action: () => { router.push("/courses"); announceToScreenReader("Navigating to Courses"); },
    },
    {
      name: "Fist",
      description: "Navigate to Jobs",
      icon: <Briefcase size={16} />,
      gesture: "fist",
      action: () => { router.push("/jobs"); announceToScreenReader("Navigating to Jobs"); },
    },
    {
      name: "Wave",
      description: "Go to Home",
      icon: <Home size={16} />,
      gesture: "wave",
      action: () => { router.push("/"); announceToScreenReader("Navigating to Home"); },
    },
    {
      name: "Peace Sign",
      description: "Open AI Chat",
      icon: <MessageCircle size={16} />,
      gesture: "peace",
      action: () => { router.push("/chat"); announceToScreenReader("Navigating to Chat"); },
    },
    {
      name: "Thumbs Up",
      description: "Scroll Up",
      icon: <ChevronUp size={16} />,
      gesture: "thumbs_up",
      action: () => { window.scrollBy({ top: -400, behavior: "smooth" }); announceToScreenReader("Scrolling up"); },
    },
    {
      name: "Point Down",
      description: "Scroll Down",
      icon: <ChevronDown size={16} />,
      gesture: "point_down",
      action: () => { window.scrollBy({ top: 400, behavior: "smooth" }); announceToScreenReader("Scrolling down"); },
    },
    {
      name: "L Shape",
      description: "Go Back",
      icon: <ArrowLeft size={16} />,
      gesture: "l_shape",
      action: () => { window.history.back(); announceToScreenReader("Going back"); },
    },
  ];

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        // Wait for video to be ready before showing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setShowCamera(true);
        };
      }
    } catch (err: any) {
      setCameraError("Camera access denied. Please allow camera permission.");
      console.error("Camera error:", err);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    prevFrameRef.current = null;
    setShowCamera(false);
    setHandDetected(false);
    setCurrentGesture(null);
  }, []);

  // Simple motion + skin-color based gesture detection
  const detectGestures = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = 320;
    canvas.height = 240;

    const processFrame = () => {
      if (!streamRef.current) return;

      ctx.drawImage(video, 0, 0, 320, 240);
      const currentFrame = ctx.getImageData(0, 0, 320, 240);
      const pixels = currentFrame.data;

      // Detect skin-colored pixels (simple HSV heuristic)
      let skinPixels = 0;
      let skinX = 0, skinY = 0;
      let totalPixels = 0;
      // Track regions
      let topSkin = 0, bottomSkin = 0, leftSkin = 0, rightSkin = 0;
      let centerSkin = 0;

      for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel for speed
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];

        // Skin color detection (works for various skin tones)
        const isSkin = (
          r > 60 && g > 40 && b > 20 &&
          r > g && r > b &&
          (r - g) > 15 &&
          Math.abs(r - g) < 120 &&
          r - b > 15
        );

        if (isSkin) {
          const px = Math.floor((i / 4) % 320);
          const py = Math.floor((i / 4) / 320);
          skinPixels++;
          skinX += px;
          skinY += py;

          // Quadrant tracking
          if (py < 120) topSkin++;
          else bottomSkin++;
          if (px < 160) leftSkin++;
          else rightSkin++;
          if (px > 100 && px < 220 && py > 60 && py < 180) centerSkin++;
        }
        totalPixels++;
      }

      // Calculate skin percentage and position
      const skinPercent = (skinPixels / totalPixels) * 100;
      const avgX = skinPixels > 0 ? skinX / skinPixels : 0;
      const avgY = skinPixels > 0 ? skinY / skinPixels : 0;

      // Motion detection
      let motionPixels = 0;
      if (prevFrameRef.current) {
        const prev = prevFrameRef.current.data;
        for (let i = 0; i < pixels.length; i += 16) {
          const diff = Math.abs(pixels[i] - prev[i]) + Math.abs(pixels[i + 1] - prev[i + 1]) + Math.abs(pixels[i + 2] - prev[i + 2]);
          if (diff > 80) motionPixels++;
        }
      }
      const motion = (motionPixels / totalPixels) * 100;
      setMotionLevel(Math.round(motion));
      prevFrameRef.current = currentFrame;

      // Gesture classification based on skin distribution + motion
      const detected = skinPercent > 3; // At least 3% skin pixels = hand detected
      setHandDetected(detected);

      if (detected && !cooldownRef.current) {
        let gesture: string | null = null;
        let confidence = 0;

        const topRatio = topSkin / (skinPixels || 1);
        const bottomRatio = bottomSkin / (skinPixels || 1);
        const leftRatio = leftSkin / (skinPixels || 1);
        const rightRatio = rightSkin / (skinPixels || 1);
        const centerRatio = centerSkin / (skinPixels || 1);
        const spread = skinPercent; // More spread = more fingers

        if (motion > 15) {
          // High motion = wave
          gesture = "wave";
          confidence = Math.min(motion / 25 * 100, 95);
        } else if (spread > 12 && centerRatio > 0.4) {
          // Large spread, centered = open palm
          gesture = "open_palm";
          confidence = Math.min(spread / 18 * 100, 90);
        } else if (spread < 5 && spread > 3) {
          // Small compact area = fist
          gesture = "fist";
          confidence = Math.min((8 - spread) / 5 * 100, 85);
        } else if (topRatio > 0.65 && spread > 4 && spread < 10) {
          // Mostly top = thumbs up
          gesture = "thumbs_up";
          confidence = Math.min(topRatio * 100, 88);
        } else if (bottomRatio > 0.65 && spread > 4 && spread < 10) {
          // Mostly bottom = point down
          gesture = "point_down";
          confidence = Math.min(bottomRatio * 100, 85);
        } else if (spread > 6 && spread < 12 && (leftRatio > 0.6 || rightRatio > 0.6)) {
          // Medium spread, skewed to one side
          if (topRatio > 0.5) {
            gesture = "peace";
            confidence = 75;
          } else {
            gesture = "l_shape";
            confidence = 70;
          }
        }

        if (gesture) {
          setCurrentGesture(gesture);
          setGestureConfidence(Math.round(confidence));

          // Execute gesture after holding for 1.5 seconds
          if (!gestureTimerRef.current) {
            gestureTimerRef.current = setTimeout(() => {
              const action = gestureActions.find(a => a.gesture === gesture);
              if (action) {
                action.action();
                setLastAction(action.description);
                // Cooldown to prevent rapid-fire
                cooldownRef.current = true;
                setTimeout(() => { cooldownRef.current = false; }, 2000);
              }
              gestureTimerRef.current = null;
              setCurrentGesture(null);
              setGestureConfidence(0);
            }, 1500);
          }
        } else {
          if (gestureTimerRef.current) {
            clearTimeout(gestureTimerRef.current);
            gestureTimerRef.current = null;
          }
          setCurrentGesture(null);
          setGestureConfidence(0);
        }
      } else if (!detected) {
        if (gestureTimerRef.current) {
          clearTimeout(gestureTimerRef.current);
          gestureTimerRef.current = null;
        }
        setCurrentGesture(null);
        setGestureConfidence(0);
      }

      // Draw overlay on canvas
      ctx.strokeStyle = detected ? "#02C39A" : "#F87171";
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, 316, 236);

      if (detected && skinPixels > 0) {
        // Draw hand region indicator
        ctx.fillStyle = "rgba(2, 195, 154, 0.2)";
        ctx.beginPath();
        ctx.arc(avgX, avgY, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#02C39A";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Gesture label on canvas
      if (currentGesture) {
        const gAction = gestureActions.find(a => a.gesture === currentGesture);
        if (gAction) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(0, 210, 320, 30);
          ctx.font = "bold 14px Calibri";
          ctx.fillStyle = "#02C39A";
          ctx.textAlign = "center";
          ctx.fillText(`${gAction.name} → ${gAction.description}`, 160, 230);
        }
      }

      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  }, [gestureActions, router, announceToScreenReader]);

  // Start/stop detection when camera is toggled
  useEffect(() => {
    if (showCamera && videoRef.current) {
      const timer = setTimeout(() => detectGestures(), 500);
      return () => clearTimeout(timer);
    }
  }, [showCamera, detectGestures]);

  // Toggle sign navigation
  const toggleSignNav = useCallback(() => {
    if (isEnabled) {
      stopCamera();
      setIsEnabled(false);
      announceToScreenReader("Sign navigation disabled");
    } else {
      setIsEnabled(true);
      startCamera();
      announceToScreenReader("Sign navigation enabled. Show your hand to the camera to navigate.");
    }
  }, [isEnabled, stopCamera, startCamera, announceToScreenReader]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (gestureTimerRef.current) clearTimeout(gestureTimerRef.current);
    };
  }, [stopCamera]);

  return (
    <>
      {/* Toggle Button - positioned above chatbot button */}
      <button
        onClick={toggleSignNav}
        className="fixed bottom-40 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: isEnabled
            ? "linear-gradient(135deg, #02C39A, #028090)"
            : "var(--color-bg-secondary)",
          color: isEnabled ? "#fff" : "var(--color-text-muted)",
          border: isEnabled ? "2px solid #02C39A" : "2px solid var(--color-border)",
        }}
        aria-label={isEnabled ? "Disable sign navigation" : "Enable sign navigation - use hand gestures to navigate"}
        aria-pressed={isEnabled}
        title="Sign Language Navigation"
      >
        <Hand size={22} />
      </button>

      {/* Camera Feed Window */}
      {isEnabled && showCamera && !isMinimized && (
        <div
          className="fixed bottom-56 right-6 z-50 rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            width: "340px",
            backgroundColor: "var(--color-bg)",
            borderColor: isEnabled ? "#02C39A" : "var(--color-border)",
          }}
          role="region"
          aria-label="Sign navigation camera"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2"
            style={{ background: "linear-gradient(135deg, #028090, #02C39A)" }}>
            <div className="flex items-center gap-2 text-white">
              <Navigation size={14} />
              <span className="text-xs font-semibold">Sign Navigation</span>
              <span className={`w-2 h-2 rounded-full ${handDetected ? "bg-green-300 animate-pulse" : "bg-red-300"}`} />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="p-1 rounded hover:bg-white/20 text-white text-xs"
                aria-label="Show gesture guide"
                title="Gesture Guide"
              >
                ?
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded hover:bg-white/20 text-white"
                aria-label="Minimize camera"
                title="Minimize"
              >
                <span className="text-xs">—</span>
              </button>
              <button
                onClick={toggleSignNav}
                className="p-1 rounded hover:bg-white/20 text-white"
                aria-label="Close sign navigation"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Camera */}
          <div className="relative" style={{ width: 340, height: 255, overflow: "hidden" }}>
            <video
              ref={videoRef}
              width={340}
              height={255}
              className="block w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              muted
              playsInline
              autoPlay
              aria-hidden="true"
            />
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: "scaleX(-1)", opacity: 0.6 }}
              aria-hidden="true"
            />

            {/* Status overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${handDetected ? "bg-green-500/90 text-white" : "bg-red-500/80 text-white"}`}>
                {handDetected ? "HAND DETECTED" : "NO HAND"}
              </span>
              {motionLevel > 5 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/80 text-white">
                  MOTION: {motionLevel}%
                </span>
              )}
            </div>

            {/* Gesture indicator */}
            {currentGesture && (
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: "rgba(0,0,0,0.75)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-300 font-semibold">
                    {gestureActions.find(a => a.gesture === currentGesture)?.name}
                  </span>
                  <span className="text-xs text-green-300">
                    {gestureActions.find(a => a.gesture === currentGesture)?.description}
                  </span>
                </div>
                {/* Progress bar — fills up during 1.5s hold */}
                <div className="w-full h-1 mt-1 rounded-full bg-gray-600 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${gestureConfidence}%`,
                      background: "linear-gradient(90deg, #02C39A, #00A896)",
                      animation: "fillBar 1.5s linear forwards",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Last action */}
          {lastAction && (
            <div className="px-3 py-1.5 text-[10px] text-center" style={{ backgroundColor: "var(--color-bg-secondary)", color: "#02C39A" }}>
              Last action: {lastAction}
            </div>
          )}

          {/* Gesture Guide */}
          {showGuide && (
            <div className="px-3 py-2 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}>
              <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
                Gesture Guide (hold 1.5s to activate):
              </p>
              <div className="grid grid-cols-2 gap-1">
                {gestureActions.map(ga => (
                  <div key={ga.gesture} className="flex items-center gap-1.5 text-[9px] py-0.5" style={{ color: "var(--color-text-muted)" }}>
                    <span className="w-4 h-4 flex items-center justify-center rounded" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                      {ga.icon}
                    </span>
                    <span><b>{ga.name}</b> → {ga.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Camera error */}
          {cameraError && (
            <div className="px-3 py-2 text-xs text-center text-red-400" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
              {cameraError}
            </div>
          )}
        </div>
      )}

      {/* Minimized camera indicator */}
      {isEnabled && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-56 right-6 z-50 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #028090, #02C39A)",
            color: "#fff",
          }}
          aria-label="Expand sign navigation camera"
        >
          <Camera size={14} />
          <span className="text-xs font-semibold">Sign Nav</span>
          <span className={`w-2 h-2 rounded-full ${handDetected ? "bg-green-300 animate-pulse" : "bg-red-300"}`} />
        </button>
      )}

      {/* CSS for fill animation */}
      <style jsx>{`
        @keyframes fillBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </>
  );
}
