
// Tailwind class merging utility
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GestureClassifier, HandLandmarks } from './gestureClassifier';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function classifyGesture(landmarks: any[]): string {
  console.log("classifyGesture() called with landmarks:", landmarks.length);
  
  // Convert MediaPipe landmarks to our format
  const handLandmarks: HandLandmarks[] = landmarks.map(landmark => ({
    x: landmark.x,
    y: landmark.y,
    z: landmark.z || 0
  }));

  const gesture = GestureClassifier.classifyGesture(handLandmarks);
  console.log("✋ Gesture Detected:", gesture);
  
  return gesture;
}
