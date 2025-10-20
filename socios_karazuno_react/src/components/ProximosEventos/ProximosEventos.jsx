import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProximosEventos({ eventos }) {
  const navigate = useNavigate();

  return (
    <section className="bg-white text-gray-800 p-6 rounded-3xl shadow-xl mt-8 border border-gray-200">
      <h2 className="font-bold mb-4 text-2xl text-red-700 border-b pb-2">Próximos Eventos del Club</h2>
      <div className="bg-gray-100 rounded-lg p-6 shadow-inner border border-red-300/50">
        {eventos.length === 0 ? (<p className="text-gray-500 italic">No hay eventos próximos.</p>) : (
          <div className="flex flex-col gap-6">
            {eventos.map((evento) => (
              <div key={evento.id} onClick={() => navigate(`/eventos/${evento.id}`)} className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition duration-200 border border-gray-200 w-full cursor-pointer">
                <h3 className="text-xl font-bold mb-2 text-red-700">{evento.titulo}</h3>
                <p className="text-sm text-gray-600 mb-2">{new Date(evento.fecha_inicio).toLocaleDateString()} – {new Date(evento.fecha_fin).toLocaleDateString()}</p>
                <p className="text-gray-700">{evento.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 text-right">
        <button onClick={() => navigate('/eventos')} className="text-sm bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg transition duration-300 hover:bg-red-800 transform hover:scale-105">
          Ver todos los eventos
        </button>
      </div>
    </section>
  );
}

export default ProximosEventos;