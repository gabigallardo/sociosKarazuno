import React, { useState, useEffect } from 'react';

export default function HorarioForm({ onSubmit, initialValues }) {
  const [formData, setFormData] = useState({
    dia_semana: '0',
    hora_inicio: '',
    hora_fin: '',
    lugar: ''
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        dia_semana: initialValues.dia_semana.toString(),
        hora_inicio: initialValues.hora_inicio.slice(0, 5),
        hora_fin: initialValues.hora_fin.slice(0, 5),
        lugar: initialValues.lugar || ''
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Día de la semana</label>
        <select name="dia_semana" value={formData.dia_semana} onChange={handleChange} className="border w-full p-2 rounded">
          <option value="0">Lunes</option>
          <option value="1">Martes</option>
          <option value="2">Miércoles</option>
          <option value="3">Jueves</option>
          <option value="4">Viernes</option>
          <option value="5">Sábado</option>
          <option value="6">Domingo</option>
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label>Hora de inicio</label>
          <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} className="border w-full p-2 rounded" />
        </div>
        <div className="flex-1">
          <label>Hora de fin</label>
          <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} className="border w-full p-2 rounded" />
        </div>
      </div>
      <div>
        <label>Lugar</label>
        <input type="text" name="lugar" value={formData.lugar} onChange={handleChange} placeholder="Ej: Cancha 2" className="border w-full p-2 rounded" />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Guardar</button>
    </form>
  );
}