// src/pages/GestionClubPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FaFutbol,      
    FaUsersCog,    
    FaCalendarCheck,
    FaClock 
} from 'react-icons/fa';

export default function GestionClubPage() {
  
  const cardStyle = "flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer transition-all hover:shadow-xl hover:border-red-500 hover:-translate-y-1";
  const iconStyle = "text-5xl text-red-700 mb-4";
  const titleStyle = "text-2xl font-bold text-gray-800";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-red-700 mb-8">
        Gestión del Club
      </h1>
      
      <p className="text-xl text-gray-700 mb-6">
        Selecciona el área que deseas administrar:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        


        {/*  Deportes */}
        <Link to="/deportes" className={cardStyle}>
          <FaFutbol className={iconStyle} />
          <h2 className={titleStyle}>Deportes</h2>
          <p className="text-gray-600 text-center mt-2">Administrar disciplinas y categorías.</p>
        </Link>

        {/*  Eventos */}
        <Link to="/eventos" className={cardStyle}>
          <FaCalendarCheck className={iconStyle} />
          <h2 className={titleStyle}>Eventos</h2>
          <p className="text-gray-600 text-center mt-2">Organizar y visualizar eventos del club.</p>
        </Link>

        {/* Gestionar Horarios */}
        <Link to="/horarios" className={cardStyle}>
          <FaClock className={iconStyle} />
          <h2 className={titleStyle}>Horarios</h2>
          <p className="text-gray-600 text-center mt-2">Gestionar sesiones y horarios de entrenamiento.</p>
        </Link>

      </div>
    </div>
  );
}