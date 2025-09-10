import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  roles = null, 
  requiresApproval = false,
  fallbackPath = '/login'
}) => {
  const { user, userProfile, loading, initializing, hasRole } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Wait for user profile to load
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  // Check if user needs to complete application
  if (userProfile.role === 'Applicant' && userProfile.status === 'pending' && requiresApproval) {
    return <Navigate to="/apply" replace />;
  }

  // Check role permissions if specified
  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;