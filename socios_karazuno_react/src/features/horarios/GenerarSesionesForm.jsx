import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, addMonths } from 'date-fns';

export default function GenerarSesionesForm({ onSubmit, onClose }) {
  const today = new Date();
  const [fechaInicio, setFechaInicio] = useState(format(today, 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(addDays(today, 6), 'yyyy-MM-dd'));

  const setPreset = (preset) => {
    let start, end;
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
    switch (preset) {
      case 'semana':
        start = weekStart;
        end = endOfWeek(weekStart, { weekStartsOn: 1 });
        break;
      case '15dias':
        start = today;
        end = addDays(today, 14);
        break;
      case 'mes':
        start = today;
        end = addMonths(today, 1);
        break;
      default:
        return;
    }
    setFechaInicio(format(start, 'yyyy-MM-dd'));
    setFechaFin(format(end, 'yyyy-MM-dd'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(fechaInicio, fechaFin);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Definir Período de Generación</h3>
      
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setPreset('semana')} className="bg-gray-200 text-sm px-3 py-1 rounded-full">Próxima Semana</button>
        <button type="button" onClick={() => setPreset('15dias')} className="bg-gray-200 text-sm px-3 py-1 rounded-full">Próximos 15 días</button>
        <button type="button" onClick={() => setPreset('mes')} className="bg-gray-200 text-sm px-3 py-1 rounded-full">Próximo Mes</button>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Desde</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border w-full p-2 rounded mt-1" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Hasta</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="border w-full p-2 rounded mt-1" />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded-lg">Cancelar</button>
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg">Generar Sesiones</button>
      </div>
    </form>
  );
}