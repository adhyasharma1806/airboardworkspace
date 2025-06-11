
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Keyboard, Maximize, Minimize } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
}

const VirtualKeyboard = ({ onKeyPress }: VirtualKeyboardProps) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const handleKeyClick = (key: string) => {
    onKeyPress(key.toLowerCase());
  };

  const keySize = isEnlarged ? 'min-w-12 h-12' : 'min-w-8 h-8';
  const fontSize = isEnlarged ? 'text-base' : 'text-xs';

  return (
    <Card className="glass-morphism border-cyber-primary/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Keyboard className="w-5 h-5 text-cyber-primary mr-2" />
          <h3 className="text-sm font-semibold cyber-font text-cyber-primary">
            Virtual Keyboard
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEnlarged(!isEnlarged)}
          className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20"
        >
          {isEnlarged ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>

      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handleKeyClick(key)}
                className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow ${keySize} p-1 ${fontSize} transition-all duration-200`}
              >
                {key}
              </Button>
            ))}
          </div>
        ))}

        {/* Special keys */}
        <div className="flex justify-center gap-1 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onKeyPress('SPACE')}
            className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 ${isEnlarged ? 'h-12' : 'h-8'} ${fontSize}`}
          >
            SPACE
          </Button>
        </div>

        <div className="flex justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onKeyPress('BACKSPACE')}
            className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 ${isEnlarged ? 'h-12' : 'h-8'} ${fontSize}`}
          >
            ⌫ BACK
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onKeyPress('ENTER')}
            className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 ${isEnlarged ? 'h-12' : 'h-8'} ${fontSize}`}
          >
            ↵ ENTER
          </Button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        Hover over keys with your finger to type
      </div>
    </Card>
  );
};

export default VirtualKeyboard;
