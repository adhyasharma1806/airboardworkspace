// Tailwind class merging utility
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🧠 Gesture classifier for hand landmarks
export function classifyGesture(landmarks: any[]): string {
  if (!landmarks || landmarks.length === 0) return "None";

  const [thumbTip, indexTip, middleTip, ringTip, pinkyTip] = [
    landmarks[4],
    landmarks[8],
    landmarks[12],
    landmarks[16],
    landmarks[20],
  ];

  const y = (point: any) => point.y;

  const isFist =
    y(indexTip) > y(6) &&
    y(middleTip) > y(10) &&
    y(ringTip) > y(14) &&
    y(pinkyTip) > y(18);

  const isPeace =
    y(indexTip) < y(6) &&
    y(middleTip) < y(10) &&
    y(ringTip) > y(14) &&
    y(pinkyTip) > y(18);

  const isPoint =
    y(indexTip) < y(6) &&
    y(middleTip) > y(10) &&
    y(ringTip) > y(14) &&
    y(pinkyTip) > y(18);

  if (isFist) return "Fist";
  if (isPeace) return "Peace";
  if (isPoint) return "Point";

  return "Unknown";
}

