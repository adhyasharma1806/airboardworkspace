
import { useRef, useCallback, useState } from 'react';
import { GestureClassifier, GestureType, HandLandmarks } from '@/lib/gestureClassifier';
import { VirtualKeyboardDetector, KeyboardKey } from '@/lib/virtualKeyboardDetector';

export interface GestureRecognitionState {
  currentGesture: GestureType;
  fingerPosition: { x: number; y: number } | null;
  hoveredKey: string | null;
  hoverProgress: number;
  isHandDetected: boolean;
}

export interface GestureActions {
  onKeyType?: (key: string) => void;
  onGestureChange?: (gesture: GestureType) => void;
  onBackspace?: () => void;
  onSpace?: () => void;
}

export const useGestureRecognition = (actions?: GestureActions) => {
  const [state, setState] = useState<GestureRecognitionState>({
    currentGesture: 'none',
    fingerPosition: null,
    hoveredKey: null,
    hoverProgress: 0,
    isHandDetected: false
  });

  const detectorRef = useRef(new VirtualKeyboardDetector());
  const lastBackspaceTime = useRef(0);
  const lastSpaceTime = useRef(0);
  const gestureHoldTime = useRef(0);
  const lastGesture = useRef<GestureType>('none');

  const processHandLandmarks = useCallback((
    landmarks: HandLandmarks[],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const result = detectorRef.current.detectKeyHover(landmarks, canvasWidth, canvasHeight);
    const currentTime = Date.now();

    // Handle gesture-based actions
    if (result.gesture !== lastGesture.current) {
      lastGesture.current = result.gesture;
      gestureHoldTime.current = currentTime;
      actions?.onGestureChange?.(result.gesture);
    }

    // Handle fist gesture for backspace (with debounce)
    if (result.gesture === 'fist' && currentTime - lastBackspaceTime.current > 500) {
      actions?.onBackspace?.();
      lastBackspaceTime.current = currentTime;
    }

    // Handle peace gesture for space (with debounce)
    if (result.gesture === 'peace' && currentTime - lastSpaceTime.current > 800) {
      actions?.onSpace?.();
      lastSpaceTime.current = currentTime;
    }

    // Handle pointing gesture for typing
    if (result.shouldType && result.hoveredKey) {
      actions?.onKeyType?.(result.hoveredKey);
    }

    setState({
      currentGesture: result.gesture,
      fingerPosition: result.fingerPosition,
      hoveredKey: result.hoveredKey,
      hoverProgress: detectorRef.current.getHoverProgress(),
      isHandDetected: true
    });
  }, [actions]);

  const setKeyboardLayout = useCallback((keys: KeyboardKey[]) => {
    detectorRef.current.setKeyboardLayout(keys);
  }, []);

  const resetDetection = useCallback(() => {
    setState({
      currentGesture: 'none',
      fingerPosition: null,
      hoveredKey: null,
      hoverProgress: 0,
      isHandDetected: false
    });
  }, []);

  return {
    state,
    processHandLandmarks,
    setKeyboardLayout,
    resetDetection
  };
};
