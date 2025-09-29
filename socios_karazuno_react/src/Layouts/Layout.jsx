import Navigation from "../components/Navigation.jsx";
import React, { useContext } from "react";
import { UserContext } from "../contexts/User.Context.jsx";
import { useNavigate } from "react-router-dom";

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
    <div className="flex">
      <Navigation />

      <div className="ml-64 flex-1 min-h-screen flex flex-col bg-white">
        <header className="p-6 border-b flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Hola, {user ? <span>{user.nombre}</span> : "Invitado"}
          </h1>

          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Cerrar sesión
            </button>
          )}
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
