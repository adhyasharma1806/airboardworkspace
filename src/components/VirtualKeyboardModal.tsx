
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, X, ZoomIn, ZoomOut } from "lucide-react";

interface VirtualKeyboardModalProps {
  onKeyPress: (key: string) => void;
  children: React.ReactNode;
}

const VirtualKeyboardModal = ({ onKeyPress, children }: VirtualKeyboardModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('large');

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

  const sizeClasses = getSizeClasses();

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
          </div>
          
          <div className="flex items-center space-x-2">
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
                  variant="outline"
                  onClick={() => handleKeyClick(key)}
                  className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow ${sizeClasses.button} transition-all duration-200`}
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}

          {/* Special keys */}
          <div className={`flex justify-center ${sizeClasses.gap} mt-4`}>
            <Button
              variant="outline"
              onClick={() => onKeyPress('SPACE')}
              className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 max-w-md ${sizeClasses.button}`}
            >
              SPACE
            </Button>
          </div>

          <div className={`flex justify-center ${sizeClasses.gap}`}>
            <Button
              variant="outline"
              onClick={() => onKeyPress('BACKSPACE')}
              className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 max-w-xs ${sizeClasses.button}`}
            >
              ⌫ BACK
            </Button>
            <Button
              variant="outline"
              onClick={() => onKeyPress('ENTER')}
              className={`glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 hover:cyber-glow flex-1 max-w-xs ${sizeClasses.button}`}
            >
              ↵ ENTER
            </Button>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400 text-center">
          Use gestures or click keys to type • Point gesture hovers • Fist for backspace • Peace for space
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualKeyboardModal;
