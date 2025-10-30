import { FaCheckCircle, FaTimesCircle, FaEye, FaUserSlash } from "react-icons/fa";

export default function ListaSocios({ socios, onViewDetail, onInactivar  }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre Completo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nivel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cuotas al día
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Disciplina
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {socios.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-500 italic">
                No hay socios registrados
              </td>
            </tr>
          ) : (
            socios.map((socio) => (
              <tr key={socio.usuario} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {socio.usuario}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {socio.nombre_completo || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {socio.email || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {socio.estado === "activo" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      <FaTimesCircle className="mr-1" />
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {socio.nivel_socio_info ? (
                    <span className="font-medium text-red-700">
                      Nivel {socio.nivel_socio_info.nivel}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Sin nivel</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {socio.cuota_al_dia ? (
                    <span className="text-green-600 font-semibold flex items-center">
                      <FaCheckCircle className="mr-1" /> Sí
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold flex items-center">
                      <FaTimesCircle className="mr-1" /> No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {socio.disciplina_nombre || <span className="text-gray-400 italic">Sin asignar</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onViewDetail(socio)} // Pasar el objeto socio completo es más flexible
                    className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-blue-700 transition"
                  >
                    <FaEye className="mr-1" />
                    Ver Detalle
                  </button>
                  
                  {/* Botón de inactivar condicional */}
                  {socio.estado === "activo" && (
                    <button
                      onClick={() => onInactivar(socio)} // Pasar el objeto socio completo
                      className="inline-flex items-center bg-yellow-500 text-white px-3 py-1 rounded-md shadow-sm hover:bg-yellow-600 transition"
                    >
                      <FaUserSlash className="mr-1" />
                      Inactivar
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}