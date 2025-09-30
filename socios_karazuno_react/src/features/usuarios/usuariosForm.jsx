import { useState, useEffect, act } from "react";

export default function UsuariosForm({ onSubmit, initialValues }) {
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
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...initialValues,
        fecha_nacimiento: initialValues.fecha_nacimiento?.split("T")[0] || "", // Para input date
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ tipo_documento: "", nro_documento: "", nombre: "", apellido: "", email: "", contrasena: "", telefono: "", fecha_nacimiento: "", direccion: "", sexo: "", activo: false, foto_url: "" }); // reset después de guardar
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
        placeholder="Contraseña"
        value={formData.contrasena}
        onChange={handleChange}
        className="border px-2 py-1 w-full"
      />

      <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} className="border px-2 py-1 w-full" />
      <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="border px-2 py-1 w-full" />
      <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} className="border px-2 py-1 w-full" />

      <select name="sexo" value={formData.sexo} onChange={handleChange} className="border px-2 py-1 w-full">
        <option value="">Seleccione sexo</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>

      <input type="text" name="foto_url" placeholder="URL de Foto" value={formData.foto_url} onChange={handleChange} className="border px-2 py-1 w-full" />
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
        <span>Activo</span>
      </label>

      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
        Guardar
      </button>
    </form>
  );
}
