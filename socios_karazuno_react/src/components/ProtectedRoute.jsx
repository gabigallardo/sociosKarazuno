import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../contexts/User.Context.jsx";
import Layout from "../Layouts/Layout.jsx";
// Componente clave para la navegación segura
export default function ProtectedRoute({ element, allowedRoles = [] }) {
  // Obtiene el estado del usuario desde el contexto
  const { user } = useContext(UserContext);

  // Si NO hay usuario (user es null), redirige a login
  if (!user) {
    return <Navigate to="/login" replace={true} />;
  }

  // Si hay roles permitidos y el usuario no tiene ninguno
  const userRoles = user.roles || [];
  const hasPermission = allowedRoles.length === 0 || allowedRoles.some(role => userRoles.includes(role));

  if (!hasPermission) {
    // Redirige a una página de acceso denegado o a inicio
    return <Navigate to="/" replace={true} />;
  }

  // Si SÍ hay usuario, renderiza el contenido dentro del Layout
  return <Layout>{element}</Layout>;
}