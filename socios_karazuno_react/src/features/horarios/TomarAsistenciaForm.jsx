import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaCheck, FaTimes, FaSave } from 'react-icons/fa';

export default function TomarAsistenciaForm({ listaJugadores, onSubmit, onClose, isLoading }) {
  // Estado local para manejar los cambios antes de guardar
  const [asistencias, setAsistencias] = useState([]);

  // Inicializamos el estado con la lista que viene de la API
  useEffect(() => {
    if (listaJugadores) {
      setAsistencias(listaJugadores);
    }
  }, [listaJugadores]);

  // Función para cambiar el estado de un jugador individual
  const toggleAsistencia = (usuarioId) => {
    setAsistencias(prev => prev.map(jugador => {
      if (jugador.usuario_id === usuarioId) {
        const nuevoEstado = jugador.estado === 'presente' ? 'ausente' : 'presente';
        return { ...jugador, estado: nuevoEstado };
      }
      return jugador;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(asistencias);
  };

  // Contadores para el resumen
  const presentes = asistencias.filter(a => a.estado === 'presente').length;
  const total = asistencias.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[80vh]"> {/* Altura fija para scroll */}
      <div className="mb-4 flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-bold text-gray-800">Registro de Asistencia</h3>
        <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full">
          Presentes: {presentes} / {total}
        </span>
      </div>
      
      {/* Lista con Scroll */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {asistencias.map((jugador) => (
          <div 
            key={jugador.usuario_id} 
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              jugador.estado === 'presente' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {jugador.foto_url ? (
                <img src={jugador.foto_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <FaUserCircle className="text-3xl text-gray-400" />
              )}
              <div>
                <p className="font-bold text-gray-800">{jugador.nombre_completo}</p>
                <p className="text-xs text-gray-500 capitalize">{jugador.estado}</p>
              </div>
            </div>

            {/* Botón Switch */}
            <button
              type="button"
              onClick={() => toggleAsistencia(jugador.usuario_id)}
              className={`w-12 h-8 flex items-center justify-center rounded-full transition-colors ${
                jugador.estado === 'presente' 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
              }`}
            >
              {jugador.estado === 'presente' ? <FaCheck /> : <FaTimes />}
            </button>
          </div>
        ))}
      </div>

      {/* Footer con Botones */}
      <div className="pt-4 mt-2 border-t flex justify-end gap-2">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : <><FaSave /> Guardar Asistencia</>}
        </button>
      </div>
    </form>
  );
}