import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarDay, FaArrowRight, FaBus, FaGlassCheers } from 'react-icons/fa';

export default function ListaEventos({ eventos, onEdit, onDelete, puedeGestionar }) {
  const navigate = useNavigate();

  const handleCardClick = (eventoId) => {
    navigate(`/eventos/${eventoId}`);
  };

  const handleButtonClick = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  // Función para determinar el icono y color según el tipo
const getEventoStyle = (tipo) => {
    if (tipo === 'viaje') {
      return { icon: <FaBus />, bg: 'bg-green-100', text: 'text-green-700', label: 'Viaje' };
    }
    return { icon: <FaGlassCheers />, bg: 'bg-red-100', text: 'text-red-700', label: 'Evento' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {eventos.map((evento) => {
        const estilo = getEventoStyle(evento.tipo);
        const fecha = new Date(evento.fecha_inicio);

        return (
          <div
            key={evento.id}
            onClick={() => handleCardClick(evento.id)}
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
          >
            {/* Barra lateral de color decorativa */}
<div className={`absolute left-0 top-0 bottom-0 w-1.5 ${evento.tipo === 'viaje' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="p-6 flex-grow">
              {/* Cabecera de la tarjeta */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${estilo.bg} ${estilo.text}`}>
                  {estilo.icon} {estilo.label}
                </span>
                {/* Fecha compacta */}
                <div className="text-center bg-gray-50 rounded-lg p-1 border border-gray-100 min-w-[50px]">
                   <span className="block text-xs text-gray-500 uppercase font-bold">{fecha.toLocaleString('es', { month: 'short' })}</span>
                   <span className="block text-xl font-extrabold text-gray-800 leading-none">{fecha.getDate()}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors line-clamp-2">
                {evento.titulo}
              </h3>

              <div className="space-y-2 mt-4">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="mt-1 text-gray-400 flex-shrink-0" />
                  <span className="line-clamp-1">{evento.lugar}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendarDay className="text-gray-400 flex-shrink-0" />
                  <span>{fecha.toLocaleDateString()} - {new Date(evento.fecha_fin).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Footer de acciones */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={(e) => handleButtonClick(e, () => navigate(`/eventos/${evento.id}`))}
                className="text-sm font-semibold text-gray-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                Ver detalles <FaArrowRight className="text-xs" />
              </button>

              {puedeGestionar && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleButtonClick(e, () => onEdit(evento))}
                    className="p-2 rounded-full bg-white text-gray-500 border border-gray-200 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => handleButtonClick(e, () => onDelete(evento.id))}
                    className="p-2 rounded-full bg-white text-gray-500 border border-gray-200 hover:text-red-600 hover:border-red-200 shadow-sm transition-all"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}