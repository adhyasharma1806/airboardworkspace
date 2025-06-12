
import { useRef, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
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
  const initializationAttempts = useRef(0);

  const initializeMediaPipe = useCallback(async () => {
    if (!isActive || !videoRef.current || !canvasRef.current) {
      console.log('⚠️ MediaPipe init skipped - requirements not met');
      return;
    }
    
    // Check if MediaPipe scripts are loaded
    if (typeof window.Hands === 'undefined') {
      initializationAttempts.current++;
      if (initializationAttempts.current < 10) {
        console.log(`⏳ MediaPipe not ready, retrying... (attempt ${initializationAttempts.current})`);
        setTimeout(initializeMediaPipe, 500);
        return;
      } else {
        console.error('❌ MediaPipe Hands not loaded after multiple attempts');
        return;
      }
    }

    // Reset attempts counter on successful load
    initializationAttempts.current = 0;

    try {
      console.log('🤖 Initializing MediaPipe...');

      // Clean up existing instances
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (e) {
          console.log('Previous hands instance cleanup failed');
        }
      }
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.log('Previous camera instance cleanup failed');
        }
      }

      // Wait for video to be ready
      const video = videoRef.current;
      if (!video.videoWidth || !video.videoHeight) {
        console.log('⏳ Waiting for video dimensions...');
        video.addEventListener('loadedmetadata', initializeMediaPipe, { once: true });
        return;
      }

      console.log('📹 Video ready:', {
        width: video.videoWidth,
        height: video.videoHeight,
        readyState: video.readyState
      });

      // Initialize Hands
      const hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.7,
      });

      hands.onResults((results: any) => {
        console.log('📊 MediaPipe results:', {
          detected: !!(results.multiHandLandmarks && results.multiHandLandmarks.length > 0),
          landmarksCount: results.multiHandLandmarks?.[0]?.length || 0,
          timestamp: Date.now()
        });
        onResults(results);
      });

      // Initialize Camera with the video element
      const camera = new window.Camera(video, {
        onFrame: async () => {
          if (video && hands && video.readyState >= 2) {
            try {
              await hands.send({ image: video });
            } catch (error) {
              console.error('❌ Error sending frame to MediaPipe:', error);
            }
          }
        },
        width: 640,
        height: 480,
      });

      handsRef.current = hands;
      cameraRef.current = camera;

      // Start the camera
      await camera.start();
      console.log('✅ MediaPipe initialized successfully');

    } catch (error) {
      console.error('❌ MediaPipe initialization failed:', error);
      // Retry after a delay
      setTimeout(() => {
        if (isActive) {
          initializeMediaPipe();
        }
      }, 2000);
    }
  }, [isActive, videoRef, canvasRef, onResults]);

  useEffect(() => {
    if (isActive) {
      // Add a delay to ensure video stream is established
      const timer = setTimeout(initializeMediaPipe, 1500);
      return () => clearTimeout(timer);
    } else {
      // Cleanup
      console.log('🧹 Cleaning up MediaPipe...');
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.log('Camera cleanup failed');
        }
      }
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (e) {
          console.log('Hands cleanup failed');
        }
      }
      handsRef.current = null;
      cameraRef.current = null;
      initializationAttempts.current = 0;
    }
  }, [isActive, initializeMediaPipe]);

  return { handsRef, cameraRef };
};
