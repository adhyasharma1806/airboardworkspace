
import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Refresh, Globe, Hand, Navigation } from "lucide-react";

interface AirBoardBrowserProps {
  onClose: () => void;
}

const AirBoardBrowser = ({ onClose }: AirBoardBrowserProps) => {
  const [url, setUrl] = useState('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);
  const [gestureMode, setGestureMode] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = useCallback((newUrl: string) => {
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    setUrl(newUrl);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleGestureAction = useCallback((action: string) => {
    switch (action) {
      case 'scroll_up':
        // Simulate scroll up gesture
        console.log('Gesture: Scroll up detected');
        break;
      case 'scroll_down':
        // Simulate scroll down gesture
        console.log('Gesture: Scroll down detected');
        break;
      case 'click':
        // Simulate click gesture
        console.log('Gesture: Click detected');
        break;
      case 'back':
        // Simulate back gesture
        window.history.back();
        break;
    }
  }, []);

  const quickActions = [
    { name: 'Google', url: 'https://www.google.com', icon: Search },
    { name: 'YouTube', url: 'https://www.youtube.com', icon: Globe },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: Globe },
    { name: 'GitHub', url: 'https://www.github.com', icon: Globe }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-light z-50">
      {/* Header */}
      <header className="glass-morphism border-b border-cyber-primary/20 p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-cyber-primary hover:bg-cyber-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Close Browser
          </Button>

          <div className="flex-1 flex items-center space-x-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate(url)}
              placeholder="Enter URL or search term..."
              className="bg-cyber-dark/50 border-cyber-primary/30 text-foreground"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate(url)}
              className="glass-morphism border-cyber-primary/30 text-cyber-primary"
            >
              <Navigation className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="glass-morphism border-cyber-primary/30 text-cyber-primary"
            >
              <Refresh className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setGestureMode(!gestureMode)}
            className={`glass-morphism border-cyber-primary/30 ${
              gestureMode ? 'text-green-400 border-green-400/30' : 'text-cyber-primary'
            }`}
          >
            <Hand className="w-4 h-4 mr-2" />
            {gestureMode ? 'Gestures ON' : 'Gestures OFF'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-xs text-gray-400">Quick Actions:</span>
          {quickActions.map((action) => (
            <Button
              key={action.name}
              variant="outline"
              size="sm"
              onClick={() => handleNavigate(action.url)}
              className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 h-7 px-3 text-xs"
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.name}
            </Button>
          ))}
        </div>
      </header>

      {/* Browser Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Browser Area */}
        <div className="flex-1 p-4">
          <Card className="glass-morphism border-cyber-primary/20 h-full relative">
            {isLoading && (
              <div className="absolute inset-0 bg-cyber-dark/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-cyber-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <div className="text-cyber-primary cyber-font">Loading...</div>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full rounded-lg"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="AirBoard Browser"
            />
          </Card>
        </div>

        {/* Gesture Control Panel */}
        {gestureMode && (
          <div className="w-80 p-4">
            <Card className="glass-morphism border-cyber-primary/20 p-4">
              <div className="flex items-center mb-4">
                <Hand className="w-5 h-5 text-cyber-primary mr-2" />
                <h3 className="text-sm font-semibold cyber-font text-cyber-primary">
                  Browser Gestures
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { gesture: 'Point Up', action: 'Scroll Up', key: '↑' },
                  { gesture: 'Point Down', action: 'Scroll Down', key: '↓' },
                  { gesture: 'Fist', action: 'Go Back', key: '←' },
                  { gesture: 'Open Palm', action: 'Click/Select', key: 'Click' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-cyber-dark/30 rounded border border-cyber-primary/10">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-cyber-primary cyber-font">
                        {item.gesture}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.action}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono bg-cyber-dark/50 px-2 py-1 rounded">
                      {item.key}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-cyber-primary/10 rounded border border-cyber-primary/30">
                <div className="text-xs text-cyber-primary">
                  <Hand className="w-3 h-3 inline mr-1" />
                  <span className="font-medium">Active:</span> Hand tracking enabled for browser navigation
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirBoardBrowser;
