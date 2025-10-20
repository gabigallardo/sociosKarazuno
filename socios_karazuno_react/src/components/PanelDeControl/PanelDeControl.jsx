import React from 'react';
import { FaUsers } from 'react-icons/fa';

function PanelDeControl({ nombreUsuario }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
      <h2 className="text-3xl font-extrabold text-red-700 flex items-center gap-3"><FaUsers /> Panel de Control</h2>
      <p className="mt-2 text-gray-600">Bienvenido, {nombreUsuario}. Desde aquí puedes acceder a las funciones administrativas disponibles para tu rol.</p>
    </div>
  );
}

export default PanelDeControl;