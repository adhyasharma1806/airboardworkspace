
import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { HandGesture } from '@/types/handDetection';
import { recognizeGesture } from '@/utils/gestureRecognition';
import { createHandsInstance } from '@/utils/mediaPipeUtils';
import { createCameraInstance, startCamera, stopCamera } from '@/utils/cameraUtils';
import { drawHandLandmarks, clearCanvas } from '@/utils/canvasUtils';

export type { HandGesture };

export const useHandDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<HandGesture | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Handle MediaPipe results
  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const gesture = recognizeGesture(landmarks);
      setCurrentGesture(gesture);

      // Draw hand landmarks
      drawHandLandmarks(canvas, landmarks);
    } else {
      setCurrentGesture(null);
      clearCanvas(canvas);
    }
  }, []);

  // Initialize MediaPipe
  const initializeHands = useCallback(async () => {
    try {
      const hands = createHandsInstance(onResults);
      handsRef.current = hands;
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err);
      setError('Failed to initialize hand detection');
    }
  }, [onResults]);

  // Start camera and tracking
  const startTracking = useCallback(async () => {
    if (!handsRef.current || !videoRef.current) return;

    try {
      await startCamera(videoRef.current);
      
      const camera = createCameraInstance(videoRef.current, handsRef.current);
      cameraRef.current = camera;
      camera.start();
      setIsTracking(true);
      setError(null);
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError('Failed to access camera');
    }
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    
    if (videoRef.current) {
      stopCamera(videoRef.current);
    }
    
    setIsTracking(false);
    setCurrentGesture(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeHands();
  }, [initializeHands]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    videoRef,
    canvasRef,
    isInitialized,
    isTracking,
    currentGesture,
    error,
    startTracking,
    stopTracking
  };
};
