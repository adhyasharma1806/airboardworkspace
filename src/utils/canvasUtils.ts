
import { HandLandmark } from '@/types/handDetection';

export const drawHandLandmarks = (
  canvas: HTMLCanvasElement,
  landmarks: HandLandmark[]
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set drawing styles
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
  landmarks.forEach((landmark: HandLandmark) => {
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
};

export const clearCanvas = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};
