
import { useRef, useEffect, useCallback } from 'react';
import { KeyboardKey } from '@/lib/virtualKeyboardDetector';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
    updateKeyboardLayout?: (keys: KeyboardKey[]) => void;
  }
}

interface UseMediaPipeProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onResults: (results: any) => void;
  isActive: boolean;
}

export const useMediaPipe = ({ videoRef, canvasRef, onResults, isActive }: UseMediaPipeProps) => {
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const initializeMediaPipe = useCallback(async () => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;
    
    // Check if MediaPipe scripts are loaded
    if (typeof window.Hands === 'undefined') {
      console.error('❌ MediaPipe Hands not loaded');
      return;
    }

    try {
      console.log('🤖 Initializing MediaPipe...');

      // Initialize Hands
      const hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        console.log('📊 MediaPipe results:', {
          detected: results.multiHandLandmarks?.length > 0,
          landmarksCount: results.multiHandLandmarks?.[0]?.length
        });
        onResults(results);
      });

      // Initialize Camera
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && hands) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      handsRef.current = hands;
      cameraRef.current = camera;

      await camera.start();
      console.log('✅ MediaPipe initialized successfully');

    } catch (error) {
      console.error('❌ MediaPipe initialization failed:', error);
    }
  }, [isActive, videoRef, canvasRef, onResults]);

  useEffect(() => {
    if (isActive) {
      // Add a small delay to ensure video is ready
      const timer = setTimeout(initializeMediaPipe, 1000);
      return () => clearTimeout(timer);
    } else {
      // Cleanup
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      handsRef.current = null;
      cameraRef.current = null;
    }
  }, [isActive, initializeMediaPipe]);

  return { handsRef, cameraRef };
};
