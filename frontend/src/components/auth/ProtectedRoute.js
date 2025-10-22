import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import authService from '../../services/auth';
import { USER_ROLES } from '../../utils/constants';


 // ProtectedRoute component that wraps routes requiring authentication - Handles role-based access control and loading states
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  fallbackPath = '/login' 
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (authService.isTokenExpired()) {
          authService.logout();
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Refresh user profile to ensure data is current
        await authService.refreshProfile();
        
        const user = authService.getCurrentUser();
        setIsAuthenticated(true);
        setUserRole(user.role);
        
      } catch (error) {
        console.error('Auth check error:', error);
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-akademia-light">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-akademia-primary mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = userRole === USER_ROLES.ADMIN 
      ? '/admin/dashboard' 
      : '/judge/dashboard';
    
    return (
      <Navigate 
        to={dashboardPath} 
        replace 
      />
    );
  }

  // Render protected content
  return children;
};

/**
 * AdminRoute component for admin-only routes
 */
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * JudgeRoute component for judge-only routes
 */
export const JudgeRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole={USER_ROLES.JUDGE}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * AdminOrJudgeRoute component for routes accessible by both admin and judge
 */
export const AdminOrJudgeRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;