"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Hand } from "lucide-react";

interface SignLanguageCameraProps {
  onClose: () => void;
}

export function SignLanguageCamera({ onClose }: SignLanguageCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [detectedSign, setDetectedSign] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        setIsLoading(true);
        setError("");

        // Request camera permission
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false
        });

        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Camera error:", err);
        if (mounted) {
          setError("Unable to access camera. Please grant camera permission.");
          setIsLoading(false);
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <div 
      className="fixed rounded-2xl"
      style={{ 
        bottom: "100px",
        right: "100px",
        border: "5px solid #ff0000",
        backgroundColor: "#ff00ff",
        width: "320px",
        height: "280px",
        boxShadow: "0 0 50px rgba(255, 0, 0, 1)",
        zIndex: 999999,
        position: "fixed"
      }}
    >
      <div className="flex flex-col h-full p-3" style={{ backgroundColor: "#1e1b4b" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2" style={{ backgroundColor: "#ff0000", padding: "8px", borderRadius: "8px" }}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#ffffff" }}>
            <Hand size={16} />
            CAMERA BOX HERE
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:opacity-80"
            style={{ backgroundColor: "#000000", color: "#ffffff", fontSize: "20px" }}
            aria-label="Close camera"
          >
            ✕
          </button>
        </div>

        {/* Camera View */}
        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: "#000000", border: "2px solid #00ff00" }}>
          {isLoading && (
            <div className="text-center p-4">
              <Camera size={32} style={{ color: "#00ff00", margin: "0 auto 8px" }} />
              <p className="text-xs" style={{ color: "#00ff00" }}>
                LOADING CAMERA...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center p-4">
              <CameraOff size={32} style={{ color: "#ff0000", margin: "0 auto 8px" }} />
              <p className="text-xs" style={{ color: "#ff0000" }}>
                {error}
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl"
              style={{ transform: "scaleX(-1)" }}
            />
          )}
        </div>

        {/* Status */}
        <div className="text-xs text-center pt-2 mt-2" style={{ backgroundColor: "#00ff00", padding: "8px", borderRadius: "8px", color: "#000000", fontWeight: "bold" }}>
          {detectedSign ? `Detected: ${detectedSign}` : "CAMERA ACTIVE - Show hand signs"}
        </div>
      </div>
    </div>
  );
}
