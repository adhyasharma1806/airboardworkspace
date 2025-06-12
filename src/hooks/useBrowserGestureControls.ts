
import { useCallback, useRef } from 'react';
import { GestureType } from '@/lib/gestureClassifier';

export interface BrowserGestureActions {
  onScrollUp: () => void;
  onScrollDown: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGoBack: () => void;
}

export const useBrowserGestureControls = (
  iframeRef: React.RefObject<HTMLIFrameElement>,
  actions?: BrowserGestureActions
) => {
  const lastGestureTime = useRef(0);
  const gestureHoldTime = useRef(0);
  const currentGesture = useRef<GestureType>('none');

  const executeGestureAction = useCallback((gesture: GestureType, handY: number) => {
    const currentTime = Date.now();
    const debounceTime = 300; // Prevent rapid firing

    if (currentTime - lastGestureTime.current < debounceTime) {
      return;
    }

    // Track gesture changes
    if (gesture !== currentGesture.current) {
      currentGesture.current = gesture;
      gestureHoldTime.current = currentTime;
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      switch (gesture) {
        case 'open_hand':
          // Scroll based on hand position (upper half = scroll up, lower half = scroll down)
          if (handY < 0.4) {
            // Upper area - scroll up
            iframeDoc?.body.scrollBy(0, -100);
            actions?.onScrollUp();
          } else if (handY > 0.6) {
            // Lower area - scroll down
            iframeDoc?.body.scrollBy(0, 100);
            actions?.onScrollDown();
          }
          lastGestureTime.current = currentTime;
          break;

        case 'thumbs_up':
          // Zoom in
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'zoom', action: 'in' }, '*');
          }
          actions?.onZoomIn();
          lastGestureTime.current = currentTime;
          break;

        case 'fist':
          // Go back / zoom out (depending on hold time)
          const holdDuration = currentTime - gestureHoldTime.current;
          if (holdDuration > 1000) {
            // Long hold - go back
            actions?.onGoBack();
          } else {
            // Short gesture - zoom out
            if (iframe.contentWindow) {
              iframe.contentWindow.postMessage({ type: 'zoom', action: 'out' }, '*');
            }
            actions?.onZoomOut();
          }
          lastGestureTime.current = currentTime;
          break;

        case 'peace':
          // Reset zoom
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'zoom', action: 'reset' }, '*');
          }
          lastGestureTime.current = currentTime;
          break;
      }
    } catch (error) {
      console.log('Browser gesture control blocked by iframe security:', error);
    }
  }, [iframeRef, actions]);

  return { executeGestureAction };
};
