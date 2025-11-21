import React from 'react';
import { FaEnvelope, FaIdCard, FaUser, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function JugadorCard({ jugador }) {
  const alDia = jugador.cuota_al_dia;

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
      
      {/* --- Fondo Decorativo Superior --- */}
      <div className={`h-24 ${alDia ? 'bg-gradient-to-r from-gray-900 to-black' : 'bg-gradient-to-r from-red-900 to-red-700'}`}></div>
      
      <div className="px-6 pb-6 relative">
        
        {/* --- Foto de Perfil Flotante --- */}
        <div className="relative -mt-12 mb-3 flex justify-between items-end">
          <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gray-200 overflow-hidden">
            {jugador.foto_url ? (
              <img 
                src={jugador.foto_url} 
                alt={jugador.nombre_completo} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'}}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 ${jugador.foto_url ? 'hidden' : 'flex'}`}>
               <FaUser className="text-4xl" />
            </div>
          </div>

          {/* Badge de Estado */}
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm mb-1 ${
            alDia ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {alDia ? <FaCheckCircle /> : <FaExclamationCircle />}
            {alDia ? 'Al Día' : 'Deuda'}
          </div>
        </div>

        {/* --- Información del Jugador --- */}
        <div>
          <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 truncate group-hover:text-red-700 transition-colors">
            {jugador.nombre_completo}
          </h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            {jugador.categoria_nombre || "Sin Categoría"}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
              <FaIdCard className="text-red-500 text-opacity-70" />
              <span className="font-mono font-medium">{jugador.nro_documento || "---"}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100 truncate">
              <FaEnvelope className="text-red-500 text-opacity-70" />
              <span className="truncate" title={jugador.email}>{jugador.email}</span>
            </div>
          </div>
        </div>

        {/* Decoración de hover (borde inferior) */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>
    </div>
  );
}