export default function ListaEventos({ eventos, onEdit, onDelete }) {
  return (
    <table className="mt-6 border w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2">Tipo</th>
          <th className="border px-4 py-2">Título</th>
          <th className="border px-4 py-2">Fecha</th>
          <th className="border px-4 py-2">Lugar</th>
          <th className="border px-4 py-2">Organizador</th>
          <th className="border px-4 py-2">Pago</th>
          <th className="border px-4 py-2">Costo</th>
          <th className="border px-4 py-2">Descripción</th>
          <th className="border px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {eventos.map((evento) => (
          <tr key={evento.id}>
            <td className="border px-4 py-2">{evento.tipo}</td>
            <td className="border px-4 py-2">{evento.titulo}</td>
            <td className="border px-4 py-2">
              {new Date(evento.fecha_inicio).toLocaleDateString()} -{" "}
              {new Date(evento.fecha_fin).toLocaleDateString()}
            </td>
            <td className="border px-4 py-2">{evento.lugar}</td>
            <td className="border px-4 py-2">
              {evento.organizador?.nombre || "Sin asignar"}
            </td>
            <td className="border px-4 py-2">
              {evento.requisito_pago ? "Sí" : "No"}
            </td>
            <td className="border px-4 py-2">
              {evento.costo > 0 ? `$${evento.costo}` : "-"}
            </td>
            <td className="border px-4 py-2">{evento.descripcion}</td>
            <td className="border px-4 py-2 space-x-2">
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => onEdit(evento)}
              >
                Editar
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => onDelete(evento.id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
