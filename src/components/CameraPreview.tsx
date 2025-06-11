
import { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Camera, Wifi, Hand } from "lucide-react";
import { useHandDetection } from '@/hooks/useHandDetection';

interface CameraPreviewProps {
  isTracking: boolean;
  onTrackingChange: (isTracking: boolean) => void;
  onGestureDetected?: (gesture: string) => void;
}

const CameraPreview = ({ isTracking, onTrackingChange, onGestureDetected }: CameraPreviewProps) => {
  const {
    videoRef,
    canvasRef,
    isInitialized,
    isTracking: actuallyTracking,
    currentGesture,
    error,
    startTracking,
    stopTracking
  } = useHandDetection();

  // Handle tracking state changes
  useEffect(() => {
    if (isTracking && isInitialized && !actuallyTracking) {
      startTracking();
    } else if (!isTracking && actuallyTracking) {
      stopTracking();
    }
  }, [isTracking, isInitialized, actuallyTracking, startTracking, stopTracking]);

  // Handle gesture detection
  useEffect(() => {
    if (currentGesture && onGestureDetected) {
      onGestureDetected(currentGesture.type);
    }
  }, [currentGesture, onGestureDetected]);

  // Update parent tracking state
  useEffect(() => {
    onTrackingChange(actuallyTracking);
  }, [actuallyTracking, onTrackingChange]);

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
          <div className={`w-2 h-2 rounded-full ${actuallyTracking ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-400">
            {actuallyTracking ? 'Live' : 'Off'}
          </span>
        </div>
      </div>

      <div className="aspect-video bg-cyber-dark/50 rounded-lg border border-cyber-primary/30 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <EyeOff className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-sm text-red-400">Error</div>
              <div className="text-xs text-gray-500 mt-1">
                {error}
              </div>
            </div>
          </div>
        ) : actuallyTracking ? (
          <>
            {/* Video element for camera feed */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
              autoPlay
              playsInline
              muted
            />
            
            {/* Canvas overlay for hand landmarks */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full transform scale-x-[-1]"
            />

            {/* Status indicators */}
            <div className="absolute top-2 left-2 space-y-1">
              <div className="flex items-center space-x-1 bg-cyber-dark/80 px-2 py-1 rounded">
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Connected</span>
              </div>
              {currentGesture && (
                <div className="flex items-center space-x-1 bg-cyber-primary/20 px-2 py-1 rounded">
                  <Hand className="w-3 h-3 text-cyber-primary" />
                  <span className="text-xs text-cyber-primary">
                    {currentGesture.type.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Gesture confidence indicator */}
            {currentGesture && (
              <div className="absolute bottom-2 left-2">
                <div className="bg-cyber-dark/80 px-2 py-1 rounded">
                  <div className="text-xs text-gray-400">Confidence</div>
                  <div className="text-xs text-cyber-primary font-mono">
                    {Math.round(currentGesture.confidence * 100)}%
                  </div>
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
                {isInitialized ? 'Enable tracking to start' : 'Initializing...'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">Status</div>
          <div className="text-cyber-primary font-mono">
            {actuallyTracking ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">Gesture</div>
          <div className="text-cyber-primary font-mono">
            {currentGesture ? currentGesture.type : '---'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CameraPreview;
