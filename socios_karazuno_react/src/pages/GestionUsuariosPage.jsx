// src/pages/GestionUsuariosPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsersCog, FaUserCheck, FaChalkboardTeacher } from 'react-icons/fa';

export default function GestionUsuariosPage() {
  
  // Estilos para las tarjetas del menú (puedes ajustarlos)
  const cardStyle = "flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer transition-all hover:shadow-xl hover:border-red-500 hover:-translate-y-1";
  const iconStyle = "text-5xl text-red-700 mb-4";
  const titleStyle = "text-2xl font-bold text-gray-800";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-red-700 mb-8">
        Gestionar usuarios
      </h1>
      
      <p className="text-xl text-gray-700 mb-6">
        ¿Qué deseas gestionar?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Gestión de Usuarios */}
        <Link to="/usuarios" className={cardStyle}>
          <FaUsersCog className={iconStyle} />
          <h2 className={titleStyle}>Usuarios</h2>
          <p className="text-gray-600 text-center mt-2">Gestionar cuentas, permisos y roles del sistema.</p>
        </Link>

        {/* Tarjeta 2: Gestión de Socios */}
        <Link to="/socios" className={cardStyle}>
          <FaUserCheck className={iconStyle} />
          <h2 className={titleStyle}>Socios</h2>
          <p className="text-gray-600 text-center mt-2">Administrar perfiles, cuotas y datos de los socios.</p>
        </Link>

        {/* Tarjeta 3: Gestión de Entrenadores */}
        <Link to="/entrenadores" className={cardStyle}>
          <FaChalkboardTeacher className={iconStyle} />
          <h2 className={titleStyle}>Entrenadores</h2>
          <p className="text-gray-600 text-center mt-2">Asignar entrenadores a disciplinas y categorías.</p>
        </Link>

      </div>
    </div>
  );
}