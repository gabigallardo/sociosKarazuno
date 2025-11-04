// src/components/PerfilDeportivoDisplay/PerfilDeportivoDisplay.jsx

import React from 'react';
import { FaFutbol, FaUsers, FaQuestionCircle } from 'react-icons/fa';

// Un componente simple para mostrar la información del perfil deportivo
export default function PerfilDeportivoDisplay({ socioInfo }) {
  const disciplina = socioInfo?.disciplina_nombre;
  const categoria = socioInfo?.categoria_nombre;

  return (
    <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-slate-50 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tu Perfil Actual</h2>
      <div className="space-y-4">
        {/* Fila para la Disciplina */}
        <div className="flex items-center gap-4">
          <FaFutbol className="text-2xl text-red-600" />
          <div>
            <p className="text-sm font-semibold text-gray-500">Disciplina</p>
            {disciplina ? (
              <p className="text-lg font-medium text-gray-900">{disciplina}</p>
            ) : (
              <p className="text-lg text-gray-400 italic flex items-center gap-2">
                <FaQuestionCircle />
                Aún no seleccionada
              </p>
            )}
          </div>
        </div>

        {/* Fila para la Categoría */}
        <div className="flex items-center gap-4">
          <FaUsers className="text-2xl text-red-600" />
          <div>
            <p className="text-sm font-semibold text-gray-500">Categoría</p>
            {categoria ? (
              <p className="text-lg font-medium text-gray-900">{categoria}</p>
            ) : (
              <p className="text-lg text-gray-400 italic flex items-center gap-2">
                <FaQuestionCircle />
                Aún no seleccionada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}