
import { GestureRecognitionState } from "@/hooks/useGestureRecognition";

interface GestureOverlayProps {
  state: GestureRecognitionState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const GestureOverlay = ({ state, canvasRef }: GestureOverlayProps) => {
  return (
    <>
      {/* Gesture Status Overlay */}
      {state.isHandDetected && (
        <div className="absolute top-2 left-2 bg-black/70 rounded px-2 py-1">
          <div className="text-xs text-cyber-primary font-mono">
            Gesture: {state.currentGesture.toUpperCase()}
          </div>
          {state.hoveredKey && (
            <div className="text-xs text-yellow-400 font-mono">
              Key: {state.hoveredKey} ({Math.round(state.hoverProgress)}%)
            </div>
          )}
        </div>
      )}

      {/* Hand Detection Indicator */}
      {state.isHandDetected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-16 h-16 border-2 border-cyber-primary rounded-full cyber-glow animate-pulse">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 bg-cyber-primary rounded-full"></div>
            </div>
          </div>
          <div className="text-xs text-cyber-primary text-center mt-2 cyber-font">
            HAND DETECTED
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-0 left-0 w-full h-full"
      />
    </>
  );
};

export default GestureOverlay;
