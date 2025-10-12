import Navigation from "../components/Navigation.jsx";
import React, { useContext } from "react";
import { UserContext } from "../contexts/User.Context.jsx";
import { useNavigate } from "react-router-dom";
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

  const userRoles = user?.roles || [];
  const esSocio = userRoles.includes("socio");
  const esAdmin = userRoles.includes("admin");
  const esProfesor = userRoles.includes("profesor");
  const esDirigente = userRoles.includes("dirigente");

  const mostrarNavegacion = esSocio || esAdmin || esProfesor || esDirigente;

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {mostrarNavegacion && <Navigation />}

      <div className={`flex-1 flex flex-col ${mostrarNavegacion ? 'ml-64' : 'ml-0'}`}>
        <header className="p-6 bg-white text-gray-800 flex justify-between items-center shadow-md sticky top-0 z-10 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hola, {user ? <span className="text-red-600">{user.nombre}</span> : "Invitado"}
          </h1>

          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-full shadow-lg font-semibold hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center gap-2"
              title="Cerrar sesión"
            >
              <FaSignOutAlt className="text-xl" />
              Cerrar sesión
            </button>
          )}
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}