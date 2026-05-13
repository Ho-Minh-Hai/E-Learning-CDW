import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requireRole, allowRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.user_metadata?.role;

  // Helper to handle role-based redirection
  const getRedirectPath = (role) => {
    if (role === 'student' || role === 'user') return '/student/dashboard';
    if (role === 'instructor' || role === 'teacher' || role === 'admin') return '/dashboard';
    return '/';
  };

  // Check multiple allowed roles
  if (allowRoles && !allowRoles.includes(userRole)) {
    const target = getRedirectPath(userRole);
    // Only redirect if target is different from current or if we are not already at a valid dashboard
    return <Navigate to={target} replace />;
  }

  // Check single required role
  if (requireRole && userRole !== requireRole) {
    // Special case: allow 'teacher' and 'instructor' to be interchangeable if one is required
    const isTeacherRole = (role) => role === 'teacher' || role === 'instructor';
    if (isTeacherRole(userRole) && isTeacherRole(requireRole)) {
        // Allow access
    } else {
        const target = getRedirectPath(userRole);
        return <Navigate to={target} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
