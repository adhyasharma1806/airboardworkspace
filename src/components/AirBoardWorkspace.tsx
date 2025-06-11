
import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Eye, Settings, Zap, FileText, User, Globe, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VirtualKeyboardModal from "./VirtualKeyboardModal";
import CameraPreviewSimple from "./CameraPreviewSimple";
import GestureControls from "./GestureControls";
import SignInDialog from "./SignInDialog";
import AirBoardBrowser from "./AirBoardBrowser";
import { GestureRecognitionState } from "@/hooks/useGestureRecognition";

interface AirBoardWorkspaceProps {
  onBack: () => void;
}

const AirBoardWorkspace = ({ onBack }: AirBoardWorkspaceProps) => {
  const [content, setContent] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [gestureState, setGestureState] = useState<GestureRecognitionState>({
    currentGesture: 'none',
    fingerPosition: null,
    hoveredKey: null,
    hoverProgress: 0,
    isHandDetected: false
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'BACKSPACE') {
      setContent(prev => prev.slice(0, -1));
    } else if (key === 'SPACE') {
      setContent(prev => prev + ' ');
    } else if (key === 'ENTER') {
      setContent(prev => prev + '\n');
    } else {
      setContent(prev => prev + key);
    }
  }, []);

  const handleGestureKeyType = useCallback((key: string) => {
    handleKeyPress(key);
    toast({
      title: "Gesture typing",
      description: `Typed: ${key}`,
      duration: 1000
    });
  }, [handleKeyPress, toast]);

  const handleGestureBackspace = useCallback(() => {
    setContent(prev => prev.slice(0, -1));
    toast({
      title: "Gesture action",
      description: "Backspace (Fist gesture)",
      duration: 1000
    });
  }, [toast]);

  const handleGestureSpace = useCallback(() => {
    setContent(prev => prev + ' ');
    toast({
      title: "Gesture action", 
      description: "Space (Peace gesture)",
      duration: 1000
    });
  }, [toast]);

  const handleGestureStateUpdate = useCallback((newState: GestureRecognitionState) => {
    setGestureState(newState);
  }, []);

  const handleExport = (format: 'txt' | 'pdf') => {
    if (!content.trim()) {
      toast({
        title: "No content to export",
        description: "Please add some content before exporting.",
        variant: "destructive"
      });
      return;
    }

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `airboard-notes-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Your notes have been exported as TXT file."
      });
    } else {
      toast({
        title: "PDF export",
        description: "PDF export feature coming soon!"
      });
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    toast({
      title: isTracking ? "Tracking stopped" : "Tracking started",
      description: isTracking ? "Hand tracking has been disabled." : "Hand tracking is now active."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-light">
      {/* Header */}
      <header className="glass-morphism border-b border-cyber-primary/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-cyber-primary hover:bg-cyber-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold cyber-font text-glow">AirBoard Workspace</h1>
            {/* Gesture Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-cyber-dark/50 rounded border border-cyber-primary/20">
              <div className="text-xs text-gray-400">Gesture:</div>
              <div className="text-xs text-cyber-primary font-mono uppercase">
                {gestureState.currentGesture}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <VirtualKeyboardModal 
              onKeyPress={handleKeyPress}
              gestureState={gestureState}
            >
              <Button
                variant="outline"
                size="sm"
                className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Keyboard
              </Button>
            </VirtualKeyboardModal>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBrowser(true)}
              className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20"
            >
              <Globe className="w-4 h-4 mr-2" />
              Browser
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTracking}
              className={`glass-morphism border-cyber-primary/30 ${
                isTracking ? 'text-green-400 border-green-400/30' : 'text-cyber-primary'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isTracking ? 'Tracking ON' : 'Tracking OFF'}
            </Button>
            
            <SignInDialog>
              <Button
                variant="outline"
                size="sm"
                className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </SignInDialog>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <Card className="glass-morphism border-cyber-primary/20 h-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold cyber-font text-cyber-primary">
                Smart Notepad
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('txt')}
                  className="glass-morphism border-cyber-primary/30 text-cyber-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  TXT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  className="glass-morphism border-cyber-primary/30 text-cyber-primary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>

            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing with gestures or use the virtual keyboard..."
              className="w-full h-[calc(100%-80px)] bg-cyber-dark/50 border-cyber-primary/30 text-foreground placeholder:text-gray-400 resize-none text-lg leading-relaxed focus:border-cyber-primary cyber-glow"
            />

            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
              <span>{content.length} characters • {content.split(/\s+/).filter(Boolean).length} words</span>
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-cyber-primary" />
                Real-time sync enabled
              </span>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 p-6 space-y-6">
          {/* Camera Preview with Gesture Recognition */}
          <CameraPreviewSimple
            isTracking={isTracking}
            onGestureDetected={handleGestureStateUpdate}
            onKeyType={handleGestureKeyType}
            onBackspace={handleGestureBackspace}
            onSpace={handleGestureSpace}
          />

          {/* Gesture Controls */}
          <GestureControls />
        </div>
      </div>

      {/* AirBoard Browser */}
      <AirBoardBrowser 
        isOpen={showBrowser} 
        onClose={() => setShowBrowser(false)}
        isTracking={isTracking}
      />
    </div>
  );
};

export default AirBoardWorkspace;
