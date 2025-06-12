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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Use camera hook properly
  const { videoRef, state: cameraState } = useCamera(isTracking);

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

  // Enhanced gesture action handlers with iframe scrolling
  const gestureActionHandlers = {
    onScrollUp: () => {
      setGestureActions(prev => ({ ...prev, scrollUp: prev.scrollUp + 1 }));
      // Try multiple methods to scroll the iframe
      if (iframeRef.current) {
        try {
          // Method 1: Direct iframe document access
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.documentElement.scrollTop -= 100;
            iframeDoc.body.scrollTop -= 100;
          }
          
          // Method 2: PostMessage to iframe
          iframeRef.current.contentWindow?.postMessage({ 
            type: 'scroll', 
            direction: 'up', 
            amount: 100 
          }, '*');
          
          console.log('📜 Scroll up executed');
        } catch (error) {
          console.log('❌ Scroll blocked by CORS:', error);
        }
      }
      toast({ title: "Gesture", description: "Scrolling up", duration: 1000 });
    },
    onScrollDown: () => {
      setGestureActions(prev => ({ ...prev, scrollDown: prev.scrollDown + 1 }));
      if (iframeRef.current) {
        try {
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.documentElement.scrollTop += 100;
            iframeDoc.body.scrollTop += 100;
          }
          
          iframeRef.current.contentWindow?.postMessage({ 
            type: 'scroll', 
            direction: 'down', 
            amount: 100 
          }, '*');
          
          console.log('📜 Scroll down executed');
        } catch (error) {
          console.log('❌ Scroll blocked by CORS:', error);
        }
      }
      toast({ title: "Gesture", description: "Scrolling down", duration: 1000 });
    },
    onZoomIn: () => {
      setGestureActions(prev => ({ ...prev, zoomIn: prev.zoomIn + 1 }));
      if (iframeRef.current) {
        try {
          // Try to zoom iframe content
          const iframe = iframeRef.current;
          const currentScale = parseFloat(iframe.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || '1');
          const newScale = Math.min(currentScale * 1.1, 3);
          iframe.style.transform = `scale(${newScale})`;
          iframe.style.transformOrigin = 'center center';
          
          console.log('🔍 Zoom in executed:', newScale);
        } catch (error) {
          console.log('❌ Zoom blocked:', error);
        }
      }
      toast({ title: "Gesture", description: "Zooming in", duration: 1000 });
    },
    onZoomOut: () => {
      setGestureActions(prev => ({ ...prev, zoomOut: prev.zoomOut + 1 }));
      if (iframeRef.current) {
        try {
          const iframe = iframeRef.current;
          const currentScale = parseFloat(iframe.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || '1');
          const newScale = Math.max(currentScale * 0.9, 0.5);
          iframe.style.transform = `scale(${newScale})`;
          iframe.style.transformOrigin = 'center center';
          
          console.log('🔍 Zoom out executed:', newScale);
        } catch (error) {
          console.log('❌ Zoom blocked:', error);
        }
      }
      toast({ title: "Gesture", description: "Zooming out", duration: 1000 });
    },
    onGoBack: () => {
      setGestureActions(prev => ({ ...prev, goBack: prev.goBack + 1 }));
      handleBack();
      toast({ title: "Gesture", description: "Going back", duration: 1000 });
    }
  };

  const { state: gestureState, processHandLandmarks, resetDetection } = useBrowserGestureRecognition(
    iframeRef,
    gestureActionHandlers
  );

  const handleMediaPipeResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas || !video) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    console.log('🎥 MediaPipe results:', {
      hasLandmarks: !!(results.multiHandLandmarks && results.multiHandLandmarks.length > 0),
      landmarkCount: results.multiHandLandmarks?.[0]?.length || 0,
      canvasSize: `${canvas.width}x${canvas.height}`,
      videoSize: `${video.videoWidth}x${video.videoHeight}`
    });

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
  }, [processHandLandmarks, resetDetection, gestureState, videoRef]);

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
              <div className={`w-2 h-2 rounded-full ${cameraState.isInitialized ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className={cameraState.isInitialized ? 'text-green-400' : 'text-yellow-400'}>
                {cameraState.isInitialized ? 'Gesture Control Active' : 'Initializing Camera...'}
              </span>
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
        {isTracking && cameraState.isInitialized && (
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
            style={{ transformOrigin: 'center center' }}
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
                {cameraState.isInitialized ? (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute top-0 left-0 w-full h-full object-cover scale-x-[-1]"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full scale-x-[-1]"
                    />
                    
                    {/* Gesture Status */}
                    {gestureState.isHandDetected && (
                      <div className="absolute top-2 left-2 bg-black/70 rounded px-2 py-1">
                        <div className="text-xs text-cyber-primary font-mono">
                          {gestureState.currentGesture.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      {cameraState.error ? (
                        <>
                          <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <div className="text-sm text-red-400">Camera Error</div>
                          <div className="text-xs text-red-300 mt-1">{cameraState.error}</div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <div className="text-sm text-cyber-primary">Initializing Camera...</div>
                        </>
                      )}
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

            {/* Debug Info */}
            {cameraState.isInitialized && (
              <div className="mt-4 p-2 bg-black/50 rounded border border-cyber-primary/20 text-xs">
                <div className="text-cyber-primary font-mono">Debug Info:</div>
                <div className="text-gray-300">Hand: {gestureState.isHandDetected ? '✓' : '✗'}</div>
                <div className="text-gray-300">Gesture: {gestureState.currentGesture}</div>
                <div className="text-gray-300">Confidence: {Math.round(gestureState.gestureConfidence * 100)}%</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AirBoardBrowser;
