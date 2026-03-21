"use client";

import { useEffect, useRef, useState } from "react";

interface GestureNavigationProps {
  onClose: () => void;
}

export function GestureNavigation({ onClose }: GestureNavigationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const [detectedGesture, setDetectedGesture] = useState<string>("");
  const [fingerCount, setFingerCount] = useState<number>(-1);
  const lastActionTimeRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Gesture mappings for whole website navigation
  const gestureMappings = [
    { gesture: "☝️ 1 Finger (Index)", action: "Go to Home", fingers: 1 },
    { gesture: "✌️ 2 Fingers", action: "Go to Courses", fingers: 2 },
    { gesture: "🤟 3 Fingers", action: "Go to Jobs", fingers: 3 },
    { gesture: "🖖 4 Fingers", action: "Go to Schemes", fingers: 4 },
    { gesture: "✋ 5 Fingers (Open Palm)", action: "Go to AI Chat", fingers: 5 },
    { gesture: "✊ Fist (0 Fingers)", action: "Scroll Down", fingers: 0 },
  ];

  // Perform action based on finger count
  const performAction = (fingers: number) => {
    const now = Date.now();
    // Debounce actions (only perform every 1.5 seconds)
    if (now - lastActionTimeRef.current < 1500) return;
    lastActionTimeRef.current = now;

    switch (fingers) {
      case 1:
        // Index finger = Go to Home
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        setDetectedGesture("Going Home 🏠");
        break;
      case 2:
        // 2 fingers = Go to Courses
        if (!window.location.pathname.includes('/courses')) {
          window.location.href = '/courses';
        }
        setDetectedGesture("Going to Courses 📚");
        break;
      case 3:
        // 3 fingers = Go to Jobs
        if (!window.location.pathname.includes('/jobs')) {
          window.location.href = '/jobs';
        }
        setDetectedGesture("Going to Jobs 💼");
        break;
      case 4:
        // 4 fingers = Go to Schemes
        if (!window.location.pathname.includes('/schemes')) {
          window.location.href = '/schemes';
        }
        setDetectedGesture("Going to Schemes 🏛️");
        break;
      case 5:
        // Open palm = Go to AI Chat
        if (!window.location.pathname.includes('/chat')) {
          window.location.href = '/chat';
        }
        setDetectedGesture("Going to AI Chat 💬");
        break;
      case 0:
        // Fist = Scroll down
        window.scrollBy({ top: 400, behavior: 'smooth' });
        setDetectedGesture("Scrolling Down ⬇️");
        break;
    }

    setTimeout(() => setDetectedGesture(""), 2000);
  };

  // Count extended fingers using MediaPipe landmarks
  const countExtendedFingers = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return -1;

    let count = 0;

    // Thumb: Check if tip is to the right/left of IP joint (depending on hand orientation)
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];
    
    // Check thumb extension based on x-coordinate difference
    if (Math.abs(thumbTip.x - thumbMCP.x) > Math.abs(thumbIP.x - thumbMCP.x)) {
      count++;
    }

    // Other fingers: Check if tip is above PIP joint (lower y value = higher on screen)
    const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
    const fingerPIPs = [6, 10, 14, 18];

    for (let i = 0; i < fingerTips.length; i++) {
      if (landmarks[fingerTips[i]].y < landmarks[fingerPIPs[i]].y) {
        count++;
      }
    }

    return count;
  };

  useEffect(() => {
    let camera: any;

    const initializeMediaPipe = async () => {
      try {
        // Dynamically import MediaPipe
        const { Hands } = await import('@mediapipe/hands');
        const { Camera } = await import('@mediapipe/camera_utils');

        // Initialize Hands
        const hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        });

        hands.onResults((results: any) => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw video frame
          if (videoRef.current) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
          }

          // Process hand landmarks
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Draw hand landmarks
            ctx.fillStyle = '#00ff00';
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;

            // Draw connections
            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
              [0, 5], [5, 6], [6, 7], [7, 8], // Index
              [0, 9], [9, 10], [10, 11], [11, 12], // Middle
              [0, 13], [13, 14], [14, 15], [15, 16], // Ring
              [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
              [5, 9], [9, 13], [13, 17] // Palm
            ];

            connections.forEach(([start, end]) => {
              const startPoint = landmarks[start];
              const endPoint = landmarks[end];
              ctx.beginPath();
              ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
              ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
              ctx.stroke();
            });

            // Draw landmarks
            landmarks.forEach((landmark: any) => {
              ctx.beginPath();
              ctx.arc(
                landmark.x * canvas.width,
                landmark.y * canvas.height,
                5,
                0,
                2 * Math.PI
              );
              ctx.fill();
            });

            // Count fingers
            const fingers = countExtendedFingers(landmarks);
            setFingerCount(fingers);
            performAction(fingers);
          } else {
            setFingerCount(-1);
          }
        });

        handsRef.current = hands;

        // Start camera
        if (videoRef.current) {
          camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && handsRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          await camera.start();
          setIsLoading(false);
        }

      } catch (err) {
        console.error("MediaPipe initialization error:", err);
        alert("Unable to initialize hand tracking. Please check your camera permissions.");
        setIsLoading(false);
      }
    };

    initializeMediaPipe();

    return () => {
      if (camera) camera.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      style={{ 
        position: "fixed",
        bottom: "10px",
        right: "10px",
        width: "min(360px, calc(100vw - 20px))",
        backgroundColor: "#1e1b4b",
        border: "4px solid #818cf8",
        borderRadius: "16px",
        zIndex: 999999,
        padding: "12px",
        boxShadow: "0 0 40px rgba(129, 140, 248, 0.8)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh"
      }}
    >
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "10px",
        backgroundColor: "#312e81",
        padding: "10px",
        borderRadius: "10px"
      }}>
        <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "700" }}>
          🖐️ Hand Gesture Navigation
        </span>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#ef4444",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          ✕
        </button>
      </div>
      
      {/* Camera Box - Square Shape */}
      <div style={{ 
        width: "100%",
        aspectRatio: "1",
        backgroundColor: "#000000",
        borderRadius: "12px",
        overflow: "hidden",
        border: "3px solid #818cf8",
        marginBottom: "12px",
        position: "relative"
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            display: "none"
          }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "14px"
          }}>
            Loading hand tracking...
          </div>
        )}
        
        {/* Finger count overlay */}
        {!isLoading && (
          <div style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "28px",
            fontWeight: "bold",
            border: "2px solid #818cf8"
          }}>
            {fingerCount >= 0 ? `${fingerCount} 🖐️` : "No hand"}
          </div>
        )}
      </div>

      {/* Detected Gesture Display */}
      {detectedGesture && (
        <div style={{
          backgroundColor: "#10b981",
          color: "#ffffff",
          padding: "10px",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "13px",
          fontWeight: "700",
          marginBottom: "12px",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)"
        }}>
          ✓ {detectedGesture}
        </div>
      )}

      {/* Gesture Mappings Guide */}
      <div style={{
        backgroundColor: "#312e81",
        borderRadius: "10px",
        padding: "12px",
        maxHeight: "220px",
        overflowY: "auto"
      }}>
        <div style={{ 
          color: "#818cf8", 
          fontSize: "12px", 
          fontWeight: "700", 
          marginBottom: "10px",
          textAlign: "center"
        }}>
          📋 GESTURE CONTROLS
        </div>
        {gestureMappings.map((mapping, index) => {
          const isActive = fingerCount === mapping.fingers;
          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                marginBottom: "6px",
                backgroundColor: isActive ? "#10b981" : "#1e1b4b",
                borderRadius: "8px",
                fontSize: "11px",
                transition: "all 0.3s",
                border: isActive ? "2px solid #10b981" : "2px solid transparent"
              }}
            >
              <span style={{ color: "#ffffff", fontWeight: "600" }}>
                {mapping.gesture}
              </span>
              <span style={{
                color: isActive ? "#ffffff" : "#818cf8",
                fontSize: "10px",
                fontWeight: "600"
              }}>
                → {mapping.action}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div style={{
        marginTop: "10px",
        textAlign: "center",
        fontSize: "10px",
        color: "#9ca3af",
        fontWeight: "500"
      }}>
        🌐 Show fingers to navigate • Works on all pages
      </div>
    </div>
  );
}
