
import { HandGesture, HandLandmark } from '@/types/handDetection';

export const recognizeGesture = (landmarks: HandLandmark[]): HandGesture => {
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
};
