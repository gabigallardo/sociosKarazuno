// src/pages/jugadoresP/JugadoresPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/User.Context';
import { getAllSocios, getSociosPorCategoria } from '../../api/socios.api';
import { getAllDisciplinas } from '../../api/disciplinas.api';
import { getAllCategorias } from '../../api/categorias.api';
import { 
  FaUsers, 
  FaArrowLeft, 
  FaThLarge, 
  FaSpinner, 
  FaSearch
} from 'react-icons/fa';
import JugadorCard from '../../features/jugadores/JugadorCard';
import { toast } from 'react-hot-toast';

export default function JugadoresPage() {
  const { user } = useContext(UserContext);
  
  // Estados de datos
  const [categorias, setCategorias] = useState([]);
  const [categoriasParaMostrar, setCategoriasParaMostrar] = useState([]);
  const [allJugadores, setAllJugadores] = useState([]); // Todos los jugadores para búsqueda global
  const [jugadores, setJugadores] = useState([]); // Jugadores de la categoría seleccionada

  // Estados de UI y búsqueda
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState(""); // Buscador principal
  const [categorySearchTerm, setCategorySearchTerm] = useState(""); // Buscador dentro de categoría
  
  // Estados de carga
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingAllJugadores, setLoadingAllJugadores] = useState(true);
  const [loadingJugadores, setLoadingJugadores] = useState(false); // Carga de jugadores de UNA categoría

  // Efecto 1: Cargar datos globales (Categorías y TODOS los jugadores)
  useEffect(() => {
    async function CargarDatosGlobales() {
      setLoadingCategorias(true);
      setLoadingAllJugadores(true);
      try {
        // Cargamos categorías y todos los socios en paralelo
        const [categoriasData, allSociosData] = await Promise.all([
          getAllCategorias(),
          getAllSocios() 
        ]);
        
        setCategorias(categoriasData);
        setAllJugadores(allSociosData);

      } catch (error) {
        toast.error("No se pudieron cargar los datos iniciales.");
      } finally {
        setLoadingCategorias(false);
        setLoadingAllJugadores(false);
      }
    }
    CargarDatosGlobales();
  }, []); //

  // Efecto 2: Filtrar categorías por rol (sin cambios)
  useEffect(() => {
    if (!user || categorias.length === 0) return;
    const userRoles = user.roles || [];
    const esGestion = userRoles.includes('admin') || userRoles.includes('dirigente') || userRoles.includes('empleado');
    if (esGestion) {
      setCategoriasParaMostrar(categorias);
    } else if (userRoles.includes('profesor')) {
      const idsACargo = user.categorias_a_cargo_ids || [];
      const categoriasDelProfesor = categorias.filter(c => idsACargo.includes(c.id));
      setCategoriasParaMostrar(categoriasDelProfesor);
    }
  }, [user, categorias]); //

  // Manejador click en categoría (sin cambios en la lógica de fetch)
  const handleCategoriaClick = async (categoria) => {
    setSelectedCategoria(categoria);
    setLoadingJugadores(true);
    setJugadores([]); 
    try {
      const jugadoresData = await getSociosPorCategoria(categoria.id); //
      setJugadores(jugadoresData); //
    } catch (error) {
      toast.error(`No se pudieron cargar los jugadores de ${categoria.nombre_categoria}.`);
    } finally {
      setLoadingJugadores(false);
    }
  };

  // Manejador para volver
  const handleVolver = () => {
    setSelectedCategoria(null);
    setJugadores([]);
    setGlobalSearchTerm(""); 
    setCategorySearchTerm(""); // Limpiar también el buscador de categoría
  }; //


  // --- Lógica de filtrado GLOBAL ---
  const globalJugadoresFiltrados = allJugadores.filter(jugador => {
    const busqueda = globalSearchTerm.toLowerCase().trim();
    if (busqueda === "") {
      // Si la búsqueda está vacía, no mostramos NINGÚN jugador en esta lista
      return false; 
    }
    if (!jugador.nombre_completo) {
      return false; 
    }
    return jugador.nombre_completo.toLowerCase().includes(busqueda);
  });

  // --- Lógica de filtrado POR CATEGORÍA ---
  const categoryJugadoresFiltrados = jugadores.filter(jugador => {
    const busqueda = categorySearchTerm.toLowerCase().trim();
    if (busqueda === "") {
      return true;
    }
    if (!jugador.nombre_completo) {
      return false; 
    }
    return jugador.nombre_completo.toLowerCase().includes(busqueda);
  });
  

  // --- Renderizado Principal ---
  if (loadingCategorias || loadingAllJugadores) {
    return (
      <div className="flex justify-center items-center p-16">
        <FaSpinner className="animate-spin text-4xl text-red-600" />
        <span className="ml-4 text-xl text-gray-700">Cargando datos...</span>
      </div>
    );
  }

  // Vista de Categorías (con buscador GLOBAL)
  if (!selectedCategoria) {
    const isSearching = globalSearchTerm.trim() !== "";

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-2 mb-4">
          <FaUsers />
          Jugadores
        </h1>
        
        {/* BUSCADOR GLOBAL (AHORA ESTÁ PRIMERO) */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar jugador por nombre (en todo el club)..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3.5 text-gray-400">
            <FaSearch />
          </span>
        </div>

        {/* CONTENIDO CONDICIONAL: RESULTADOS DE BÚSQUEDA O FILTRO DE EQUIPOS */}
        {isSearching ? (
          // --- MODO BÚSQUEDA (Resultados Globales) ---
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Resultados de la búsqueda</h2>
            {globalJugadoresFiltrados.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No se encontraron jugadores con "{globalSearchTerm}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalJugadoresFiltrados.map(jugador => (
                  <JugadorCard key={jugador.usuario} jugador={jugador} /> 
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Filtrar por categoría</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoriasParaMostrar.length > 0 ? (
                categoriasParaMostrar.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoriaClick(cat)}
                    className="p-4 bg-white rounded-lg shadow border border-gray-200 cursor-pointer transition-all hover:shadow-xl hover:border-red-500 hover:-translate-y-1"
                  >
                    <p className="font-bold text-lg text-red-700">{cat.disciplina_nombre}</p>
                    <p className="text-gray-800">{cat.nombre_categoria}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 mt-8">No tienes categorías asignadas para visualizar.</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Vista de Jugadores (DE UNA CATEGORÍA)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className='flex-grow'>
          <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-2">
            <FaUsers />
            Jugadores de {selectedCategoria.disciplina_nombre} - {selectedCategoria.nombre_categoria}
          </h1>
          <p className="text-gray-600 mt-1">
            {/* Actualizado para usar el filtro de categoría */}
            Mostrando {categoryJugadoresFiltrados.length} de {jugadores.length} jugadores
          </p>
        </div>
        <button
          onClick={handleVolver}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition"
        >
          <FaArrowLeft />
          Volver
        </button>
      </div>

      {/* Contenido */}
      {loadingJugadores ? (
        <div className="flex justify-center items-center p-16">
          <FaSpinner className="animate-spin text-4xl text-red-600" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Input de búsqueda DE CATEGORÍA */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre (en esta categoría)..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-3.5 text-gray-400">
              <FaSearch />
            </span>
          </div>
          
          {/* Lógica de renderizado */}
          {jugadores.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay jugadores asignados a esta categoría.</p>
            </div>
          // Actualizado para usar el filtro de categoría
          ) : categoryJugadoresFiltrados.length === 0 ? ( 
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No se encontraron jugadores con "{categorySearchTerm}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Actualizado para usar el filtro de categoría */}
              {categoryJugadoresFiltrados.map(jugador => (
                <JugadorCard key={jugador.usuario} jugador={jugador} /> //
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}