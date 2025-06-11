
import { Hands, Results } from '@mediapipe/hands';

export const createHandsInstance = (onResults: (results: Results) => void): Hands => {
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
  return hands;
};
