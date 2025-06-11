
import { useRef, useEffect, useState } from 'react';

export interface CameraState {
  isInitialized: boolean;
  hasPermission: boolean;
  error: string | null;
}

export const useCamera = (isActive: boolean) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    isInitialized: false,
    hasPermission: false,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (!isActive || !videoRef.current) return;

      try {
        console.log('🎥 Initializing camera...');
        
        // Stop existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        setState({
          isInitialized: true,
          hasPermission: true,
          error: null
        });

        console.log('✅ Camera initialized successfully');
      } catch (error) {
        console.error('❌ Camera initialization failed:', error);
        setState({
          isInitialized: false,
          hasPermission: false,
          error: error instanceof Error ? error.message : 'Camera access denied'
        });
      }
    };

    const cleanupCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setState({
        isInitialized: false,
        hasPermission: false,
        error: null
      });
    };

    if (isActive) {
      initCamera();
    } else {
      cleanupCamera();
    }

    return () => {
      mounted = false;
      cleanupCamera();
    };
  }, [isActive]);

  return { videoRef, state };
};
