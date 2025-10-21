import React, { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';

function PerfilDeportivoForm({
  disciplinas,
  categorias,
  initialDisciplina,
  initialCategoria,
  onSave,
  isLoading,
}) {
  const [selectedDisciplina, setSelectedDisciplina] = useState(initialDisciplina || '');
  const [selectedCategoria, setSelectedCategoria] = useState(initialCategoria || '');

  // Sincronizar el estado si las props iniciales cambian
  useEffect(() => {
    setSelectedDisciplina(initialDisciplina || '');
    setSelectedCategoria(initialCategoria || '');
  }, [initialDisciplina, initialCategoria]);

  const handleDisciplinaChange = (e) => {
    setSelectedDisciplina(e.target.value);
    // Reiniciar la categoría cuando cambia la disciplina
    setSelectedCategoria('');
  };

  const handleSaveClick = () => {
    onSave({
      disciplina_id: selectedDisciplina || null,
      categoria_id: selectedCategoria || null,
    });
  };

  const categoriasFiltradas = selectedDisciplina
    ? categorias.filter((c) => c.disciplina == selectedDisciplina)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="disciplina" className="block text-sm font-medium text-gray-700 mb-1">
          Mi Disciplina Principal
        </label>
        <select
          id="disciplina"
          value={selectedDisciplina}
          onChange={handleDisciplinaChange}
          className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="">-- Selecciona tu deporte --</option>
          {disciplinas.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </div>

      {selectedDisciplina && (
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
            Mi Categoría
          </label>
          <select
            id="categoria"
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500"
            disabled={categoriasFiltradas.length === 0}
          >
            <option value="">-- Selecciona tu categoría --</option>
            {categoriasFiltradas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre_categoria}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={handleSaveClick}
          disabled={isLoading}
          className="w-full bg-red-700 hover:bg-red-800 text-white px-5 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 transition-colors duration-200 disabled:bg-gray-400"
        >
          <FaSave />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}

export default PerfilDeportivoForm;