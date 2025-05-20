
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If not logged in, redirect to login page
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // If user's role is not in allowedRoles, redirect to appropriate page
  if (!allowedRoles.includes(userRole)) {
    if (userRole === "admin" || userRole === "site-manager") {
      return <Navigate to="/work-order" replace />;
    } else {
      return <Navigate to="/schedule" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleGuard;
