import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';

export default function ListaEventos({ eventos, onEdit, onDelete, puedeGestionar }) {
  const navigate = useNavigate();

  const handleCardClick = (eventoId) => {
    navigate(`/eventos/${eventoId}`);
  };

  const handleButtonClick = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {eventos.map((evento) => (
        <div
          key={evento.id}
          className="bg-gray-50 border rounded-lg shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleCardClick(evento.id)}
        >
          <div>
            <h3 className="text-xl font-bold text-gray-800">{evento.titulo}</h3>
            <p className="text-sm text-gray-500 capitalize mb-2">{evento.tipo}</p>
            <p className="text-gray-700 mb-1"><strong>Lugar:</strong> {evento.lugar}</p>
            <p className="text-gray-700">
              <strong>Fecha:</strong> {new Date(evento.fecha_inicio).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <button
              onClick={(e) => handleButtonClick(e, () => navigate(`/eventos/${evento.id}`))}
              className="p-2 text-blue-600 hover:text-blue-800"
              title="Ver Detalles"
            >
              <FaInfoCircle size={20} />
            </button>
            {puedeGestionar && (
              <>
                <button
                  onClick={(e) => handleButtonClick(e, () => onEdit(evento))}
                  className="p-2 text-yellow-500 hover:text-yellow-700"
                  title="Editar"
                >
                  <FaEdit size={20} />
                </button>
                <button
                  onClick={(e) => handleButtonClick(e, () => onDelete(evento.id))}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <FaTrash size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}