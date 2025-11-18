import React from "react";
import CalendarioSocio from "../components/CalendarioSocio/CalendarioSocio";

export default function MiCalendarioPage() {
  return (
    <div className="p-6 h-screen flex flex-col bg-gray-50">
        <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-800">Mi Calendario</h1>
            <p className="text-gray-500 mt-1">Gestiona tus partidos, entrenamientos y eventos del club.</p>
        </div>

        <div className="flex-1 min-h-0 pb-6">
            <CalendarioSocio compacto={false} />
        </div>
    </div>
  );
}