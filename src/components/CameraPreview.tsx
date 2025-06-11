
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Camera, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraPreviewProps {
  isTracking: boolean;
  onTrackingChange: (tracking: boolean) => void;
}

const CameraPreview = ({ isTracking, onTrackingChange }: CameraPreviewProps) => {
  const [handDetected, setHandDetected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      toast({
        title: "Camera connected",
        description: "Camera is now active for hand tracking."
      });
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Camera access denied or not available');
      onTrackingChange(false);
      
      toast({
        title: "Camera access failed",
        description: "Please allow camera access for hand tracking.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHandDetected(false);
  };

  useEffect(() => {
    if (isTracking) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isTracking]);

  // Simulate hand detection for demo purposes
  useEffect(() => {
    if (isTracking && !cameraError) {
      const interval = setInterval(() => {
        setHandDetected(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setHandDetected(false);
    }
  }, [isTracking, cameraError]);

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
          <div className={`w-2 h-2 rounded-full ${isTracking && !cameraError ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-400">
            {isTracking && !cameraError ? 'Live' : 'Off'}
          </span>
        </div>
      </div>

      <div className="aspect-video bg-cyber-dark/50 rounded-lg border border-cyber-primary/30 relative overflow-hidden">
        {isTracking && !cameraError ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Hand tracking overlay */}
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

            {/* Status indicators */}
            <div className="absolute top-2 left-2 space-y-1">
              <div className="flex items-center space-x-1 bg-cyber-dark/80 px-2 py-1 rounded">
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Connected</span>
              </div>
              {handDetected && (
                <div className="flex items-center space-x-1 bg-cyber-primary/20 px-2 py-1 rounded">
                  <Eye className="w-3 h-3 text-cyber-primary" />
                  <span className="text-xs text-cyber-primary">Tracking</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">
                {cameraError ? 'Camera Error' : 'Camera Off'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {cameraError || 'Enable tracking to start'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">FPS</div>
          <div className="text-cyber-primary font-mono">
            {isTracking && !cameraError ? '30' : '0'}
          </div>
        </div>
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">Latency</div>
          <div className="text-cyber-primary font-mono">
            {isTracking && !cameraError ? '12ms' : '---'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CameraPreview;
