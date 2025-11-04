import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaHome, FaUser, FaCalendarAlt, FaMoneyBill, FaCalendarCheck,
    FaUsers, FaFutbol, FaChalkboardTeacher
    } from "react-icons/fa";
import logoImg from '../assets/logo.png';
import { UserContext } from "../contexts/User.Context";

function Navigation() {
    const location = useLocation();
    const { user } = React.useContext(UserContext);
    const userRoles = user?.roles || [];

    const navItems = [
        { to: "/dashboard", icon: FaHome, label: "Inicio" },
        { to: "/eventos", icon: FaCalendarCheck, label: "Eventos" },
    ];

    const esSocio = userRoles.includes("socio");
    const esAdmin = userRoles.includes("admin");
    const esDirigente = userRoles.includes("dirigente");
    const esEmpleado = userRoles.includes("empleado");
    const esProfesor = userRoles.includes("profesor");

    const puedeGestionarUsuarios = esAdmin || esDirigente || esEmpleado;
    const puedeGestionarDeportes = esAdmin || esDirigente || esEmpleado || esProfesor;
    const puedeGestionarEntrenadores = esAdmin || esDirigente || esEmpleado;
    const puedeVerJugadores = esAdmin || esDirigente || esProfesor;

    // --- Items específicos para Socios ---
    if (esSocio) {
        navItems.push(
            { to: "/mis-cuotas", icon: FaMoneyBill, label: "Mis cuotas" },
            { to: "/mi-calendario", icon: FaCalendarAlt, label: "Mi calendario" }
        );
    }

    // --- Items para roles de Gestión ---
    if (puedeGestionarUsuarios) {
        navItems.push({ to: "/usuarios", icon: FaUsers, label: "Usuarios" });
        navItems.push({ to: "/socios", icon: FaUsers, label: "Gestión de Socios" });
    }

    if (puedeGestionarDeportes) {
        navItems.push({ to: "/deportes", icon: FaFutbol, label: "Deportes" });
    }

    if (puedeGestionarEntrenadores) {
        navItems.push({ to: "/entrenadores", icon: FaChalkboardTeacher, label: "Entrenadores" });
    }

    if (puedeVerJugadores) {
        navItems.push({ to: "/jugadores", icon: FaUsers, label: "Jugadores" });
    }

    return (
        <aside className="w-64 bg-red-700 text-white flex flex-col justify-between h-screen fixed shadow-2xl">
            {/* Logo */}
             <div className="p-6 flex flex-col items-center">
                 <img src={logoImg} alt="Logo Punto Karazuno" className="w-32 mb-4" />
                 <div className="w-16 h-1 bg-red-400 rounded-full mb-6 mt-2"></div>
             </div>

            {/* Navegación Principal */}
            <nav className="flex-1 px-4 overflow-y-auto">
                <ul className="space-y-2 text-base font-semibold">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to ||
                                         (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
                        return (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition duration-200 ease-in-out w-full ${isActive ? "bg-white text-red-700 shadow-md font-extrabold transform translate-x-1" : "hover:bg-red-600 hover:text-white"}`}
                                >
                                    {item.icon && <item.icon className="text-xl flex-shrink-0" />}
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Mi Perfil Abajo */}
            <div className="p-4 border-t border-red-600">
                <Link
                    to="/mi-perfil"
                    className={`flex items-center gap-3 p-3 rounded-xl transition duration-200 ease-in-out w-full font-semibold ${location.pathname === "/mi-perfil" ? "bg-white text-red-700 shadow-md font-extrabold transform translate-x-1" : "hover:bg-red-600 hover:text-white"}`}
                >
                    <FaUser className="text-xl flex-shrink-0" />
                    <span>Mi perfil</span>
                </Link>
            </div>
        </aside>
    );
}

export default Navigation;