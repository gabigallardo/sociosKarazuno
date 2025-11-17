import { useState, useEffect } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";

export default function UsuariosForm({ onSubmit, initialValues, allRoles = [], allDisciplinas = [], allCategorias = [] }) {
  const [formData, setFormData] = useState({
    tipo_documento: "",
    nro_documento: "",
    nombre: "",
    apellido: "",
    email: "",
    contrasena: "",
    telefono: "",
    fecha_nacimiento: "",
    direccion: "",
    sexo: "",
    activo: true,
    foto_url: "",
    qr_token: "",
    roles: [],
    disciplinas_a_cargo_ids: [],
    categorias_a_cargo_ids: [],
  });

  useEffect(() => {
    if (initialValues) {
      
      setFormData({
        tipo_documento: initialValues.tipo_documento || "",
        nro_documento: initialValues.nro_documento || "",
        nombre: initialValues.nombre || "",
        apellido: initialValues.apellido || "",
        email: initialValues.email || "",
        contrasena: "",
        telefono: initialValues.telefono || "",
        fecha_nacimiento: initialValues.fecha_nacimiento?.split("T")[0] || "",
        direccion: initialValues.direccion || "",
        sexo: initialValues.sexo || "",
        activo: initialValues.activo ?? true,
        foto_url: initialValues.foto_url || "",
        qr_token: initialValues.qr_token || "",
        roles: initialValues.roles_ids || [],
        disciplinas_a_cargo_ids: initialValues.disciplinas_a_cargo_ids || [],
        categorias_a_cargo_ids: initialValues.categorias_a_cargo_ids || [],
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Lógica para mostrar/ocultar las secciones de profesor
  const rolProfesor = allRoles.find(rol => rol.nombre.toLowerCase() === 'profesor');
  const esProfesor = rolProfesor && formData.roles?.includes(rolProfesor.id);

  // Helper para encontrar los nombres de las categorías asignadas
  const categoriasAsignadas = allCategorias.filter(cat =>
    formData.categorias_a_cargo_ids.includes(cat.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <input
        type="text"
        name="tipo_documento"
        placeholder="Tipo de Documento"
        value={formData.tipo_documento}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />
      <input
        type="text"
        name="nro_documento"
        placeholder="Número de Documento"
        value={formData.nro_documento}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />
      <input
        type="text"
        name="apellido"
        placeholder="Apellido"
        value={formData.apellido}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />
      <input
        type="password"
        name="contrasena"
        placeholder="Contraseña (opcional al editar)"
        value={formData.contrasena}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />

      <input
        type="text"
        name="telefono"
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />
      <input
        type="date"
        name="fecha_nacimiento"
        value={formData.fecha_nacimiento}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />
      <input
        type="text"
        name="direccion"
        placeholder="Dirección"
        value={formData.direccion}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />

      <select
        name="sexo"
        value={formData.sexo}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      >
        <option value="">Seleccione sexo</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>

      <input
        type="text"
        name="foto_url"
        placeholder="URL de Foto"
        value={formData.foto_url}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="activo"
          checked={formData.activo}
          onChange={handleChange}
        />
        <span>Activo</span>
      </div>

      <div>
        <label className="font-semibold">Roles:</label>
        <div className="flex flex-col space-y-1 mt-1">
          {allRoles.map((rol) => {
            const esSocio = rol.nombre.toLowerCase() === 'socio';
            const isChecked = formData.roles?.includes(Number(rol.id));
            
            return (
              <label 
                key={rol.id} 
                className={`flex items-center space-x-2 ${esSocio ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  name="roles"
                  value={rol.id}
                  checked={isChecked}
                  disabled={esSocio} // DESHABILITAR si es rol 'socio'
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setFormData((prev) => {
                      const roles = checked
                        ? [...prev.roles, Number(value)]
                        : prev.roles.filter((id) => id !== Number(value));
                      return { ...prev, roles };
                    });
                  }}
                  className={esSocio ? 'cursor-not-allowed' : ''}
                />
                <span className={esSocio ? 'text-gray-500' : ''}>
                  {rol.nombre}
                </span>
                {esSocio && (
                  <span className="text-xs text-gray-500 italic ml-2">
                    (Gestiona desde 'Gestión de Socios')
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {esProfesor && (
        <>
          <hr/>

          {/* Sección para Categorías */}
          <div>
            <label className="font-semibold flex items-center gap-2">
              <FaChalkboardTeacher />
              Categorías Asignadas
            </label>
            <div className="mt-2 p-3 bg-gray-100 border border-gray-200 rounded-md">
              {categoriasAsignadas.length > 0 ? (
                <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                  {categoriasAsignadas.map((cat) => (
                    <li key={cat.id}>
                      <strong>{cat.disciplina_nombre}:</strong> {cat.nombre_categoria}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No tiene categorías asignadas.</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                * Para modificar las asignaciones, utiliza la página de <strong className="font-semibold">"Gestionar Personal / Entrenadores"</strong>.
              </p>
            </div>
          </div>
          <hr/>
        </>
      )}

      <div>
        <label className="block font-semibold">QR Token:</label>
        <input
          type="text"
          name="qr_token"
          value={formData.qr_token}
          readOnly
          className="border px-2 py-1 w-full bg-gray-100 text-gray-600"
        />
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
        Guardar Cambios
      </button>
    </form>
  );
}