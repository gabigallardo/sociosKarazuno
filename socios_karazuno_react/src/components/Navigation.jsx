// src/components/Navigation.jsx
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaHome, 
    FaUser, 
    FaCalendarAlt, 
    FaMoneyBill, 
    FaUsers, 
    FaCogs,
    FaCalendarCheck,
    FaUsersCog,
    FaQrcode,
    FaTimes // Importamos icono de cerrar para el menú móvil
} from "react-icons/fa";
import logoImg from '../assets/logo.webp'; 
import { UserContext } from "../contexts/User.Context"; 

function Navigation({ isOpen, onClose }) {
    const location = useLocation();
    const { user } = useContext(UserContext);
    const userRoles = user?.roles || [];

    const navItems = [
        { to: "/dashboard", icon: FaHome, label: "Inicio" }, 
    ];

    // Definición de roles
    const esSocio = userRoles.includes("socio");
    const esJugador = userRoles.includes("jugador");
    const esAdmin = userRoles.includes("admin");
    const esDirigente = userRoles.includes("dirigente");
    const esEmpleado = userRoles.includes("empleado");
    const esProfesor = userRoles.includes("profesor"); 

    // Variables de permisos
    const puedeVerJugadores = esAdmin || esDirigente || esProfesor;
    const puedeGestionarClub = esAdmin || esDirigente || esEmpleado || esProfesor;
    const puedeGestionarUsuarios = esAdmin || esDirigente || esEmpleado || esProfesor;
    
    // Permiso para Control de Acceso (Portería)
    const puedeControlarAcceso = esAdmin || esDirigente || esEmpleado;

    // --- Items específicos para Socios ---
    if (esSocio) {
        navItems.push(
            { to: "/mis-cuotas", icon: FaMoneyBill, label: "Mis cuotas" }
        );
    }

    // --- Items específicos para Jugadores ---
    if (esJugador || esSocio) {
        navItems.push(
            { to: "/eventos", icon: FaCalendarCheck, label: "Mis eventos" }
        );
    }

    // Calendario visible para todos los roles internos y socios ---
    if (esSocio || esJugador || esAdmin || esDirigente || esEmpleado || esProfesor) {
        navItems.push(
            { to: "/mi-calendario", icon: FaCalendarAlt, label: "Mi calendario" } 
        );
    }

    // --- Gestionar Usuarios ---
    if (puedeGestionarUsuarios) {
        navItems.push({ 
            to: "/gestionar-usuarios", 
            icon: FaUsersCog, 
            label: "Gestionar Usuarios" 
        });
    }

    // --- Item unificado para Gestión del Club (Deportes, Horarios, Eventos generales) ---
    if (puedeGestionarClub) {
        navItems.push({ 
            to: "/gestion-club", 
            icon: FaCogs, 
            label: "Gestión del Club" 
        });
    }

    if (puedeVerJugadores) {
        navItems.push({ to: "/jugadores", icon: FaUsers, label: "Jugadores" });
    }
    
    // --- Control de Acceso ---
    if (puedeControlarAcceso) {
        navItems.push({ 
            to: "/control-acceso", 
            icon: FaQrcode, 
            label: "Control de Acceso" 
        });
    }

    return (
        <>
            {/* Overlay: Fondo oscuro semi-transparente solo visible en móvil cuando el menú está abierto */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Barra Lateral */}
            <aside className={`
                w-64 bg-red-700 text-white flex flex-col justify-between h-screen fixed shadow-2xl z-50
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0
            `}>
                
                {/* Botón Cerrar (Solo visible en móviles) */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 md:hidden text-white text-2xl hover:bg-red-600 rounded-full p-1 transition-colors z-50"
                    aria-label="Cerrar menú"
                >
                    <FaTimes />
                </button>

                {/* Logo y Cabecera */}
                <div className="p-6 flex flex-col items-center relative">
                    <img src={logoImg} alt="Logo Punto Karazuno" className="w-32 mb-4" />
                    <div className="w-16 h-1 bg-red-400 rounded-full mb-6 mt-2"></div>
                </div>

                {/* Navegación Principal */}
                <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                    <ul className="space-y-2 text-base font-semibold">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.to ||
                                           (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
                            
                            return (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        onClick={onClose} // Cerramos el menú al hacer click en un enlace (experiencia móvil)
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ease-in-out w-full 
                                            ${isActive 
                                                ? "bg-white text-red-700 shadow-md font-extrabold transform translate-x-1" 
                                                : "hover:bg-red-600 hover:text-white hover:translate-x-1"
                                            }`}
                                    >
                                        {item.icon && <item.icon className="text-xl flex-shrink-0" />}
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Mi Perfil */}
                <div className="p-4 border-t border-red-600 bg-red-700">
                    <Link
                        to="/mi-perfil"
                        onClick={onClose} // Cerramos el menú aquí también
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ease-in-out w-full font-semibold 
                            ${location.pathname === "/mi-perfil" 
                                ? "bg-white text-red-700 shadow-md font-extrabold transform translate-x-1" 
                                : "hover:bg-red-600 hover:text-white hover:translate-x-1"
                            }`}
                    >
                        <FaUser className="text-xl flex-shrink-0" />
                        <span>Mi perfil</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}

export default Navigation;