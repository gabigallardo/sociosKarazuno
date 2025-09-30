import Navigation from "../components/Navigation.jsx";
import React, { useContext } from "react";
import { UserContext } from "../contexts/User.Context.jsx";
import { useNavigate } from "react-router-dom";
// Importar React Icons para el botón de Cerrar Sesión
import { FaSignOutAlt } from "react-icons/fa"; 

export default function Layout({ children }) {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    setUser(null);
    navigate("/login");
  };

  return (
    // Fondo general limpio
    <div className="flex min-h-screen bg-gray-50"           style={{ fontFamily: "'Poppins', sans-serif" }} 
>
      {/* Sidebar - La clase ml-64 ahora se maneja automáticamente porque Navigation es fijo */}
      <Navigation />

      {/* Contenido principal */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Header - Ahora es blanco y más limpio */}
        <header className="p-6 bg-white text-gray-800 flex justify-between items-center shadow-md sticky top-0 z-10 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hola, {user ? <span className="text-red-600">{user.nombre}</span> : "Invitado"}
          </h1>

          {user && (
            // Botón de Cerrar Sesión con FaSignOutAlt
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-full shadow-lg font-semibold hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center gap-2"
              title="Cerrar sesión"
            >
              <FaSignOutAlt className="text-xl" /> {/* Icono de React */}
              Cerrar sesión
            </button>
          )}
        </header>

        {/* Main */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}