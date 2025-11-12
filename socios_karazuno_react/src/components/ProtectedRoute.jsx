import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/User.Context'; 

/**
 * Componente de Ruta Protegida con lógica de roles y estado de socio.
 * * @param {object} props
 * @param {React.ReactNode} props.children - El componente a renderizar.
 * @param {string[]} [props.allowedRoles] - Lista de roles (ej: 'admin') que pueden acceder.
 * @param {boolean} [props.requiresSocio] - Si es true, el usuario DEBE ser socio (tener socioinfo).
 * @param {boolean} [props.nonSocioOnly] - Si es true, el usuario NO DEBE ser socio (para páginas como 'hacerse-socio').
 */
function ProtectedRoute({ children, allowedRoles, requiresSocio, nonSocioOnly }) {
  const { user, isLoading } = useContext(UserContext);
  const location = useLocation();

  if (isLoading) {
    // Muestra un loader o null mientras se verifica el estado del usuario
    return <div className="flex justify-center items-center h-screen"><p>Cargando...</p></div>;
  }

  // 1. Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Lógica para rutas "Solo para NO socios" (ej: /hacerse-socio)
  if (nonSocioOnly && user.socioinfo) {
    // Si el usuario ya es socio, no puede ver esta página.
    return <Navigate to="/mi-perfil" replace />;
  }

  // 3. Lógica para rutas que "Requieren ser socio" (ej: /mis-cuotas)
  if (requiresSocio && !user.socioinfo) {
    // Si el usuario está logueado pero NO es socio, redirigir a la página para asociarse.
    return <Navigate to="/hacerse-socio" state={{ from: location }} replace />;
  }

  // 4. Lógica de roles (Admin, Profesor, etc.)
  if (allowedRoles) {
    const userRoles = user?.roles || []; // Roles del usuario (ej: ['admin', 'socio'])
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      // No tiene el rol específico (ej: admin)
      console.warn(`Acceso denegado a ${location.pathname}. Roles requeridos: ${allowedRoles.join(', ')}. Roles del usuario: ${userRoles.join(', ')}. Redirigiendo a /mi-perfil.`);
      return <Navigate to="/mi-perfil" replace />; // Redirigir a una página segura
    }
  }

  // 5. Si pasa todas las validaciones, renderizar la ruta
  return children;
}

export default ProtectedRoute;