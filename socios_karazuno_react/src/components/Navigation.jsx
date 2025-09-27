import { Link } from "react-router-dom";
import React from "react";
import { FaHome, FaUser, FaCalendarAlt, FaMoneyBill, FaCalendarCheck } from "react-icons/fa";

export function Navigation() {
  return (
    <div>
    <nav>
      <ul>
        <li>
        </li>
        <li>
        </li>
      </ul>
    </nav>


    <aside className="w-64 bg-red-700 text-white flex flex-col justify-between h-screen fixed">
      {/* Logo */}
      <div className="p-4 flex flex-col items-center">
          <img src="/logo.png" alt="Logo Punto Karazuno" className="w-20 h-20 mb-4" />
      </div>

      {/* Links */}
      <nav className="flex-1 px-4">
        <ul className="space-y-4">
          <li className="flex items-center gap-3 hover:bg-red-600 p-2 rounded cursor-pointer">
            <FaHome />         <Link to="/socios">Socios</Link>

          </li>
          <li className="flex items-center gap-3 hover:bg-red-600 p-2 rounded cursor-pointer">
            <FaMoneyBill />           <Link to="/mis-cuotas">Mis cuotas</Link>
          </li>
          <li className="flex items-center gap-3 hover:bg-red-600 p-2 rounded cursor-pointer">
            <FaCalendarAlt />           <Link to="/form">Mi calendario</Link>

          </li>
          <li className="flex items-center gap-3 hover:bg-red-600 p-2 rounded cursor-pointer">
            <FaCalendarCheck />           <Link to="/eventos">Eventos</Link>

          </li>
        </ul>
      </nav>

      {/* Perfil */}
      <div className="p-4 border-t border-red-500">
        <button className="flex items-center gap-3 hover:bg-red-600 p-2 rounded w-full">
          <FaUser /> Mi perfil
        </button>
      </div>
    </aside>
    </div>
  );
}
