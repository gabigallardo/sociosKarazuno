import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/User.Context';
import { getAllDisciplinas } from '../api/disciplinas.api';
import { getAllCategorias } from '../api/categorias.api';
import { actualizarPerfilDeportivo } from '../api/usuarios.api';
import { toast } from 'react-hot-toast';
import { FaUser, FaSave } from 'react-icons/fa';

export default function MiPerfilPage() {
  const { user, refreshUser } = useContext(UserContext);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [disciplinasData, categoriasData] = await Promise.all([
          getAllDisciplinas(),
          getAllCategorias(),
        ]);
        setDisciplinas(disciplinasData);
        setCategorias(categoriasData);

        // Pre-seleccionar valores del usuario
        if (user?.socio_info) {
          setSelectedDisciplina(user.socio_info.disciplina || '');
          setSelectedCategoria(user.socio_info.categoria || '');
        }
      } catch (error) {
        console.error('Error cargando datos para el perfil', error);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await actualizarPerfilDeportivo({
        disciplina_id: selectedDisciplina || null,
        categoria_id: selectedCategoria || null,
      });
      await refreshUser();
      toast.success('¡Perfil actualizado con éxito!');
    } catch (error) {
      toast.error('Hubo un error al guardar tu perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const categoriasFiltradas = selectedDisciplina
    ? categorias.filter((c) => c.disciplina == selectedDisciplina)
    : [];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-3 mb-6">
        <FaUser />
        Mi Perfil Deportivo
      </h1>
      <div className="space-y-6">
        <div>
          <label htmlFor="disciplina" className="block text-sm font-medium text-gray-700 mb-1">
            Mi Disciplina Principal
          </label>
          <select
            id="disciplina"
            value={selectedDisciplina}
            onChange={(e) => {
              setSelectedDisciplina(e.target.value);
              setSelectedCategoria(''); 
            }}
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
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-red-700 hover:bg-red-800 text-white px-5 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <FaSave />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}