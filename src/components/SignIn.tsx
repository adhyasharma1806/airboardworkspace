
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignInProps {
  onSignIn: (user: { email: string; name: string }) => void;
  onBack: () => void;
}

const SignIn = ({ onSignIn, onBack }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (email && password) {
        onSignIn({ 
          email, 
          name: email.split('@')[0] 
        });
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
      } else {
        toast({
          title: "Sign in failed",
          description: "Please enter valid credentials.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-light flex items-center justify-center p-6">
      <Card className="glass-morphism border-cyber-primary/20 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-cyber-gradient rounded-lg flex items-center justify-center mx-auto mb-4 cyber-glow">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold cyber-font text-glow">Welcome to AirBoard</h1>
          <p className="text-gray-400 mt-2">Sign in to access your workspace</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-cyber-primary">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-cyber-dark/50 border-cyber-primary/30 text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-cyber-primary">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-cyber-dark/50 border-cyber-primary/30 text-foreground pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyber-gradient hover:opacity-90 text-white cyber-font"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-cyber-primary hover:bg-cyber-primary/10"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
