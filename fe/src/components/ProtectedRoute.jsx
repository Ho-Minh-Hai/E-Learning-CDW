import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requireRole) {
    const userRole = user?.user_metadata?.role;
    if (userRole !== requireRole) {
      // Redirect based on user's actual role
      if (userRole === 'student') {
        return <Navigate to="/student/dashboard" replace />;
      } else if (userRole === 'instructor' || userRole === 'admin') {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
