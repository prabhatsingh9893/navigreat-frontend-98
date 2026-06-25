import React from 'react';
import { Navigate } from 'react-router-dom';

export const RoleBasedRoute = ({ children, requiredRole }) => {
  const userData = localStorage.getItem('userData');
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);
    if (user.role !== requiredRole) {
      // Direct unauthorized users back to their respective dashboards
      const redirectPath = user.role === 'mentor' ? '/dashboard/mentor' : '/dashboard/student';
      return <Navigate to={redirectPath} replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleBasedRoute;
