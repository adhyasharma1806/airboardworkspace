
import { GestureClassifier, HandLandmarks, GestureType } from './gestureClassifier';

export interface KeyboardKey {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HoverState {
  key: string | null;
  confidence: number;
  duration: number;
}

export class VirtualKeyboardDetector {
  private hoverState: HoverState = { key: null, confidence: 0, duration: 0 };
  private hoverThreshold = 30; // frames to confirm hover
  private lastGesture: GestureType = 'none';
  private gestureChangeTime = 0;

  setKeyboardLayout(keys: KeyboardKey[]) {
    this.keyboardKeys = keys;
  }

  private keyboardKeys: KeyboardKey[] = [];

  detectKeyHover(landmarks: HandLandmarks[], canvasWidth: number, canvasHeight: number): {
    hoveredKey: string | null;
    gesture: GestureType;
    shouldType: boolean;
    fingerPosition: { x: number; y: number } | null;
  } {
    const gesture = GestureClassifier.classifyGesture(landmarks);
    const currentTime = Date.now();

    // Track gesture changes
    if (gesture !== this.lastGesture) {
      this.lastGesture = gesture;
      this.gestureChangeTime = currentTime;
    }

    // Get index finger tip position for pointing gesture
    const fingerPos = GestureClassifier.getFingerTipPosition(landmarks, 1); // Index finger
    
    if (!fingerPos || gesture !== 'point') {
      this.resetHover();
      return {
        hoveredKey: null,
        gesture,
        shouldType: false,
        fingerPosition: fingerPos
      };
    }

    // Convert normalized coordinates to canvas coordinates
    const canvasX = fingerPos.x * canvasWidth;
    const canvasY = fingerPos.y * canvasHeight;

    // Find which key is being hovered
    const hoveredKey = this.findHoveredKey(canvasX, canvasY);

    if (hoveredKey) {
      if (this.hoverState.key === hoveredKey) {
        this.hoverState.duration++;
        this.hoverState.confidence = Math.min(100, (this.hoverState.duration / this.hoverThreshold) * 100);
      } else {
        this.hoverState = { key: hoveredKey, confidence: 0, duration: 1 };
      }
    } else {
      this.resetHover();
    }

    const shouldType = this.hoverState.duration >= this.hoverThreshold;

    if (shouldType) {
      this.resetHover(); // Reset after typing
    }

    return {
      hoveredKey: this.hoverState.key,
      gesture,
      shouldType,
      fingerPosition: { x: canvasX, y: canvasY }
    };
  }

  private findHoveredKey(x: number, y: number): string | null {
    for (const key of this.keyboardKeys) {
      if (x >= key.x && x <= key.x + key.width &&
          y >= key.y && y <= key.y + key.height) {
        return key.key;
      }
    }
    return null;
  }

  private resetHover() {
    this.hoverState = { key: null, confidence: 0, duration: 0 };
  }

  getHoverProgress(): number {
    return this.hoverState.confidence;
  }
}
