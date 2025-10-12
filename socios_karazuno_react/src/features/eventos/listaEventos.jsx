export default function ListaEventos({ eventos, onEdit, onDelete, puedeGestionar }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizador</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
            {/* La columna de acciones solo se renderiza si hay permisos */}
            {puedeGestionar && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {eventos.map((evento) => (
            <tr key={evento.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{evento.tipo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{evento.titulo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(evento.fecha_inicio).toLocaleDateString()} - {new Date(evento.fecha_fin).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evento.lugar}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evento.organizador?.nombre || "N/A"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evento.costo > 0 ? `$${evento.costo}` : "Gratis"}</td>
              
              {/* Los botones de acción solo se renderizan si hay permisos */}
              {puedeGestionar && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md shadow-sm hover:bg-blue-600 transition"
                    onClick={() => onEdit(evento)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-red-700 transition"
                    onClick={() => onDelete(evento.id)}
                  >
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}