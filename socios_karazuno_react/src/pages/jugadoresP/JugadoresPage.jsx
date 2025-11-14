// src/pages/jugadoresP/JugadoresPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/User.Context';
import { getAllSocios } from '../../api/socios.api';
import { getAllDisciplinas } from '../../api/disciplinas.api';
import { getAllCategorias } from '../../api/categorias.api';
import { getSociosPorCategoria } from '../../api/socios.api';
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
  const [categorias, setCategorias] = useState([]);
  const [categoriasParaMostrar, setCategoriasParaMostrar] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingJugadores, setLoadingJugadores] = useState(false);

  // Efecto 1: Cargar categorías
  useEffect(() => {
    async function CargarCategorias() {
      setLoadingCategorias(true);
      try {
        const categoriasData = await getAllCategorias();
        setCategorias(categoriasData);
      } catch (error) {
        toast.error("No se pudieron cargar las categorías.");
      } finally {
        setLoadingCategorias(false);
      }
    }
    CargarCategorias();
  }, []); //

  // Efecto 2: Filtrar categorías por rol
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

  // Manejador click en categoría
  const handleCategoriaClick = async (categoria) => {
    setSelectedCategoria(categoria);
    setLoadingJugadores(true);
    setJugadores([]); 
    try {
      const jugadoresData = await getSociosPorCategoria(categoria.id); //
      
      // (Puedes quitar el console.log si ya no lo necesitas)
      if (jugadoresData.length > 0) {
        console.log("Estructura de un JUGADOR:", jugadoresData[0]);
      }
      
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
    setSearchTerm(""); 
  }; //


  // --- Lógica de filtrado  ---
  // Usamos el campo 'nombre_completo' que vimos en la consola.
  const jugadoresFiltrados = jugadores.filter(jugador => {
    // 1. Obtener el término de búsqueda
    const busqueda = searchTerm.toLowerCase().trim();

    // 2. Si la búsqueda está vacía, mostrar el jugador
    if (busqueda === "") {
      return true;
    }
    
    // 3. Validar que el jugador tenga el campo 'nombre_completo'
    if (!jugador.nombre_completo) {
      return false; 
    }

    // 4. Comprobar si el nombre incluye la búsqueda
    return jugador.nombre_completo.toLowerCase().includes(busqueda);
  });
  

  // --- Renderizado Principal ---
  if (loadingCategorias) {
    return <div className="text-center p-8">Cargando categorías...</div>; //
  }

  // Vista de Categorías
  if (!selectedCategoria) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-2 mb-4">
          <FaThLarge />
          Selecciona una Categoría
        </h1>
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
      </div>
    );
  }

  // Vista de Jugadores (con buscador)
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
            Mostrando {jugadoresFiltrados.length} de {jugadores.length} jugadores
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

          {/* Input de búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          ) : jugadoresFiltrados.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No se encontraron jugadores con "{searchTerm}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jugadoresFiltrados.map(jugador => (
                <JugadorCard key={jugador.usuario} jugador={jugador} /> //
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
