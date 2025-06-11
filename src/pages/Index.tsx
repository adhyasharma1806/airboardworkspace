import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Hand, Eye, FileText, Cpu, Sparkles, User } from "lucide-react";
import AirBoardWorkspace from "@/components/AirBoardWorkspace";
import SignIn from "@/components/SignIn";

const Index = () => {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  const handleSignIn = (userData: { email: string; name: string }) => {
    setUser(userData);
    setShowSignIn(false);
    setShowWorkspace(true);
  };

  const handleSignOut = () => {
    setUser(null);
    setShowWorkspace(false);
  };

  if (showSignIn) {
    return <SignIn onSignIn={handleSignIn} onBack={() => setShowSignIn(false)} />;
  }

  if (showWorkspace) {
    return (
      <AirBoardWorkspace 
        onBack={() => setShowWorkspace(false)} 
        user={user}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-light overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyber-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyber-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyber-gradient rounded-lg flex items-center justify-center cyber-glow">
              <Hand className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold cyber-font text-glow">AirBoard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSignIn(true)}
              className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/10"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button variant="outline" className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/10">
              <Eye className="w-4 h-4 mr-2" />
              Camera Status
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-cyber-primary/20 text-cyber-primary rounded-full text-sm font-medium cyber-font border border-cyber-primary/30">
                ✨ Touchless Productivity Revolution
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black cyber-font mb-8 leading-tight">
              <span className="bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-accent bg-clip-text text-transparent animate-gradient-shift bg-300%">
                Type with Your
              </span>
              <br />
              <span className="text-glow">Hands in the Air</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the future of productivity with AirBoard - a revolutionary workspace where gestures replace keyboards and the air becomes your interface.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-cyber-gradient hover:opacity-90 text-white cyber-font text-lg px-8 py-4 rounded-xl cyber-glow transition-all duration-300 hover:scale-105"
                onClick={() => setShowWorkspace(true)}
              >
                <Zap className="w-5 h-5 mr-2" />
                Launch Workspace
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="glass-morphism border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/10 cyber-font text-lg px-8 py-4 rounded-xl"
              >
                <FileText className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold cyber-font text-center mb-16 text-glow">
              Futuristic Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Hand,
                  title: "Gesture Typing",
                  description: "Type by hovering your finger over a virtual keyboard in 3D space"
                },
                {
                  icon: Eye,
                  title: "Real-time Tracking",
                  description: "Advanced computer vision tracks your hand movements with precision"
                },
                {
                  icon: Sparkles,
                  title: "Custom Gestures",
                  description: "Fist for backspace, peace sign for space, and more intuitive controls"
                },
                {
                  icon: FileText,
                  title: "Smart Export",
                  description: "Save your work as PDF or TXT with one simple gesture"
                },
                {
                  icon: Cpu,
                  title: "AI Assistant",
                  description: "Built-in AI for autocomplete, grammar, and content enhancement"
                },
                {
                  icon: Zap,
                  title: "Zero Latency",
                  description: "Responsive interface with real-time gesture recognition"
                }
              ].map((feature, index) => (
                <Card key={index} className="glass-morphism border-cyber-primary/20 p-6 hover:border-cyber-primary/40 transition-all duration-300 hover:scale-105 hover:cyber-glow">
                  <div className="w-12 h-12 bg-cyber-gradient rounded-lg flex items-center justify-center mb-4 cyber-glow">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold cyber-font mb-3 text-cyber-primary">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-morphism border-cyber-primary/30 p-12 cyber-glow">
              <h2 className="text-4xl font-bold cyber-font mb-6 text-glow">
                Ready to Enter the Future?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users already experiencing touchless productivity
              </p>
              <Button 
                size="lg" 
                className="bg-cyber-gradient hover:opacity-90 text-white cyber-font text-xl px-12 py-6 rounded-xl cyber-glow transition-all duration-300 hover:scale-105"
                onClick={() => setShowWorkspace(true)}
              >
                <Hand className="w-6 h-6 mr-3" />
                Start Your Journey
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
