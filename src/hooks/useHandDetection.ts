import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface HandGesture {
  type: 'point' | 'fist' | 'peace' | 'palm' | 'unknown';
  confidence: number;
  landmarks?: any[];
}

export const useHandDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<HandGesture | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Gesture recognition logic
  const recognizeGesture = useCallback((landmarks: any[]): HandGesture => {
    if (!landmarks || landmarks.length < 21) {
      return { type: 'unknown', confidence: 0 };
    }

    try {
      // Get key finger tip and joint positions
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const indexMcp = landmarks[5];
      const middleTip = landmarks[12];
      const middleMcp = landmarks[9];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];
      const wrist = landmarks[0];

      // Calculate if fingers are extended
      const isThumbUp = thumbTip.y < landmarks[3].y;
      const isIndexUp = indexTip.y < indexMcp.y;
      const isMiddleUp = middleTip.y < middleMcp.y;
      const isRingUp = ringTip.y < landmarks[13].y;
      const isPinkyUp = pinkyTip.y < landmarks[17].y;

      const extendedFingers = [isThumbUp, isIndexUp, isMiddleUp, isRingUp, isPinkyUp].filter(Boolean).length;

      // Gesture recognition
      if (isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
        return { type: 'point', confidence: 0.9, landmarks };
      } else if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
        return { type: 'peace', confidence: 0.85, landmarks };
      } else if (extendedFingers <= 1) {
        return { type: 'fist', confidence: 0.8, landmarks };
      } else if (extendedFingers >= 4) {
        return { type: 'palm', confidence: 0.75, landmarks };
      }

      return { type: 'unknown', confidence: 0.5, landmarks };
    } catch (err) {
      console.error('Error recognizing gesture:', err);
      return { type: 'unknown', confidence: 0 };
    }
  }, []);

  // Handle MediaPipe results
  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const gesture = recognizeGesture(landmarks);
      setCurrentGesture(gesture);

      // Draw hand landmarks
      ctx.fillStyle = '#00d9ff';
      ctx.strokeStyle = '#00d9ff';
      ctx.lineWidth = 2;

      // Draw connections between landmarks
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // index
        [0, 9], [9, 10], [10, 11], [11, 12], // middle
        [0, 13], [13, 14], [14, 15], [15, 16], // ring
        [0, 17], [17, 18], [18, 19], [19, 20], // pinky
        [5, 9], [9, 13], [13, 17] // palm
      ];

      connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      });

      // Draw landmark points
      landmarks.forEach((landmark: any) => {
        ctx.beginPath();
        ctx.arc(
          landmark.x * canvas.width,
          landmark.y * canvas.height,
          3,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    } else {
      setCurrentGesture(null);
    }
  }, [recognizeGesture]);

  // Initialize MediaPipe
  const initializeHands = useCallback(async () => {
    try {
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      videoRef.current.srcObject = stream;
      
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

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
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
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
