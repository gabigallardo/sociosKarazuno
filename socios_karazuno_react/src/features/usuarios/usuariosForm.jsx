import { useState, useEffect, act } from "react";

export default function UsuariosForm({ onSubmit, initialValues, allRoles = [] }) {
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
    roles: [], // 👈 inicializado
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        tipo_documento: initialValues.tipo_documento || "",
        nro_documento: initialValues.nro_documento || "",
        nombre: initialValues.nombre || "",
        apellido: initialValues.apellido || "",
        email: initialValues.email || "",
        contrasena: "", // ⚠️ no se rellena la contraseña por seguridad
        telefono: initialValues.telefono || "",
        fecha_nacimiento: initialValues.fecha_nacimiento?.split("T")[0] || "",
        direccion: initialValues.direccion || "",
        sexo: initialValues.sexo || "",
        activo: initialValues.activo ?? true,
        foto_url: initialValues.foto_url || "",
        qr_token: initialValues.qr_token || "",
        roles: initialValues.roles || [], // 👈 asegura array
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
          {allRoles.map((rol) => (
            <label key={rol.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="roles"
                value={rol.id}
                checked={formData.roles?.includes(Number(rol.id))}
                onChange={(e) => {
                  const { checked, value } = e.target;
                  setFormData((prev) => {
                    const roles = checked
                      ? [...prev.roles, Number(value)]
                      : prev.roles.filter((id) => id !== Number(value));
                    return { ...prev, roles };
                  });
                }}
              />
              <span>{rol.nombre}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Campo QR Token (solo lectura) */}
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

      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
        Guardar
      </button>
    </form>
  );
}
