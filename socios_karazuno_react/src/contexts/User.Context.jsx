
import React, { createContext, useState, useEffect } from "react";

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

  if (!isAuthLoaded) {
    return <div className="text-center p-10 text-lg">Cargando aplicación...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}