import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

function ProximosEventos({ eventos = [], limit = null }) {
  const navigate = useNavigate();

  // Lógica para filtrar solo eventos futuros, ordenarlos y limitar la cantidad
  const eventosParaMostrar = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const futuros = eventos
      .filter((e) => new Date(e.fecha_inicio) >= hoy)
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

    return limit ? futuros.slice(0, limit) : futuros;
  }, [eventos, limit]);

  // Función auxiliar para formatear fechas de forma elegante
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCalendarAlt className="text-red-600" />
          Próximos Eventos
        </h2>
        {limit && (
          <button
            onClick={() => navigate('/eventos')}
            className="text-sm text-red-600 hover:text-red-800 font-semibold transition-colors"
          >
            Ver todo &rarr;
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        {eventosParaMostrar.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p>No hay eventos próximos programados.</p>
          </div>
        ) : (
          eventosParaMostrar.map((evento) => {
            const fecha = formatDate(evento.fecha_inicio);
            return (
              <div
                key={evento.id}
                onClick={() => navigate(`/eventos/${evento.id}`)}
                className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:bg-red-50/30 hover:border-red-100 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Badge de Fecha */}
                <div className="flex flex-col items-center justify-center min-w-[60px] h-[60px] bg-red-100 text-red-700 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <span className="text-xs font-bold uppercase tracking-wide">{fecha.month}</span>
                  <span className="text-2xl font-extrabold leading-none">{fecha.day}</span>
                </div>

                {/* Info del Evento */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-red-700 transition-colors">
                    {evento.titulo}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaClock className="text-gray-400" />
                      {new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {evento.ubicacion && (
                      <span className="flex items-center gap-1 truncate">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {evento.ubicacion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default ProximosEventos;