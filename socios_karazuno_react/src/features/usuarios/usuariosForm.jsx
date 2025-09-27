import { useState, useEffect } from "react";

export default function UsuariosForm({ onSubmit, initialValues }) {
  const [formData, setFormData] = useState({
    tipo_documento: "",
    nro_documento: "",
    nombre: "",
    apellido: "",
    email: "",
    contrasena: "",
  });

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ tipo_documento: "", nro_documento: "", nombre: "", apellido: "", email: "", contrasena: "" }); // reset después de guardar
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
      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
        Guardar
      </button>
    </form>
  );
}
