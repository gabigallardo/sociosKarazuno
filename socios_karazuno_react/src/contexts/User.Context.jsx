import React, { createContext, useState, useEffect } from "react";
import { getMe } from "../api/usuarios.api";

export const UserContext = createContext();

export function UserProviderWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);


  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("usuario");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("usuario");
      }
    }
    
    setIsAuthLoaded(true);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("usuario", JSON.stringify(userData)); 
    setUser(userData); 
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    setUser(null);
  };

  const refreshUser = async () => {
    console.log("🔄 Refrescando datos del usuario...");
    try {
      const refreshedUserData = await getMe();
      // Actualiza tanto el localStorage como el estado de React
      localStorage.setItem("usuario", JSON.stringify(refreshedUserData));
      setUser(refreshedUserData);
    } catch (error) {
      // Si el token ya no es válido, la llamada a getMe fallará.
      // Lo más seguro es cerrar la sesión.
      console.error("No se pudo refrescar el usuario, cerrando sesión.");
      logout();
    }
  };

  if (!isAuthLoaded) {
    return <div className="text-center p-10 text-lg">Cargando aplicación...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}