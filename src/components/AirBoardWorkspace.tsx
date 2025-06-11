import { useEffect } from "react";
import { classifyGesture } from "@/lib/utils"; 
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Eye, Settings, Zap, Save, FileText, User, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VirtualKeyboard from "./VirtualKeyboard";
import CameraPreview from "./CameraPreview";
import GestureControls from "./GestureControls";
import SignInDialog from "./SignInDialog";
import AirBoardBrowser from "./AirBoardBrowser";

interface AirBoardWorkspaceProps {
  onBack: () => void;
}

const AirBoardWorkspace = ({ onBack }: AirBoardWorkspaceProps) => {
  const [content, setContent] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [keyboardSize, setKeyboardSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showBrowser, setShowBrowser] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);

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
      // PDF export would require a library like jsPDF
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
  useEffect(() => {
  if (!isTracking) return;

  const hands = new window.Hands({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  hands.onResults((results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
  setHandDetected(true); // 👈 real-time UI trigger

  const landmarks = results.multiHandLandmarks[0];
  const gesture = classifyGesture(landmarks);
  console.log("✋ Gesture Detected:", gesture);

  if (gesture === "Fist") handleKeyPress("BACKSPACE");
  else if (gesture === "Peace") handleKeyPress("SPACE");
  else if (gesture === "Point") handleKeyPress("A");

  window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
    color: "#00FF00",
    lineWidth: 2,
  });
  window.drawLandmarks(ctx, landmarks, {
    color: "#FF0000",
    lineWidth: 1,
  });
} else {
  setHandDetected(false); // 👈 hide UI when hand not seen
}


    ctx.restore();
  });

  const camera = new window.Camera(videoRef.current, {
    onFrame: async () => {
      await hands.send({ image: videoRef.current });
    },
    width: 640,
    height: 480,
  });

  camera.start();
  return () => {
    camera.stop();
  };
}, [isTracking, handleKeyPress]);


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
          </div>

          <div className="flex items-center space-x-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeyboard(!showKeyboard)}
              className="glass-morphism border-cyber-primary/30 text-cyber-primary"
            >
              <Settings className="w-4 h-4" />
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
              placeholder="Start typing with gestures or use the virtual keyboard below..."
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
          {/* Camera Preview */}
          <CameraPreview isTracking={isTracking} />

          {/* Gesture Controls */}
          <GestureControls />

          {/* Virtual Keyboard */}
          {showKeyboard && (
            <VirtualKeyboard 
              onKeyPress={handleKeyPress} 
              size={keyboardSize}
              onSizeChange={setKeyboardSize}
            />
          )}
          <div className="hidden">
    <video ref={videoRef} autoPlay playsInline muted />
    <canvas ref={canvasRef} width={640} height={480} />
  </div>
          

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
