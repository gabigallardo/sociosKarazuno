import React from 'react';
import { FaClock, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function HorarioCard({ horario, onEdit, onDelete }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
      <div>
        <p className="font-bold text-xl">{dias[horario.dia_semana]}</p>
        <div className="flex items-center gap-2 text-gray-600">
          <FaClock />
          <span>{horario.hora_inicio.slice(0, 5)} - {horario.hora_fin.slice(0, 5)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FaMapMarkerAlt />
          <span>{horario.lugar}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-blue-500 hover:text-blue-700 p-2"><FaEdit /></button>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-2"><FaTrash /></button>
      </div>
    </div>
  );
}