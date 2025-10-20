import React from 'react';

function CalendarioSocio() {
  return (
    <section className="bg-white text-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 transition duration-300 transform hover:scale-[1.01] flex flex-col">
      <h2 className="mb-4 font-bold text-2xl text-red-700 border-b pb-2">
        Calendario de Socio
      </h2>
      <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-red-300/50 shadow-inner p-4">
        <span className="text-gray-500 italic text-center">
          Aquí se implementará la visualización interactiva del calendario (eventos, reservas, etc.).
        </span>
      </div>
    </section>
  );
}

export default CalendarioSocio;