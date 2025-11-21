import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FaUsersCog, 
    FaUserCheck, 
    FaChalkboardTeacher,
    FaArrowRight 
} from 'react-icons/fa';

const MenuCard = ({ to, icon: Icon, title, description }) => (
  <Link 
    to={to} 
    className="group relative flex flex-col items-start p-8 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-red-200 overflow-hidden"
  >
    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative p-4 mb-6 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
      <Icon className="text-3xl" />
    </div>

    <div className="relative z-10 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">
          {title}
        </h2>
        <FaArrowRight className="text-gray-300 group-hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  </Link>
);

export default function GestionUsuariosPage() {
  return (
    <div className="min-h-[80vh] bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12 text-center md:text-left">
          <span className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-2 block">
            Personas
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Gestionar Usuarios
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Administra los diferentes roles dentro del sistema: administradores, socios y cuerpo técnico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <MenuCard 
            to="/usuarios"
            icon={FaUsersCog}
            title="Usuarios del Sistema"
            description="Configura cuentas de acceso administrativo, permisos y seguridad de la plataforma."
          />

          <MenuCard 
            to="/socios"
            icon={FaUserCheck}
            title="Socios"
            description="Base de datos de socios, estados de cuenta, cuotas y gestión de perfiles."
          />

          <MenuCard 
            to="/entrenadores"
            icon={FaChalkboardTeacher}
            title="Entrenadores"
            description="Gestión del cuerpo técnico, asignación a equipos y datos profesionales."
          />

        </div>
      </div>
    </div>
  );
}