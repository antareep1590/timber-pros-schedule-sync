
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demonstration purposes - in a real app, this would validate with a backend
    if (email && password) {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/schedule');
    } else {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please enter your email and password.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <div className="h-16 w-16 bg-green-700 rounded-full overflow-hidden mb-4 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Timber Pros" 
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/64";
                e.currentTarget.style.padding = "8px";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.fontWeight = "bold";
                e.currentTarget.style.textAlign = "center";
                (e.currentTarget as HTMLImageElement).alt = "TP";
              }}
            />
          </div>
          <h1 className="text-2xl font-medium text-gray-800">Login</h1>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              EMAIL
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                PASSWORD
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Show
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="text-right mb-6">
            <a href="#" className="text-sm text-green-500 hover:text-green-600">
              FORGOT PASSWORD?
            </a>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-md transition-colors"
          >
            LOGIN
          </Button>

          <div className="mt-4 text-center">
            <span className="text-gray-500">OR</span>
          </div>

          <button
            type="button"
            onClick={() => {
              toast({
                description: "Google login is not implemented in this demo",
              });
            }}
            className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            LOGIN WITH GOOGLE
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
