import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaCalendarDay, FaClock, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

const estadoInfo = {
  programada: { icon: FaClock, color: 'text-blue-500', label: 'Programada' },
  completada: { icon: FaCheckCircle, color: 'text-green-500', label: 'Completada' },
  cancelada: { icon: FaTimesCircle, color: 'text-red-500', label: 'Cancelada' },
};

export default function SesionCard({ sesion }) {
  const fecha = parseISO(sesion.fecha);
  const info = estadoInfo[sesion.estado] || { icon: FaExclamationCircle, color: 'text-gray-500', label: sesion.estado };
  const IconoEstado = info.icon;

  return (
    <div className="bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex-grow">
        <p className="font-bold text-xl text-gray-800 capitalize">
          {format(fecha, "EEEE dd 'de' MMMM", { locale: es })}
        </p>
        <div className="flex items-center gap-2 text-gray-600 mt-1">
          <FaClock />
          <span>{sesion.hora_inicio?.slice(0, 5) ?? 'N/A'} - {sesion.hora_fin?.slice(0, 5) ?? 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FaMapMarkerAlt />
          <span>{sesion.lugar ?? 'Lugar no definido'}</span>
        </div>
      </div>
      <div className={`flex items-center gap-2 font-semibold p-2 rounded-lg ${info.color}`}>
        <IconoEstado />
        <span>{info.label}</span>
      </div>
    </div>
  );
}
