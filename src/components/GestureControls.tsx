import { Card } from "@/components/ui/card";
import { Hand, RotateCcw, Zap, Move } from "lucide-react";

const GestureControls = () => {
  const gestures = [
    {
      icon: Hand,
      name: "Point",
      description: "Hover to type",
      keys: "Any key"
    },
    {
      icon: Hand,
      name: "Fist",
      description: "Delete character",
      keys: "Backspace"
    },
    {
      icon: Hand,
      name: "Peace",
      description: "Add space",
      keys: "Space"
    },
    {
      icon: Move,
      name: "Swipe",
      description: "Scroll page",
      keys: "↑ ↓"
    }
  ];

  return (
    <Card className="glass-morphism border-cyber-primary/20 p-4">
      <div className="flex items-center mb-4">
        <Zap className="w-5 h-5 text-cyber-primary mr-2" />
        <h3 className="text-sm font-semibold cyber-font text-cyber-primary">
          Gesture Controls
        </h3>
      </div>

      <div className="space-y-3">
        {gestures.map((gesture, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 bg-cyber-dark/30 rounded border border-cyber-primary/10 hover:border-cyber-primary/30 transition-colors">
            <div className="w-8 h-8 bg-cyber-gradient rounded-lg flex items-center justify-center flex-shrink-0">
              <gesture.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-cyber-primary cyber-font">
                {gesture.name}
              </div>
              <div className="text-xs text-gray-400">
                {gesture.description}
              </div>
            </div>
            <div className="text-xs text-gray-500 font-mono bg-cyber-dark/50 px-2 py-1 rounded">
              {gesture.keys}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-cyber-primary/10 rounded border border-cyber-primary/30">
        <div className="flex items-center text-xs text-cyber-primary">
          <RotateCcw className="w-3 h-3 mr-1" />
          <span className="font-medium">Tip:</span>
        </div>
        <div className="text-xs text-gray-300 mt-1">
          Keep your hand 12-18 inches from the camera for optimal tracking
        </div>
      </div>
    </Card>
  );
};

export default GestureControls;
