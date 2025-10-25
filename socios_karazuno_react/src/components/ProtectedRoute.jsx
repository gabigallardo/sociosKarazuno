// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/User.Context'; 

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useContext(UserContext);
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const userRoles = user?.roles || []; // Obtener roles del usuario (asegurándose de que exista)
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      console.warn(`Acceso denegado a ${location.pathname}. Roles requeridos: ${allowedRoles.join(', ')}. Roles del usuario: ${userRoles.join(', ')}. Redirigiendo a /dashboard.`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;