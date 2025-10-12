// src/features/usuarios/listaUsuarios.jsx

export default function UsuariosList({ usuarios, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{`${usuario.nombre} ${usuario.apellido}`}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.nro_documento}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* Mostramos los roles como badges para que se vean mejor */}
                <div className="flex flex-wrap gap-1">
                  {usuario.roles && usuario.roles.length > 0 ? (
                    usuario.roles.map((rol) => (
                      <span key={rol} className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {rol}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">Sin roles</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(usuario)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded-md shadow-sm hover:bg-yellow-500 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(usuario.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-red-700 transition"
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}