
import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, RefreshCw, Home, Search, Globe, X, Hand, ZoomIn, ZoomOut, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/useCamera";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useBrowserGestureRecognition } from "@/hooks/useBrowserGestureRecognition";

interface AirBoardBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  isTracking: boolean;
}

const AirBoardBrowser = ({ isOpen, onClose, isTracking }: AirBoardBrowserProps) => {
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);
  const [gestureActions, setGestureActions] = useState({
    scrollUp: 0,
    scrollDown: 0,
    zoomIn: 0,
    zoomOut: 0,
    goBack: 0
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const { state: cameraState } = useCamera(isTracking);

  const handleNavigate = () => {
    if (!url) return;
    
    setIsLoading(true);
    let formattedUrl = url;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }
    
    setCurrentUrl(formattedUrl);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.back();
      } catch (error) {
        toast({
          title: "Navigation",
          description: "Cannot go back - browser restriction."
        });
      }
    }
  };

  const handleForward = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.forward();
      } catch (error) {
        toast({
          title: "Navigation",
          description: "Cannot go forward - browser restriction."
        });
      }
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleHome = () => {
    setUrl('https://www.google.com');
    setCurrentUrl('https://www.google.com');
    handleRefresh();
  };

  // Gesture action handlers
  const gestureActionHandlers = {
    onScrollUp: () => {
      setGestureActions(prev => ({ ...prev, scrollUp: prev.scrollUp + 1 }));
      toast({ title: "Gesture", description: "Scrolling up" });
    },
    onScrollDown: () => {
      setGestureActions(prev => ({ ...prev, scrollDown: prev.scrollDown + 1 }));
      toast({ title: "Gesture", description: "Scrolling down" });
    },
    onZoomIn: () => {
      setGestureActions(prev => ({ ...prev, zoomIn: prev.zoomIn + 1 }));
      toast({ title: "Gesture", description: "Zooming in" });
    },
    onZoomOut: () => {
      setGestureActions(prev => ({ ...prev, zoomOut: prev.zoomOut + 1 }));
      toast({ title: "Gesture", description: "Zooming out" });
    },
    onGoBack: () => {
      setGestureActions(prev => ({ ...prev, goBack: prev.goBack + 1 }));
      handleBack();
      toast({ title: "Gesture", description: "Going back" });
    }
  };

  const { state: gestureState, processHandLandmarks, resetDetection } = useBrowserGestureRecognition(
    iframeRef,
    gestureActionHandlers
  );

  const handleMediaPipeResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      processHandLandmarks(landmarks, canvas.width, canvas.height);

      // Draw hand connections and landmarks
      if (window.drawConnectors && window.HAND_CONNECTIONS) {
        window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
          color: gestureState.currentGesture === 'open_hand' ? "#00FF00" : "#00FFFF",
          lineWidth: 2,
        });
      }
      
      if (window.drawLandmarks) {
        window.drawLandmarks(ctx, landmarks, {
          color: gestureState.currentGesture === 'fist' ? "#FF0000" : "#FF00FF",
          lineWidth: 2,
          radius: 3
        });
      }

      // Draw gesture indicator
      if (gestureState.handPosition) {
        ctx.beginPath();
        ctx.arc(gestureState.handPosition.x, gestureState.handPosition.y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = gestureState.currentGesture !== 'none' ? "#00FF00" : "#FFFF00";
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else {
      resetDetection();
    }

    ctx.restore();
  }, [processHandLandmarks, resetDetection, gestureState]);

  useMediaPipe({
    videoRef,
    canvasRef,
    onResults: handleMediaPipeResults,
    isActive: isTracking && cameraState.isInitialized
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-cyber-dark/95 backdrop-blur-md flex flex-col">
      {/* Browser Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyber-primary/20 bg-cyber-dark/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-cyber-primary" />
          <h2 className="text-lg font-semibold cyber-font text-cyber-primary">
            AirBoard Browser
          </h2>
          {isTracking && (
            <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400">Gesture Control Active</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-cyber-primary hover:bg-cyber-primary/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center space-x-2 p-4 border-b border-cyber-primary/20 bg-cyber-dark/80 backdrop-blur-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="glass-morphism border-cyber-primary/30 text-cyber-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleForward}
          className="glass-morphism border-cyber-primary/30 text-cyber-primary"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="glass-morphism border-cyber-primary/30 text-cyber-primary"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleHome}
          className="glass-morphism border-cyber-primary/30 text-cyber-primary"
        >
          <Home className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex items-center space-x-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
            placeholder="Enter URL or search..."
            className="bg-cyber-dark/50 border-cyber-primary/30 text-foreground"
          />
          <Button
            onClick={handleNavigate}
            className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Gesture Action Indicators */}
        {isTracking && (
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1">
              <ArrowUp className="w-3 h-3 text-cyber-primary" />
              <span className="text-cyber-primary">{gestureActions.scrollUp}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowDown className="w-3 h-3 text-cyber-primary" />
              <span className="text-cyber-primary">{gestureActions.scrollDown}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ZoomIn className="w-3 h-3 text-cyber-primary" />
              <span className="text-cyber-primary">{gestureActions.zoomIn}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ZoomOut className="w-3 h-3 text-cyber-primary" />
              <span className="text-cyber-primary">{gestureActions.zoomOut}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Browser Content */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-cyber-dark/50 flex items-center justify-center z-10">
              <div className="text-cyber-primary cyber-font">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading...
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-none"
            title="AirBoard Browser"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>

        {/* Camera Feed Sidebar */}
        {isTracking && (
          <div className="w-80 border-l border-cyber-primary/20 bg-cyber-dark/50 p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-cyber-primary cyber-font mb-2">
                Gesture Control
              </h3>
              <div className="aspect-video bg-black relative rounded-lg overflow-hidden border border-cyber-primary/30">
                <video
                  ref={videoRef}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={240}
                  className="absolute top-0 left-0 w-full h-full"
                />
                
                {/* Gesture Status */}
                {gestureState.isHandDetected && (
                  <div className="absolute top-2 left-2 bg-black/70 rounded px-2 py-1">
                    <div className="text-xs text-cyber-primary font-mono">
                      {gestureState.currentGesture.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gesture Instructions */}
            <div className="space-y-2 text-xs">
              <div className="bg-cyber-primary/10 p-2 rounded border border-cyber-primary/20">
                <div className="font-semibold text-cyber-primary mb-1">Open Hand</div>
                <div className="text-gray-300">Move up/down to scroll</div>
              </div>
              <div className="bg-cyber-primary/10 p-2 rounded border border-cyber-primary/20">
                <div className="font-semibold text-cyber-primary mb-1">Thumbs Up</div>
                <div className="text-gray-300">Zoom in</div>
              </div>
              <div className="bg-cyber-primary/10 p-2 rounded border border-cyber-primary/20">
                <div className="font-semibold text-cyber-primary mb-1">Fist</div>
                <div className="text-gray-300">Zoom out / Go back (hold)</div>
              </div>
              <div className="bg-cyber-primary/10 p-2 rounded border border-cyber-primary/20">
                <div className="font-semibold text-cyber-primary mb-1">Peace</div>
                <div className="text-gray-300">Reset zoom</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirBoardBrowser;
