import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../contexts/User.Context';
import { getAllSocios, getSociosPorCategoria } from '../../api/socios.api';
import { getAllCategorias } from '../../api/categorias.api';
import { 
  FaUsers, 
  FaArrowLeft, 
  FaSpinner, 
  FaSearch,
  FaQrcode,
  FaTimes
} from 'react-icons/fa';
import JugadorCard from '../../features/jugadores/JugadorCard';
import { toast } from 'react-hot-toast';

export default function JugadoresPage() {
  const { user } = useContext(UserContext);
  
  // Referencias para mantener el foco siempre listo para el escáner
  const globalInputRef = useRef(null);
  const categoryInputRef = useRef(null);

  // Estados de datos
  const [categorias, setCategorias] = useState([]);
  const [categoriasParaMostrar, setCategoriasParaMostrar] = useState([]);
  const [allJugadores, setAllJugadores] = useState([]); 
  const [jugadores, setJugadores] = useState([]); 

  // Estados de UI y búsqueda
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState(""); 
  const [categorySearchTerm, setCategorySearchTerm] = useState(""); 
  
  // Estados de carga
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingAllJugadores, setLoadingAllJugadores] = useState(true);
  const [loadingJugadores, setLoadingJugadores] = useState(false); 

  // --- Carga Inicial ---
  useEffect(() => {
    async function CargarDatosGlobales() {
      setLoadingCategorias(true);
      setLoadingAllJugadores(true);
      try {
        const [categoriasData, allSociosData] = await Promise.all([
          getAllCategorias(),
          getAllSocios() 
        ]);
        setCategorias(categoriasData);
        setAllJugadores(allSociosData);
      } catch (error) {
        toast.error("Error al cargar datos iniciales.");
      } finally {
        setLoadingCategorias(false);
        setLoadingAllJugadores(false);
      }
    }
    CargarDatosGlobales();
  }, []);

  // --- Filtrado de Roles ---
  useEffect(() => {
    if (!user || categorias.length === 0) return;
    const userRoles = user.roles || [];
    const esGestion = userRoles.includes('admin') || userRoles.includes('dirigente') || userRoles.includes('empleado');
    
    if (esGestion) {
      setCategoriasParaMostrar(categorias);
    } else if (userRoles.includes('profesor')) {
      const idsACargo = user.categorias_a_cargo_ids || [];
      setCategoriasParaMostrar(categorias.filter(c => idsACargo.includes(c.id)));
    }
  }, [user, categorias]);

  // --- Auto-Foco Inteligente ---
  useEffect(() => {
    // Al cargar la página o volver, enfocar el buscador global para estar listo para escanear
    if (!loadingCategorias && !loadingAllJugadores && !selectedCategoria) {
      globalInputRef.current?.focus();
    }
  }, [loadingCategorias, loadingAllJugadores, selectedCategoria]);

  // --- Lógica de Eventos ---

  const handleCategoriaClick = async (categoria) => {
    setSelectedCategoria(categoria);
    setLoadingJugadores(true);
    setJugadores([]); 
    try {
      const jugadoresData = await getSociosPorCategoria(categoria.id); 
      setJugadores(jugadoresData);
      // Enfocar buscador de categoría inmediatamente
      setTimeout(() => categoryInputRef.current?.focus(), 100); 
    } catch (error) {
      toast.error(`Error al cargar ${categoria.nombre_categoria}.`);
    } finally {
      setLoadingJugadores(false);
    }
  };

  const handleVolver = () => {
    setSelectedCategoria(null);
    setJugadores([]);
    setGlobalSearchTerm(""); 
    setCategorySearchTerm(""); 
    // Al volver, enfocar de nuevo el buscador global
    setTimeout(() => globalInputRef.current?.focus(), 100);
  };

  // --- CORRECCIÓN DE FORMATO QR Y MANEJO DE INPUT ---
  const handleSearchInput = (e, isGlobal) => {
    let val = e.target.value;

    // 1. DETECCIÓN Y CORRECCIÓN DE FORMATO QR
    // El lector envía comillas simples (ej: 5b7fc151'f914...) -> Lo pasamos a guiones (5b7fc151-f914...)
    if (val.includes("'")) {
      val = val.replace(/'/g, "-");
    }

    // 2. Actualizar el estado correcto
    if (isGlobal) {
      setGlobalSearchTerm(val);
    } else {
      setCategorySearchTerm(val);
    }
  };

  // Prevenir que el "Enter" del escáner recargue la página o envíe formularios
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // --- Lógica de Filtrado (DNI, Nombre o QR) ---
  const filtrarJugadores = (lista, termino) => {
    const busqueda = termino.toLowerCase().trim();
    if (busqueda === "") return selectedCategoria ? lista : [];

    return lista.filter(jugador => {
      const nombre = jugador.nombre_completo ? jugador.nombre_completo.toLowerCase() : "";
      
      // CORREGIDO: Usar 'nro_documento' en lugar de 'dni' (según tu backend)
      const dni = jugador.nro_documento ? String(jugador.nro_documento) : "";
      
      // CORREGIDO: Usar 'qr_token' en lugar de 'usuario' (campo nuevo en serializer)
      const codigoQR = jugador.qr_token ? String(jugador.qr_token).toLowerCase() : ""; 

      return (
        nombre.includes(busqueda) || // Búsqueda por Nombre (parcial)
        dni.startsWith(busqueda) ||  // Búsqueda por DNI (empieza con...)
        codigoQR === busqueda        // Búsqueda por QR (Coincidencia exacta del UUID)
      );
    });
  };

  const globalResultados = filtrarJugadores(allJugadores, globalSearchTerm);
  const categoriaResultados = selectedCategoria 
    ? (categorySearchTerm === "" ? jugadores : filtrarJugadores(jugadores, categorySearchTerm)) 
    : [];

  // --- Render ---
  if (loadingCategorias || loadingAllJugadores) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-5xl text-red-600 mb-4" />
        <span className="text-xl text-gray-600 font-medium">Preparando sistema...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <FaUsers className="text-red-600" />
              {selectedCategoria ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  {selectedCategoria.disciplina_nombre} - {selectedCategoria.nombre_categoria}
                </span>
              ) : "Jugadores del Club"}
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              {selectedCategoria 
                ? "Gestiona el plantel de esta categoría." 
                : "Busca jugadores en todo el club o selecciona una categoría."}
            </p>
          </div>

          {selectedCategoria && (
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50 hover:text-red-600 transition-all duration-200"
            >
              <FaArrowLeft /> Volver
            </button>
          )}
        </div>

        {/* --- BARRA DE BÚSQUEDA INTELIGENTE --- */}
        <div className="bg-white p-1 rounded-2xl shadow-lg border border-gray-100 mb-8 sticky top-4 z-10">
          <div className="relative flex items-center w-full">
            <div className="absolute left-0 pl-5 flex items-center pointer-events-none text-gray-400">
              <FaSearch className="text-xl" />
            </div>
            
            <input
              ref={selectedCategoria ? categoryInputRef : globalInputRef}
              type="text"
              placeholder={selectedCategoria 
                ? "Escanear QR o escribir DNI / Nombre..." 
                : "Escanear QR o escribir DNI / Nombre (Global)..."}
              className="w-full pl-14 pr-14 py-4 bg-transparent text-gray-900 text-xl font-medium rounded-xl focus:outline-none focus:bg-gray-50 transition-colors placeholder-gray-400"
              value={selectedCategoria ? categorySearchTerm : globalSearchTerm}
              onChange={(e) => handleSearchInput(e, !selectedCategoria)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoFocus
            />

            {/* Iconos de estado a la derecha */}
            <div className="absolute right-0 pr-4 flex items-center gap-3">
              {(selectedCategoria ? categorySearchTerm : globalSearchTerm) ? (
                <button 
                  onClick={() => selectedCategoria ? setCategorySearchTerm("") : setGlobalSearchTerm("")}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Limpiar búsqueda"
                >
                  <FaTimes />
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-2 text-gray-300 text-sm font-medium border px-3 py-1 rounded-lg bg-gray-50">
                  <FaQrcode /> <span>Listo para escanear</span>
                </div>
              )}
            </div>
          </div>
          {/* Barra de progreso visual (decorativa) */}
          <div className="h-1 w-full bg-gray-100 rounded-b-xl overflow-hidden">
            <div className={`h-full bg-red-500 transition-all duration-500 ${
              (selectedCategoria ? categorySearchTerm : globalSearchTerm) ? "w-full" : "w-0"
            }`}></div>
          </div>
        </div>

        {/* --- RESULTADOS --- */}
        
        {/* CASO 1: BÚSQUEDA GLOBAL  */}
        {!selectedCategoria && (
          globalSearchTerm.trim() !== "" ? (
            <div className="animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-700 mb-4 ml-1 flex items-center gap-2">
                Resultados encontrados: <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md">{globalResultados.length}</span>
              </h2>
              {globalResultados.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <FaUsers className="mx-auto text-6xl text-gray-200 mb-4" />
                  <p className="text-gray-500 text-lg">No se encontró ningún jugador.</p>
                  <p className="text-gray-400 text-sm mt-2">Prueba escaneando de nuevo o verifica el DNI.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {globalResultados.map(jugador => (
                    <JugadorCard key={jugador.usuario} jugador={jugador} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // MENU DE CATEGORÍAS
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-gray-800 mb-6 ml-1">Selecciona una Categoría</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoriasParaMostrar.length > 0 ? (
                  categoriasParaMostrar.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoriaClick(cat)}
                      className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-red-500 to-red-700 opacity-80 group-hover:w-2 transition-all"></div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border border-red-100">
                          {cat.disciplina_nombre}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                        {cat.nombre_categoria}
                      </h3>
                      <div className="mt-4 flex items-center text-gray-400 text-sm group-hover:text-gray-600 transition-colors font-medium">
                        <span>Ver equipo</span>
                        <FaArrowLeft className="rotate-180 ml-2" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                    <p className="text-gray-500">No tienes categorías asignadas para visualizar.</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* CASO 2: DENTRO DE UNA CATEGORÍA */}
        {selectedCategoria && (
          <div className="animate-fade-in-up">
            {loadingJugadores ? (
              <div className="flex justify-center py-20">
                <FaSpinner className="animate-spin text-4xl text-red-600" />
              </div>
            ) : (
              <div>
                {categoriaResultados.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg">
                      {categorySearchTerm 
                        ? `No se encontraron jugadores.`
                        : "No hay jugadores asignados a esta categoría aún."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoriaResultados.map(jugador => (
                      <JugadorCard key={jugador.usuario} jugador={jugador} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}