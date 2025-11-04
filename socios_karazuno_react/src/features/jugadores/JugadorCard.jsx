// src/features/jugadores/JugadorCard.jsx
import React from 'react';
import { FaUserCircle, FaEnvelope, FaIdCard } from 'react-icons/fa';

export default function JugadorCard({ jugador }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 flex items-center gap-4 transition-transform hover:scale-105 hover:shadow-lg">
      <FaUserCircle className="text-4xl text-gray-400 flex-shrink-0" />
      <div className="flex-grow">
        <p className="font-bold text-lg text-gray-800">{jugador.nombre_completo}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <FaEnvelope />
          <span>{jugador.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FaIdCard />
          <span>DNI: {jugador.nro_documento}</span>
        </div>
      </div>
    </div>
  );
}