import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * ✅ ProtectedRoute Component
 * Ensures only authenticated users can access protected routes
 * Based on auth_token in localStorage
 */
export const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if auth_token exists
    const token = localStorage.getItem("auth_token");
    
    console.log("🔐 ProtectedRoute check:", token ? "✅ auth_token found" : "❌ auth_token missing");
    
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Still checking
  if (isAuthenticated === null) {
    return null;
  }

  // Not authenticated - redirect to sign-in
  if (!isAuthenticated) {
    console.log("🔴 Redirecting to sign-in (no auth_token)");
    return <Navigate to="/authentication/sign-in" replace />;
  }

  // Authenticated - render component
  return children;
};

export default ProtectedRoute;
