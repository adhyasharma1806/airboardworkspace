
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Camera, Wifi } from "lucide-react";

interface CameraPreviewProps {
  isTracking: boolean;
}

const CameraPreview = ({ isTracking }: CameraPreviewProps) => {
  const [handDetected, setHandDetected] = useState(false);

  // Simulate hand detection for demo purposes
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setHandDetected(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setHandDetected(false);
    }
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
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-400">
            {isTracking ? 'Live' : 'Off'}
          </span>
        </div>
      </div>

      <div className="aspect-video bg-cyber-dark/50 rounded-lg border border-cyber-primary/30 relative overflow-hidden">
        {isTracking ? (
          <>
            {/* Simulated camera feed */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-dark/80 to-cyber-light/60">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    radial-gradient(circle at 30% 40%, rgba(0, 217, 255, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)
                  `
                }}></div>
              </div>
              
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
            </div>

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
            {isTracking ? '30' : '0'}
          </div>
        </div>
        <div className="bg-cyber-dark/50 p-2 rounded border border-cyber-primary/20">
          <div className="text-gray-400">Latency</div>
          <div className="text-cyber-primary font-mono">
            {isTracking ? '12ms' : '---'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CameraPreview;
