import React, { useContext, useState } from "react"; 
import { Outlet, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBars } from "react-icons/fa"; 
import { Toaster } from 'react-hot-toast';

import { UserContext } from "../contexts/User.Context.jsx";
import Navigation from "../components/Navigation.jsx";
import Footer from "../components/Footer/Footer.jsx"; 

export default function Layout() { 
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("usuario");
        setUser(null);
        navigate("/login");
    };

    const userRoles = user?.roles || [];
    const puedeVerNavegacion = userRoles.some(rol =>
        ['socio', 'admin', 'profesor', 'dirigente', 'empleado'].includes(rol) 
    );

    return (
        <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'Poppins', sans-serif" }}>

            {puedeVerNavegacion && (
                <Navigation 
                    isOpen={mobileMenuOpen} 
                    onClose={() => setMobileMenuOpen(false)} 
                />
            )}

            <div className={`flex-1 flex flex-col min-h-screen ${puedeVerNavegacion ? 'md:ml-64 ml-0' : 'ml-0'} transition-all duration-300 ease-in-out`}>
                
                <header className="p-4 md:p-6 bg-white text-gray-800 flex justify-between items-center shadow-md sticky top-0 z-20 border-b border-gray-100">
                    
                    <div className="flex items-center gap-3 md:gap-4">
                        {puedeVerNavegacion && (
                            <button 
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden text-red-700 text-2xl focus:outline-none p-1 rounded hover:bg-gray-100"
                                aria-label="Abrir menú"
                            >
                                <FaBars />
                            </button>
                        )}

                        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">
                            Hola, {user ? <span className="text-red-600">{user.nombre}</span> : "Invitado"}
                        </h1>
                    </div>

                    {user && (
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-full shadow-lg font-semibold hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center gap-2 text-sm md:text-base"
                        >
                            <FaSignOutAlt className="text-lg md:text-xl" />
                            <span>Cerrar sesión</span>
                        </button>
                    )}
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>

                <Footer />

                <Toaster position="bottom-right" reverseOrder={false} />
            </div>
        </div>
    );
}