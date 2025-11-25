import React, { useState, useMemo } from 'react';
import { FaCheckCircle, FaTimesCircle, FaEye, FaUserSlash, FaToggleOn, FaFilePdf, FaSearch, FaUser } from "react-icons/fa";
import { generarReportePDF } from "../../utils/pdfUtils"; 
import PlantillaReporte from "../../components/Reporte/PlantillaReporte";

export default function ListaSocios({ socios, onViewDetail, onInactivar, onActivar }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrado en tiempo real
  const sociosFiltrados = useMemo(() => {
    return socios.filter(socio => 
      socio.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.usuario?.toString().includes(searchTerm)
    );
  }, [socios, searchTerm]);

  const handleExportarPDF = () => {
    generarReportePDF('plantilla-reporte-socios-hidden', 'Reporte_Estado_Socios.pdf');
  };

  // Componente auxiliar para el Avatar (reutilizable en móvil y escritorio)
  const SocioAvatar = ({ socio }) => (
    <div className="flex-shrink-0 h-11 w-11 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
      {socio.foto_url ? (
        <img 
          className="h-full w-full object-cover" 
          src={socio.foto_url} 
          alt={`Foto de ${socio.nombre_completo}`} 
        />
      ) : (
        <span className="font-bold text-gray-500 text-lg">
           {/* Si tiene nombre mostramos la inicial, si no, el ícono */}
           {socio.nombre_completo ? socio.nombre_completo.charAt(0).toUpperCase() : <FaUser />}
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Barra de Herramientas */}
      <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, email o ID..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Botón Exportar */}
        <button
          onClick={handleExportarPDF}
          className="flex items-center gap-2 text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-semibold transition w-full sm:w-auto justify-center"
        >
          <FaFilePdf />
          <span>Exportar Reporte</span>
        </button>
      </div>

      {/* --- VISTA DE ESCRITORIO (TABLA) --- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Socio</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nivel & Disciplina</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cuota</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sociosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                  No se encontraron socios que coincidan con "{searchTerm}"
                </td>
              </tr>
            ) : (
              sociosFiltrados.map((socio) => (
                <tr key={socio.usuario} className="hover:bg-gray-50 transition-colors group">
                  {/* Datos Personales con Foto */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {/* Aquí usamos el componente de Avatar */}
                      <SocioAvatar socio={socio} />
                      
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                          {socio.nombre_completo || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">{socio.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EstadoBadge estado={socio.estado} />
                  </td>

                  {/* Nivel y Disciplina */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {socio.nivel_socio_info ? `Nivel ${socio.nivel_socio_info.nivel}` : <span className="text-gray-400">Sin nivel</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {socio.disciplina_nombre || "Sin disciplina"}
                    </div>
                  </td>

                  {/* Estado Cuota */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {socio.cuota_al_dia ? (
                      <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                        <FaCheckCircle className="mr-1.5 h-3 w-3" /> Al día
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                        <FaTimesCircle className="mr-1.5 h-3 w-3" /> Pendiente
                      </span>
                    )}
                  </td>

                  {/* Botones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => onViewDetail(socio)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition tooltip-btn"
                        title="Ver detalles"
                      >
                        <FaEye size={16} />
                      </button>

                      {socio.estado === "activo" ? (
                        <button 
                          onClick={() => onInactivar(socio)}
                          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Inactivar socio"
                        >
                          <FaUserSlash size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => onActivar(socio)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Activar socio"
                        >
                          <FaToggleOn size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- VISTA MÓVIL (TARJETAS) --- */}
      <div className="md:hidden bg-gray-50 p-4 space-y-4">
        {sociosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500 italic">No se encontraron socios</p>
        ) : (
          sociosFiltrados.map((socio) => (
            <div key={socio.usuario} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar reutilizado también en móvil */}
                  <SocioAvatar socio={socio} />
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{socio.nombre_completo}</h3>
                    <p className="text-xs text-gray-500">{socio.email}</p>
                  </div>
                </div>
                <EstadoBadge estado={socio.estado} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Nivel</p>
                  <p className="font-medium text-gray-700">
                    {socio.nivel_socio_info?.nivel || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Cuota</p>
                  <p className={`font-medium ${socio.cuota_al_dia ? 'text-green-600' : 'text-red-600'}`}>
                    {socio.cuota_al_dia ? 'Al día' : 'Pendiente'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => onViewDetail(socio)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex justify-center items-center gap-2"
                >
                  <FaEye /> Detalles
                </button>
                {socio.estado === "activo" ? (
                  <button 
                    onClick={() => onInactivar(socio)}
                    className="flex-1 bg-amber-50 text-amber-700 border border-amber-100 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition flex justify-center items-center gap-2"
                  >
                    <FaUserSlash /> Inactivar
                  </button>
                ) : (
                  <button 
                    onClick={() => onActivar(socio)}
                    className="flex-1 bg-green-50 text-green-700 border border-green-100 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition flex justify-center items-center gap-2"
                  >
                    <FaToggleOn /> Activar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Elemento oculto para PDF */}
      <div className="absolute -left-[9999px] top-0">
        <PlantillaReporte 
          id="plantilla-reporte-socios-hidden" 
          socios={socios} 
          usuarioActivo="Administrador" 
        />
      </div>
    </div>
  );
}

// Componente auxiliar para Badge de estado
const EstadoBadge = ({ estado }) => {
  const isActivo = estado === "activo";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      isActivo 
        ? "bg-green-50 text-green-700 border-green-100" 
        : "bg-gray-50 text-gray-600 border-gray-200"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        isActivo ? "bg-green-500" : "bg-gray-400"
      }`}></span>
      {isActivo ? "Activo" : "Inactivo"}
    </span>
  );
};