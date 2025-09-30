// src/contexts/User.Context.jsx

import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProviderWrapper({ children }) {
  const [user, setUser] = useState(null);
  
  // Nuevo estado para evitar que las rutas protegidas redirijan antes de tiempo
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); 

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error al parsear el usuario de localStorage:", error);
        localStorage.removeItem("usuario");
        localStorage.removeItem("authToken");
      }
    }
    // Marcamos que la verificación inicial de la sesión ha terminado
    setIsAuthLoaded(true); 
  }, []);

  // Si la carga inicial no ha terminado, mostramos un cargador
  if (!isAuthLoaded) {
     return <div className="text-center p-10 text-lg">Cargando aplicación...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}