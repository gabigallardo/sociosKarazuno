import React from "react";
import Layout from "../layouts/Layout";

function SociosPage() {
  return (
    <Layout>
      {/* Fila superior: credencial + calendario */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Credencial */}
        <section className="bg-red-700 text-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold uppercase tracking-wide">Credencial de socio</h2>
            <button className="text-sm bg-white text-red-700 px-2 py-1 rounded flex items-center gap-1">
              PDF
              <span className="material-icons">download</span>
            </button>
          </div>

          {/* Contenido credencial */}
          <div className="grid grid-cols-3 gap-2 bg-red-600 p-3 rounded">
            <div className="bg-gray-600 h-24 flex items-center justify-center">Foto perfil</div>
            <div className="bg-gray-600 h-24 flex items-center justify-center">qr</div>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <div className="bg-gray-600 h-12 flex items-center justify-center">Gabriel Gallardo</div>
              <div className="bg-gray-600 h-12 flex items-center justify-center">Cuota al día</div>
            </div>
          </div>
        </section>

        {/* Calendario */}
        <section className="bg-red-700 text-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <h2 className="mb-3 font-bold">Calendario de socio</h2>
          <div className="bg-white w-64 h-40 rounded flex items-center justify-center">
            <span className="text-black">[aquí va un calendario]</span>
          </div>
        </section>
      </div>

      {/* Eventos */}
      <section className="bg-red-700 text-white p-4 rounded-lg shadow h-48">
        <h2 className="font-bold mb-2">Próximos eventos del club:</h2>
        <div className="bg-red-600 h-full rounded"></div>
      </section>
    </Layout>
  );
}

export default SociosPage;