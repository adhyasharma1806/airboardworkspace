
import { useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Camera, EyeOff } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useGestureRecognition } from "@/hooks/useGestureRecognition";
import GestureOverlay from "./GestureOverlay";

interface CameraPreviewSimpleProps {
  isTracking: boolean;
  onGestureDetected?: (gesture: string) => void;
  onKeyType?: (key: string) => void;
  onBackspace?: () => void;
  onSpace?: () => void;
}

const CameraPreviewSimple = ({ 
  isTracking, 
  onGestureDetected, 
  onKeyType, 
  onBackspace, 
  onSpace 
}: CameraPreviewSimpleProps) => {
  const [fps, setFps] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  const { videoRef, state: cameraState } = useCamera(isTracking);
  
  const { state, processHandLandmarks, resetDetection } = useGestureRecognition({
    onKeyType,
    onBackspace,
    onSpace,
    onGestureChange: onGestureDetected
  });

  const handleMediaPipeResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // Clear and draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      console.log('✋ Processing landmarks:', landmarks.length);
      processHandLandmarks(landmarks, canvas.width, canvas.height);

      // Draw hand connections and landmarks
      if (window.drawConnectors && window.HAND_CONNECTIONS) {
        window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
          color: state.currentGesture === 'point' ? "#00FF00" : "#00FFFF",
          lineWidth: 2,
        });
      }
      
      if (window.drawLandmarks) {
        window.drawLandmarks(ctx, landmarks, {
          color: state.currentGesture === 'fist' ? "#FF0000" : "#FF00FF",
          lineWidth: 2,
          radius: 3
        });
      }

      // Draw finger position and progress indicators
      if (state.fingerPosition && state.currentGesture === 'point') {
        ctx.beginPath();
        ctx.arc(state.fingerPosition.x, state.fingerPosition.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = state.hoveredKey ? "#00FF00" : "#FFFF00";
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Progress indicator
        if (state.hoveredKey && state.hoverProgress > 0) {
          const progressRadius = 15;
          const progressAngle = (state.hoverProgress / 100) * 2 * Math.PI;
          
          ctx.beginPath();
          ctx.arc(state.fingerPosition.x, state.fingerPosition.y, progressRadius, -Math.PI/2, -Math.PI/2 + progressAngle);
          ctx.strokeStyle = "#00FF00";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    } else {
      resetDetection();
    }

    ctx.restore();

    // Calculate FPS
    frameCountRef.current++;
    if (frameCountRef.current % 30 === 0) {
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      setFps(Math.round((30 * 1000) / elapsed));
      lastTimeRef.current = now;
    }
  }, [processHandLandmarks, resetDetection, state]);

  useMediaPipe({
    videoRef,
    canvasRef,
    onResults: handleMediaPipeResults,
    isActive: isTracking && cameraState.isInitialized
  });

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
          <div className={`w-2 h-2 rounded-full ${
            isTracking && cameraState.isInitialized ? "bg-green-400" : "bg-gray-400"
          }`}></div>
          <span className="text-xs text-gray-400">
            {isTracking && cameraState.isInitialized ? "Live" : "Off"}
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
            
            <GestureOverlay state={state} canvasRef={canvasRef} />

            {cameraState.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
                <div className="text-center text-white">
                  <div className="text-sm">Camera Error</div>
                  <div className="text-xs mt-1">{cameraState.error}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">Camera Off</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">FPS</div>
          <div className="text-cyber-primary font-mono">
            {isTracking && cameraState.isInitialized ? fps : "0"}
          </div>
        </div>
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">Status</div>
          <div className="text-cyber-primary font-mono text-xs">
            {cameraState.isInitialized ? "Ready" : "Loading"}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CameraPreviewSimple;
