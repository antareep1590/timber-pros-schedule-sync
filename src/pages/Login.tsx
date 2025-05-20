
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
    navigate('/work-order');
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <div className="h-32 w-32 overflow-hidden mb-6">
            <img 
              src="/lovable-uploads/d9033f50-a849-494d-bf3e-20b2a4f22bf0.png" 
              alt="Timber Pros" 
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-medium text-gray-800">Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-md transition-colors"
          >
            LOGIN
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
