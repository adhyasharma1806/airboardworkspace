
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, X, ZoomIn, ZoomOut } from "lucide-react";
import { KeyboardKey } from "@/lib/virtualKeyboardDetector";

interface VirtualKeyboardModalProps {
  onKeyPress: (key: string) => void;
  children: React.ReactNode;
  gestureState?: {
    fingerPosition: { x: number; y: number } | null;
    hoveredKey: string | null;
    hoverProgress: number;
    currentGesture: string;
  };
}

const VirtualKeyboardModal = ({ onKeyPress, children, gestureState }: VirtualKeyboardModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<'tiny' | 'small' | 'medium' | 'large'>('large');
  const [keyboardKeys, setKeyboardKeys] = useState<KeyboardKey[]>([]);

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
      case 'tiny':
        return {
          button: 'min-w-6 h-6 text-xs',
          gap: 'gap-1',
          spacing: 'space-y-1'
        };
      case 'small':
        return {
          button: 'min-w-8 h-8 text-sm',
          gap: 'gap-2',
          spacing: 'space-y-2'
        };
      case 'large':
        return {
          button: 'min-w-16 h-16 text-lg',
          gap: 'gap-3',
          spacing: 'space-y-4'
        };
      default: // medium
        return {
          button: 'min-w-12 h-12 text-base',
          gap: 'gap-2',
          spacing: 'space-y-3'
        };
    }
  };

  // Update keyboard layout for gesture recognition when modal opens
  useEffect(() => {
    if (isOpen) {
      // Calculate key positions for gesture detection
      setTimeout(() => {
        const keys: KeyboardKey[] = [];
        const keyElements = document.querySelectorAll('[data-key]');
        
        keyElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const key = element.getAttribute('data-key');
          if (key) {
            keys.push({
              key: key,
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            });
          }
        });
        
        setKeyboardKeys(keys);
        
        // Notify parent component about keyboard layout
        if (window.updateKeyboardLayout) {
          window.updateKeyboardLayout(keys);
        }
      }, 100);
    }
  }, [isOpen, size]);

  const sizeClasses = getSizeClasses();

  const getKeyStyle = (key: string) => {
    const isHovered = gestureState?.hoveredKey === key.toLowerCase();
    const baseStyle = `glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow ${sizeClasses.button} transition-all duration-200`;
    
    if (isHovered && gestureState?.currentGesture === 'point') {
      return `${baseStyle} bg-cyber-primary/30 cyber-glow border-cyber-primary`;
    }
    
    return baseStyle;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="glass-morphism border-cyber-primary/20 max-w-4xl w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Keyboard className="w-6 h-6 text-cyber-primary mr-3" />
            <h2 className="text-xl font-semibold cyber-font text-cyber-primary">
              Virtual Keyboard
            </h2>
            {gestureState?.currentGesture && (
              <div className="ml-4 px-2 py-1 bg-cyber-dark/50 rounded border border-cyber-primary/20">
                <span className="text-xs text-cyber-primary font-mono">
                  {gestureState.currentGesture.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSize('tiny')}
              className={`p-2 ${size === 'tiny' ? 'text-cyber-primary' : 'text-gray-400'}`}
            >
              <span className="text-xs">XS</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSize('small')}
              className={`p-2 ${size === 'small' ? 'text-cyber-primary' : 'text-gray-400'}`}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSize('medium')}
              className={`p-2 ${size === 'medium' ? 'text-cyber-primary' : 'text-gray-400'}`}
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSize('large')}
              className={`p-2 ${size === 'large' ? 'text-cyber-primary' : 'text-gray-400'}`}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-cyber-primary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className={sizeClasses.spacing}>
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} className={`flex justify-center ${sizeClasses.gap}`}>
              {row.map((key) => (
                <Button
                  key={key}
                  data-key={key.toLowerCase()}
                  variant="outline"
                  onClick={() => handleKeyClick(key)}
                  className={getKeyStyle(key)}
                >
                  {key}
                  {gestureState?.hoveredKey === key.toLowerCase() && gestureState?.hoverProgress > 0 && (
                    <div className="absolute inset-0 bg-cyber-primary opacity-20 rounded-md" 
                         style={{ width: `${gestureState.hoverProgress}%` }}>
                    </div>
                  )}
                </Button>
              ))}
            </div>
          ))}

          {/* Special keys */}
          <div className={`flex justify-center ${sizeClasses.gap} mt-4`}>
            <Button
              data-key="space"
              variant="outline"
              onClick={() => onKeyPress('SPACE')}
              className={`${getKeyStyle('space')} flex-1 max-w-md relative`}
            >
              SPACE
              {gestureState?.hoveredKey === 'space' && gestureState?.hoverProgress > 0 && (
                <div className="absolute inset-0 bg-cyber-primary opacity-20 rounded-md" 
                     style={{ width: `${gestureState.hoverProgress}%` }}>
                </div>
              )}
            </Button>
          </div>

          <div className={`flex justify-center ${sizeClasses.gap}`}>
            <Button
              data-key="backspace"
              variant="outline"
              onClick={() => onKeyPress('BACKSPACE')}
              className={`${getKeyStyle('backspace')} flex-1 max-w-xs relative`}
            >
              ⌫ BACK
              {gestureState?.hoveredKey === 'backspace' && gestureState?.hoverProgress > 0 && (
                <div className="absolute inset-0 bg-cyber-primary opacity-20 rounded-md" 
                     style={{ width: `${gestureState.hoverProgress}%` }}>
                </div>
              )}
            </Button>
            <Button
              data-key="enter"
              variant="outline"
              onClick={() => onKeyPress('ENTER')}
              className={`${getKeyStyle('enter')} flex-1 max-w-xs relative`}
            >
              ↵ ENTER
              {gestureState?.hoveredKey === 'enter' && gestureState?.hoverProgress > 0 && (
                <div className="absolute inset-0 bg-cyber-primary opacity-20 rounded-md" 
                     style={{ width: `${gestureState.hoverProgress}%` }}>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400 text-center">
          Use gestures or click keys to type • Point gesture hovers • Fist for backspace • Peace for space
          {gestureState?.hoveredKey && (
            <div className="mt-2 text-cyber-primary">
              Hovering: {gestureState.hoveredKey.toUpperCase()} ({Math.round(gestureState.hoverProgress)}%)
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualKeyboardModal;
