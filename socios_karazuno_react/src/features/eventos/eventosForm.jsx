import { useState, useEffect } from "react";

export default function EventosForm({ onSubmit, initialValues, usuarios }) {
  const [formData, setFormData] = useState({
    tipo: "torneo",
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    lugar: "",
    organizador: "",
    requisito_pago: false,
    costo: 0.0,
  });

  // Convierte ISO con Z a "yyyy-MM-ddTHH:mm" para datetime-local
  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    // Quita Z y recorta a yyyy-MM-ddTHH:mm
    return isoString.replace("Z", "").slice(0, 16);
  };

  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...initialValues,
        fecha_inicio: formatDateForInput(initialValues.fecha_inicio),
        fecha_fin: formatDateForInput(initialValues.fecha_fin),
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

    const payload = {
      ...formData,
      organizador: Number(formData.organizador),
      fecha_inicio: formData.fecha_inicio ? formData.fecha_inicio + ":00" : null,
      fecha_fin: formData.fecha_fin ? formData.fecha_fin + ":00" : null,
    };

    onSubmit(payload);
    
    setFormData({
      tipo: "torneo",
      titulo: "",
      descripcion: "",
      fecha_inicio: "",
      fecha_fin: "",
      lugar: "",
      requisito_pago: false,
      costo: 0.0,
    }); // reset después de guardar
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label>Tipo:</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          className="border px-2 py-1 w-full"
        >
          <option value="torneo">Torneo</option>
          <option value="partido">Partido</option>
          <option value="viaje">Viaje</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label>Título:</label>
        <input
          type="text"
          name="titulo"
          placeholder="Título del evento"
          value={formData.titulo}
          onChange={handleChange}
          className="border px-2 py-1 w-full"
        />
      </div>

      <div>
        <label>Descripción:</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="border px-2 py-1 w-full"
        />
      </div>

      <div>
        <label>Fecha inicio:</label>
        <input
          type="datetime-local"
          name="fecha_inicio"
          value={formData.fecha_inicio}
          onChange={handleChange}
          className="border px-2 py-1 w-full"
        />
      </div>

      <div>
        <label>Fecha fin:</label>
        <input
          type="datetime-local"
          name="fecha_fin"
          value={formData.fecha_fin}
          onChange={handleChange}
          className="border px-2 py-1 w-full"
        />
      </div>

      <div>
        <label>Lugar:</label>
        <input
          type="text"
          name="lugar"
          placeholder="Lugar del evento"
          value={formData.lugar}
          onChange={handleChange}
          className="border px-2 py-1 w-full"
        />
      </div>

      <div>
        <label>Organizador:</label>
        <select
          name="organizador"
          value={formData.organizador}
          onChange={handleChange}
          className="border px-2 py-1 w-full"
        >
          <option value="">-- Seleccionar organizador --</option>
          {usuarios && usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label>Requiere pago:</label>
        <input
          type="checkbox"
          name="requisito_pago"
          checked={formData.requisito_pago}
          onChange={handleChange}
        />
      </div>

      {formData.requisito_pago && (
        <div>
          <label>Costo:</label>
          <input
            type="number"
            step="0.01"
            name="costo"
            value={formData.costo}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
        </div>
      )}

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </form>
  );
}
