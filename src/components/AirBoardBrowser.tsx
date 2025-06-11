
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, RefreshCw, Home, Search, Globe, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AirBoardBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  isTracking: boolean;
}

const AirBoardBrowser = ({ isOpen, onClose, isTracking }: AirBoardBrowserProps) => {
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const handleNavigate = () => {
    if (!url) return;
    
    setIsLoading(true);
    let formattedUrl = url;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }
    
    setCurrentUrl(formattedUrl);
    
    // Simulate loading time
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-cyber-dark/95 backdrop-blur-md">
      <Card className="h-full glass-morphism border-cyber-primary/20 rounded-none">
        {/* Browser Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyber-primary/20">
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
        <div className="flex items-center space-x-2 p-4 border-b border-cyber-primary/20">
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
        </div>

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

        {/* Gesture Instructions */}
        {isTracking && (
          <div className="p-3 bg-cyber-primary/10 border-t border-cyber-primary/20">
            <div className="flex items-center justify-center space-x-6 text-xs text-cyber-primary">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyber-primary rounded-full"></div>
                <span>Point to click</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyber-primary rounded-full"></div>
                <span>Swipe to scroll</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyber-primary rounded-full"></div>
                <span>Fist to go back</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AirBoardBrowser;
