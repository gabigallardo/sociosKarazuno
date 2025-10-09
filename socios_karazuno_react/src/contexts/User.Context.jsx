// src/contexts/User.Context.jsx

import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

// 🔐 Función para decodificar un JWT sin librerías externas
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
      .split('')
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export function UserProviderWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); 

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("usuario");
        
    if (storedToken) {
      try {
        const base64Url = storedToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));
        setUser({
          id: decodedPayload.id,
          email: decodedPayload.email,
          roles: decodedPayload.roles || [],
        });
      } catch (error) {
        console.error("Error al parsear al decodificar el token:", error);
        localStorage.removeItem("authToken");
      }
    } else if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error al parsear el usuario almacenado:", error);
        localStorage.removeItem("usuario");
      }
    }
    
    setIsAuthLoaded(true); 
  }, []);

  // 🔥 Nueva función login que maneja todo el flujo
  const login = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("usuario", JSON.stringify(userData));
    
    // Decodificar el token para obtener los roles
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(window.atob(base64));
      
      // Usar los datos del token (que incluyen roles) combinados con userData
      const userWithRoles = {
        id: decodedPayload.id || userData.id,
        email: decodedPayload.email || userData.email,
        nombre: userData.nombre,
        roles: decodedPayload.roles || userData.roles || []
      };
      
      setUser(userWithRoles);
    } catch (error) {
      console.error("Error al decodificar token en login:", error);
      // Fallback: usar userData tal cual
      const fallbackUser = {
        ...userData,
        roles: userData.roles || []
      };
      console.log("🔥 LOGIN - Usuario fallback:", fallbackUser);
      setUser(fallbackUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    setUser(null);
  };

  // Si la carga inicial no ha terminado, mostramos un cargador
  if (!isAuthLoaded) {
     return <div className="text-center p-10 text-lg">Cargando aplicación...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}