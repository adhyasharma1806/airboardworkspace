
import { useCallback, useState } from 'react';
import { GestureClassifier, GestureType, HandLandmarks } from '@/lib/gestureClassifier';
import { useBrowserGestureControls, BrowserGestureActions } from './useBrowserGestureControls';

export interface BrowserGestureState {
  currentGesture: GestureType;
  handPosition: { x: number; y: number } | null;
  isHandDetected: boolean;
  gestureConfidence: number;
}

export const useBrowserGestureRecognition = (
  iframeRef: React.RefObject<HTMLIFrameElement>,
  actions?: BrowserGestureActions
) => {
  const [state, setState] = useState<BrowserGestureState>({
    currentGesture: 'none',
    handPosition: null,
    isHandDetected: false,
    gestureConfidence: 0
  });

  const { executeGestureAction } = useBrowserGestureControls(iframeRef, actions);

  const processHandLandmarks = useCallback((
    landmarks: HandLandmarks[],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const gesture = GestureClassifier.classifyGesture(landmarks);
    const handCenter = GestureClassifier.getHandCenter(landmarks);

    if (handCenter) {
      // Normalize hand position (0-1 range)
      const normalizedX = handCenter.x;
      const normalizedY = handCenter.y;

      // Execute gesture action based on hand position
      executeGestureAction(gesture, normalizedY);

      setState({
        currentGesture: gesture,
        handPosition: {
          x: normalizedX * canvasWidth,
          y: normalizedY * canvasHeight
        },
        isHandDetected: true,
        gestureConfidence: gesture !== 'none' ? 0.8 : 0.3
      });
    } else {
      setState(prev => ({
        ...prev,
        isHandDetected: false,
        gestureConfidence: 0
      }));
    }
  }, [executeGestureAction]);

  const resetDetection = useCallback(() => {
    setState({
      currentGesture: 'none',
      handPosition: null,
      isHandDetected: false,
      gestureConfidence: 0
    });
  }, []);

  return {
    state,
    processHandLandmarks,
    resetDetection
  };
};
