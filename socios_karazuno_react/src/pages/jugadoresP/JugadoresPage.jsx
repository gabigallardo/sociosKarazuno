// src/pages/jugadoresP/JugadoresPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/User.Context'
import { getAllSocios } from '../../api/socios.api';
import { getAllDisciplinas } from '../../api/disciplinas.api';
import { getAllCategorias } from '../../api/categorias.api';
import { getSociosPorCategoria } from '../../api/socios.api';
import { FaUsers, FaArrowLeft, FaThLarge, FaSpinner } from 'react-icons/fa';
import JugadorCard from '../../features/jugadores/JugadorCard';
import { toast } from 'react-hot-toast';

export default function JugadoresPage() {
  const { user } = useContext(UserContext);
  // --- Estados para la lógica de la página ---
  const [categorias, setCategorias] = useState([]);
  const [categoriasParaMostrar, setCategoriasParaMostrar] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null); // Clave: Guarda la categoría seleccionada
  const [jugadores, setJugadores] = useState([]);

  // --- Estados de carga para una mejor UX ---
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingJugadores, setLoadingJugadores] = useState(false);

  // --- Efecto 1: Cargar todas las categorías una sola vez ---
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
  }, []);

  // --- Efecto 2: Filtrar las categorías a mostrar según el rol del usuario ---
  useEffect(() => {
    if (!user || categorias.length === 0) return;

    const userRoles = user.roles || [];
    const esGestion = userRoles.includes('admin') || userRoles.includes('dirigente') || userRoles.includes('empleado');

    if (esGestion) {
      // Admin/Dirigente/Empleado ven todas las categorías
      setCategoriasParaMostrar(categorias);
    } else if (userRoles.includes('profesor')) {
      // Un profesor solo ve las categorías que tiene a cargo
      const idsACargo = user.categorias_a_cargo_ids || [];
      const categoriasDelProfesor = categorias.filter(c => idsACargo.includes(c.id));
      setCategoriasParaMostrar(categoriasDelProfesor);
    }
  }, [user, categorias]);

  // --- Manejador para cuando se hace clic en una categoría ---
  const handleCategoriaClick = async (categoria) => {
    setSelectedCategoria(categoria);
    setLoadingJugadores(true);
    setJugadores([]); // Limpiar la lista anterior
    try {
      const jugadoresData = await getSociosPorCategoria(categoria.id);
      setJugadores(jugadoresData);
    } catch (error) {
      toast.error(`No se pudieron cargar los jugadores de ${categoria.nombre_categoria}.`);
    } finally {
      setLoadingJugadores(false);
    }
  };

  // --- Manejador para volver a la lista de categorías ---
  const handleVolver = () => {
    setSelectedCategoria(null);
    setJugadores([]);
  };

  // --- Renderizado Principal ---
  if (loadingCategorias) {
    return <div className="text-center p-8">Cargando categorías...</div>;
  }

  // Si NO hay una categoría seleccionada, mostramos la lista de categorías
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

  // Si SÍ hay una categoría seleccionada, mostramos la parrilla de jugadores
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header con botón para volver */}
      <div className="mb-6 flex items-center justify-between">
        <div className='flex-grow'>
          <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-2">
            <FaUsers />
            Jugadores de {selectedCategoria.disciplina_nombre} - {selectedCategoria.nombre_categoria}
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {jugadores.length} jugadores
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

      {/* Contenido: Loader o Parrilla de Jugadores */}
      {loadingJugadores ? (
        <div className="flex justify-center items-center p-16">
          <FaSpinner className="animate-spin text-4xl text-red-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {jugadores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jugadores.map(jugador => (
                <JugadorCard key={jugador.usuario} jugador={jugador} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay jugadores asignados a esta categoría.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}