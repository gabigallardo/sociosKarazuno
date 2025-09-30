// src/components/Navigation.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaCalendarAlt, FaMoneyBill, FaCalendarCheck } from "react-icons/fa";
import logoImg from '../assets/logo.png'; 

function Navigation() {
  const location = useLocation();

  const navItems = [
    { to: "/socios", icon: FaHome, label: "Inicio" },
    { to: "/mis-cuotas", icon: FaMoneyBill, label: "Mis cuotas" },
    { to: "/mi-calendario", icon: FaCalendarAlt, label: "Mi calendario" }, //crear esta ruta en App.jsx
    { to: "/eventos", icon: FaCalendarCheck, label: "Eventos" },
  ];

  return ( 
    <aside className="w-64 bg-red-700 text-white flex flex-col justify-between h-screen fixed shadow-2xl">
      {/* Logo */}
      <div className="p-6 flex flex-col items-center">
        <img src={logoImg} alt="Logo Punto Karazuno" className="w-32 mb-4" />
        <div className="w-16 h-1 bg-red-400 rounded-full mb-6 mt-2"></div>
      </div>

      {/* Links */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-2 text-base font-semibold">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            
            return (
              <li key={item.to}>
                <Link 
                  to={item.to}
                  className={`flex items-center gap-3 p-3 rounded-xl transition duration-200 ease-in-out w-full
                    ${isActive 
                      ? "bg-white text-red-700 shadow-md font-extrabold transform translate-x-1" 
                      : "hover:bg-red-600 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="text-xl" /> 
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Perfil */}
      <div className="p-4 border-t border-red-600">
        <Link 
          to="/mi-perfil" // crear esta ruta en App.jsx
          className={`flex items-center gap-3 p-3 rounded-xl transition duration-200 ease-in-out w-full
            ${location.pathname === "/mi-perfil" 
              ? "bg-white text-red-700 shadow-md font-extrabold transform translate-x-1" 
              : "hover:bg-red-600 hover:text-white"
            }
          `}
        >
          <FaUser className="text-xl" /> 
          Mi perfil
        </Link>
      </div>
    </aside>
  );
}

export default Navigation;