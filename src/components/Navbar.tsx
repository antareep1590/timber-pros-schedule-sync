
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  
  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
    
    // If no role is set, redirect to login
    if (!role) {
      navigate('/login');
    }
  }, [navigate]);
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { name: "Work Order", path: "/work-order" },
      { name: "Schedule", path: "/schedule" },
      { name: "Time Tracker", path: "/time-tracker" },
    ];
    
    if (userRole === "admin") {
      // Admin has access to all pages
      return baseItems;
    } else if (userRole === "site-manager") {
      // Site Manager has access to all pages
      return baseItems;
    } else {
      // Crew Member only has access to Schedule and Time Tracker
      return baseItems.filter(item => item.path !== "/work-order");
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-6">
              {/* Logo */}
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img 
                  src="/lovable-uploads/d9033f50-a849-494d-bf3e-20b2a4f22bf0.png" 
                  alt="Timber Pros" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {getNavItems().map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium rounded ${
                    location.pathname === item.path
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole && (
              <div className="mr-4 text-sm text-gray-600">
                <span className="font-medium">
                  {userRole === "admin" ? "Admin" : 
                   userRole === "site-manager" ? "Site Manager" : "Crew Member"}
                </span>
              </div>
            )}
            
            {/* Logout button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
