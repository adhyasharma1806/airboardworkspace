
import { Camera } from '@mediapipe/camera_utils';
import { Hands } from '@mediapipe/hands';

export const createCameraInstance = (
  videoElement: HTMLVideoElement,
  hands: Hands
): Camera => {
  return new Camera(videoElement, {
    onFrame: async () => {
      if (hands && videoElement) {
        await hands.send({ image: videoElement });
      }
    },
    width: 640,
    height: 480
  });
};

export const startCamera = async (videoElement: HTMLVideoElement): Promise<MediaStream> => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { 
      width: 640, 
      height: 480,
      facingMode: 'user'
    } 
  });
  
  videoElement.srcObject = stream;
  return stream;
};

export const stopCamera = (videoElement: HTMLVideoElement): void => {
  if (videoElement.srcObject) {
    const stream = videoElement.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }
};
