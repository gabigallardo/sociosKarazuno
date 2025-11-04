// src/pages/jugadoresP/JugadoresPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllSocios } from '../../api/socios.api';
import { getAllDisciplinas } from '../../api/disciplinas.api';
import { getAllCategorias } from '../../api/categorias.api';
import { FaUsers, FaFilter } from 'react-icons/fa';
import JugadorCard from '../../features/jugadores/JugadorCard';
import { toast } from 'react-hot-toast';

export default function JugadoresPage() {
  const [jugadores, setJugadores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function CargarDatos() {
      setLoading(true);
      try {
        const [sociosData, disciplinasData, categoriasData] = await Promise.all([
          getAllSocios(), // Obtenemos todos los socios
          getAllDisciplinas(),
          getAllCategorias(),
        ]);
        // Filtramos para quedarnos solo con socios que tienen disciplina asignada
        setJugadores(sociosData.filter(s => s.disciplina));
        setDisciplinas(disciplinasData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error cargando datos para el panel de jugadores:", error);
        toast.error("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    }
    CargarDatos();
  }, []);

  // Filtramos las categorías disponibles según la disciplina seleccionada
  const categoriasFiltradas = filtroDisciplina
    ? categorias.filter(c => c.disciplina.toString() === filtroDisciplina)
    : [];

  // Filtramos los jugadores según los filtros seleccionados
  const jugadoresFiltrados = jugadores.filter(j => {
    const matchDisciplina = !filtroDisciplina || j.disciplina.toString() === filtroDisciplina;
    const matchCategoria = !filtroCategoria || j.categoria.toString() === filtroCategoria;
    return matchDisciplina && matchCategoria;
  });

  // Agrupamos los jugadores filtrados por su categoría para mostrarlos
  const jugadoresAgrupados = jugadoresFiltrados.reduce((acc, jugador) => {
    const categoriaNombre = jugador.categoria_nombre || 'Sin Categoría';
    if (!acc[categoriaNombre]) {
      acc[categoriaNombre] = [];
    }
    acc[categoriaNombre].push(jugador);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center p-8">Cargando jugadores...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-2">
          <FaUsers />
          Panel de Jugadores
        </h1>
        <p className="text-gray-600 mt-1">
          Visualiza los socios organizados por deporte y categoría.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6 flex items-center gap-4">
        <FaFilter className="text-xl text-gray-500" />
        <div className="flex-grow">
          <label htmlFor="disciplina" className="block text-sm font-medium text-gray-700">Disciplina</label>
          <select
            id="disciplina"
            value={filtroDisciplina}
            onChange={(e) => {
              setFiltroDisciplina(e.target.value);
              setFiltroCategoria(''); // Reseteamos el filtro de categoría
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
          >
            <option value="">Todas las disciplinas</option>
            {disciplinas.map(d => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex-grow">
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            id="categoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            disabled={!filtroDisciplina}
          >
            <option value="">Todas las categorías</option>
            {categoriasFiltradas.map(c => (
              <option key={c.id} value={c.id}>{c.nombre_categoria}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Jugadores Agrupados */}
      <div className="space-y-6">
        {Object.keys(jugadoresAgrupados).length > 0 ? (
          Object.entries(jugadoresAgrupados).map(([categoria, listaJugadores]) => (
            <div key={categoria}>
              <h2 className="text-xl font-bold text-red-700 border-b-2 border-red-200 pb-2 mb-4">
                {categoria} ({listaJugadores.length} jugadores)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listaJugadores.map(jugador => (
                  <JugadorCard key={jugador.usuario} jugador={jugador} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay jugadores que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}