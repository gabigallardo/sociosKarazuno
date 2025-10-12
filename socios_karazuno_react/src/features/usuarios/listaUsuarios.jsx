export default function UsuariosList({ usuarios, onEdit, onDelete }) {
  return (
    <table className="mt-6 border w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-2">ID</th>
          <th className="border px-2">Nombre</th>
          <th className="border px-2">Email</th>
          <th className="border px-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id}>
            <td className="border px-2">{u.id}</td>
            <td className="border px-2">{u.nombre}</td>
            <td className="border px-2">{u.email}</td>
            <td className="border px-2 space-x-2">
              <button
                onClick={() => onEdit(u)}
                className="bg-yellow-400 px-2 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(u.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Borrar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
