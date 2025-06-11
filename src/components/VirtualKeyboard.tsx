
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Keyboard, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  size?: 'small' | 'medium' | 'large';
  onSizeChange?: (size: 'small' | 'medium' | 'large') => void;
}

const VirtualKeyboard = ({ onKeyPress, size = 'medium', onSizeChange }: VirtualKeyboardProps) => {
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const handleKeyClick = (key: string) => {
    onKeyPress(key.toLowerCase());
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          button: 'min-w-6 h-6 text-xs',
          gap: 'gap-1',
          spacing: 'space-y-1'
        };
      case 'large':
        return {
          button: 'min-w-12 h-12 text-base',
          gap: 'gap-2',
          spacing: 'space-y-3'
        };
      default: // medium
        return {
          button: 'min-w-8 h-8 text-xs',
          gap: 'gap-1',
          spacing: 'space-y-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <Card className="glass-morphism border-cyber-primary/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Keyboard className="w-5 h-5 text-cyber-primary mr-2" />
          <h3 className="text-sm font-semibold cyber-font text-cyber-primary">
            Virtual Keyboard
          </h3>
        </div>
        
        {onSizeChange && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSizeChange('small')}
              className={`p-1 ${size === 'small' ? 'text-cyber-primary' : 'text-gray-400'}`}
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSizeChange('medium')}
              className={`p-1 ${size === 'medium' ? 'text-cyber-primary' : 'text-gray-400'}`}
            >
              <Keyboard className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSizeChange('large')}
              className={`p-1 ${size === 'large' ? 'text-cyber-primary' : 'text-gray-400'}`}
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className={sizeClasses.spacing}>
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className={`flex justify-center ${sizeClasses.gap}`}>
            {row.map((key) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handleKeyClick(key)}
                className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow ${sizeClasses.button} p-1 transition-all duration-200`}
              >
                {key}
              </Button>
            ))}
          </div>
        ))}

        {/* Special keys */}
        <div className={`flex justify-center ${sizeClasses.gap} mt-3`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onKeyPress('SPACE')}
            className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 ${sizeClasses.button}`}
          >
            SPACE
          </Button>
        </div>

        <div className={`flex justify-center ${sizeClasses.gap}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onKeyPress('BACKSPACE')}
            className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 ${sizeClasses.button}`}
          >
            ⌫ BACK
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onKeyPress('ENTER')}
            className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 ${sizeClasses.button}`}
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
