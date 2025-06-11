import { classifyGesture } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Camera, Wifi } from "lucide-react";

interface CameraPreviewProps {
  isTracking: boolean;
}

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const CameraPreview = ({ isTracking }: CameraPreviewProps) => {
  const [handDetected, setHandDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!isTracking) {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      setHandDetected(false);
      return;
    }

    if (!window.Hands || !window.Camera) {
      console.error("MediaPipe scripts not loaded.");
      return;
    }

    const hands = new window.Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: any) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setHandDetected(true);
        for (const landmarks of results.multiHandLandmarks) {
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2,
          });
          const gesture = classifyGesture(landmarks);
console.log("Gesture Detected:", gesture);

          window.drawLandmarks(ctx, landmarks, {
            color: "#FF0000",
            lineWidth: 1,
          });
        }
      } else {
        setHandDetected(false);
      }

      ctx.restore();
    });

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    handsRef.current = hands;
    cameraRef.current = camera;
    camera.start();

    return () => {
      camera.stop();
    };
  }, [isTracking]);

  return (
    <Card className="glass-morphism border-cyber-primary/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Camera className="w-5 h-5 text-cyber-primary mr-2" />
          <h3 className="text-sm font-semibold cyber-font text-cyber-primary">
            Camera Feed
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isTracking ? "bg-green-400" : "bg-gray-400"
            }`}
          ></div>
          <span className="text-xs text-gray-400">
            {isTracking ? "Live" : "Off"}
          </span>
        </div>
      </div>

      <div className="aspect-video bg-black relative rounded-lg overflow-hidden border border-cyber-primary/30">
        {isTracking ? (
          <>
            <video
              ref={videoRef}
              className="absolute top-0 left-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute top-0 left-0 w-full h-full"
            />
            {handDetected && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 border-2 border-cyber-primary rounded-full cyber-glow animate-pulse">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyber-primary rounded-full"></div>
                  </div>
                </div>
                <div className="text-xs text-cyber-primary text-center mt-2 cyber-font">
                  HAND DETECTED
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">Camera Off</div>
              <div className="text-xs text-gray-500 mt-1">
                Enable tracking to start
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">FPS</div>
          <div className="text-cyber-primary font-mono">
            {isTracking ? "30" : "0"}
          </div>
        </div>
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">Latency</div>
          <div className="text-cyber-primary font-mono">
            {isTracking ? "12ms" : "---"}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CameraPreview;
