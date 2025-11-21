import React from 'react';
import { FaEdit, FaTrashAlt, FaUser, FaIdCard, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

export default function UsuariosList({ usuarios, onEdit, onDelete, onItemClick }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* --- Header --- */}
          <thead>
            <tr className="bg-gray-50/50">
              <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Contacto
              </th>
              <th scope="col" className="hidden lg:table-cell px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Documento
              </th>
              <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Roles
              </th>
              <th scope="col" className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          {/* --- Body --- */}
          <tbody className="bg-white divide-y divide-gray-100">
            {usuarios.map((usuario) => (
              <tr 
                key={usuario.id} 
                onClick={() => onItemClick && onItemClick(usuario)}
                className="group hover:bg-red-50/40 transition-all duration-200 cursor-pointer"
              >
                {/* 1. Columna Usuario (Foto + Nombre) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* Avatar con borde que cambia de color al hover */}
                    <div className="flex-shrink-0 h-11 w-11 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-red-200 transition-colors bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                       {usuario.foto_url ? (
                          <img className="h-full w-full object-cover" src={usuario.foto_url} alt="" />
                       ) : (
                          <FaUser className="text-lg" />
                       )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                        {usuario.nombre} {usuario.apellido}
                      </div>
                      {/* Email visible solo en móvil aquí debajo */}
                      <div className="text-xs text-gray-500 md:hidden mt-0.5">
                        {usuario.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Columna Contacto (Email) - Desktop Only */}
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg w-fit border border-gray-100">
                    <FaEnvelope className="text-gray-400 text-xs" /> 
                    <span>{usuario.email}</span>
                  </div>
                </td>

                {/* 3. Columna Documento - Large Desktop Only */}
                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <FaIdCard className="text-gray-300" /> 
                    <span className="font-mono">{usuario.nro_documento || "---"}</span>
                  </div>
                </td>

                {/* 4. Columna Roles */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1.5">
                    {usuario.roles && usuario.roles.length > 0 ? (
                      usuario.roles.map((rol) => (
                        <span key={rol} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200 uppercase tracking-wide">
                          <FaShieldAlt className="text-[10px] opacity-70" /> {rol}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic px-2 py-1 bg-gray-50 rounded border border-gray-100">Sin permisos</span>
                    )}
                  </div>
                </td>

                {/* 5. Columna Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(e, usuario); }}
                      className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm border border-transparent hover:border-indigo-100"
                      title="Editar usuario"
                    >
                      <FaEdit className="text-lg" />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(e, usuario.id); }}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm border border-transparent hover:border-red-100"
                      title="Eliminar usuario"
                    >
                      <FaTrashAlt className="text-lg" />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Estado vacío */}
      {usuarios.length === 0 && (
         <div className="py-12 text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <FaUser className="text-4xl mb-3 opacity-20" />
            <p className="text-sm">No hay usuarios registrados.</p>
         </div>
      )}
    </div>
  );
}