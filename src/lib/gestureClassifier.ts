// Enhanced gesture classification using MediaPipe landmarks
export interface HandLandmarks {
  x: number;
  y: number;
  z: number;
}

export type GestureType = 'point' | 'fist' | 'peace' | 'open_hand' | 'thumbs_up' | 'none';

export class GestureClassifier {
  private static readonly FINGER_TIP_IDS = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
  private static readonly FINGER_PIP_IDS = [3, 6, 10, 14, 18]; // Finger joints
  private static readonly FINGER_MCP_IDS = [2, 5, 9, 13, 17]; // Finger base joints

  static classifyGesture(landmarks: HandLandmarks[]): GestureType {
    if (!landmarks || landmarks.length !== 21) {
      return 'none';
    }

    const fingersUp = this.getFingersUp(landmarks);
    const fingerCount = fingersUp.reduce((sum, finger) => sum + finger, 0);

    // Classify based on finger positions
    if (fingerCount === 0) {
      return 'fist';
    } else if (fingerCount === 1 && fingersUp[1] === 1) {
      return 'point'; // Only index finger up
    } else if (fingerCount === 2 && fingersUp[1] === 1 && fingersUp[2] === 1) {
      return 'peace'; // Index and middle finger up
    } else if (fingerCount === 1 && fingersUp[0] === 1) {
      return 'thumbs_up'; // Only thumb up
    } else if (fingerCount >= 4) {
      return 'open_hand'; // Most fingers up
    }

    return 'none';
  }

  private static getFingersUp(landmarks: HandLandmarks[]): number[] {
    const fingers = [0, 0, 0, 0, 0]; // [thumb, index, middle, ring, pinky]

    // Thumb (special case - check x coordinate)
    if (landmarks[this.FINGER_TIP_IDS[0]].x > landmarks[this.FINGER_TIP_IDS[0] - 1].x) {
      fingers[0] = 1;
    }

    // Other fingers (check y coordinate)
    for (let i = 1; i < 5; i++) {
      if (landmarks[this.FINGER_TIP_IDS[i]].y < landmarks[this.FINGER_PIP_IDS[i]].y) {
        fingers[i] = 1;
      }
    }

    return fingers;
  }

  static getFingerTipPosition(landmarks: HandLandmarks[], fingerIndex: number): { x: number; y: number } | null {
    if (!landmarks || landmarks.length !== 21 || fingerIndex < 0 || fingerIndex > 4) {
      return null;
    }

    const tipLandmark = landmarks[this.FINGER_TIP_IDS[fingerIndex]];
    return {
      x: tipLandmark.x,
      y: tipLandmark.y
    };
  }

  static getHandCenter(landmarks: HandLandmarks[]): { x: number; y: number } | null {
    if (!landmarks || landmarks.length !== 21) {
      return null;
    }

    // Use wrist (landmark 0) as hand center
    return {
      x: landmarks[0].x,
      y: landmarks[0].y
    };
  }

  static calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }
}
