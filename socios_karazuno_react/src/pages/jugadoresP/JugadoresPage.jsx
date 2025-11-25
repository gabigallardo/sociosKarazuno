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
  FaTimes,
  FaBasketballBall
} from 'react-icons/fa';
import JugadorCard from '../../features/jugadores/JugadorCard'; 
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function JugadoresPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const globalInputRef = useRef(null);
  const categoryInputRef = useRef(null);

  // --- Estados ---
  const [categorias, setCategorias] = useState([]);
  const [categoriasParaMostrar, setCategoriasParaMostrar] = useState([]);
  const [allJugadores, setAllJugadores] = useState([]); 
  const [jugadores, setJugadores] = useState([]); 

  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState(""); 
  const [categorySearchTerm, setCategorySearchTerm] = useState(""); 
  
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
        console.error(error);
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

  // --- Auto-Foco ---
  useEffect(() => {
    if (!loadingCategorias && !loadingAllJugadores && !selectedCategoria) {
      globalInputRef.current?.focus();
    }
  }, [loadingCategorias, loadingAllJugadores, selectedCategoria]);

  // --- Manejadores ---
  const handleCategoriaClick = async (categoria) => {
    setSelectedCategoria(categoria);
    setLoadingJugadores(true);
    setJugadores([]); 
    try {
      const jugadoresData = await getSociosPorCategoria(categoria.id); 
      setJugadores(jugadoresData);
      setTimeout(() => categoryInputRef.current?.focus(), 100); 
    } catch (error) {
      console.error(error);
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
    setTimeout(() => globalInputRef.current?.focus(), 100);
  };

  const handleSearchInput = (e, isGlobal) => {
    let val = e.target.value;
    if (val.includes("'")) val = val.replace(/'/g, "-"); // Fix lector QR
    if (isGlobal) setGlobalSearchTerm(val);
    else setCategorySearchTerm(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const handleJugadorClick = (jugadorId) => {
    navigate(`/socios/${jugadorId}`);
  };

  // --- Filtro ---
  const filtrarJugadores = (lista, termino) => {
    const busqueda = termino.toLowerCase().trim();
    if (busqueda === "") return selectedCategoria ? lista : [];

    return lista.filter(jugador => {
      const nombre = jugador.nombre_completo ? jugador.nombre_completo.toLowerCase() : "";
      const dni = jugador.nro_documento ? String(jugador.nro_documento) : "";
      const codigoQR = jugador.qr_token ? String(jugador.qr_token).toLowerCase() : ""; 

      return (
        nombre.includes(busqueda) || 
        dni.startsWith(busqueda) || 
        codigoQR === busqueda 
      );
    });
  };

  const globalResultados = filtrarJugadores(allJugadores, globalSearchTerm);
  const categoriaResultados = selectedCategoria 
    ? (categorySearchTerm === "" ? jugadores : filtrarJugadores(jugadores, categorySearchTerm)) 
    : [];

  // --- Loader ---
  if (loadingCategorias || loadingAllJugadores) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 fade-in-enter">
        <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-red-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <FaBasketballBall className="text-red-600/30 animate-pulse" />
            </div>
        </div>
        <span className="mt-4 text-lg text-gray-600 font-medium tracking-wide">Cargando plantel...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 fade-in-enter">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tight">
              <span className="bg-red-100 text-red-600 p-2 rounded-xl shadow-sm">
                <FaUsers />
              </span>
              {selectedCategoria ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  {selectedCategoria.nombre_categoria}
                </span>
              ) : "Plantel Deportivo"}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              {selectedCategoria 
                ? `Gestión de jugadores - ${selectedCategoria.disciplina_nombre}`
                : "Busca en todo el club o selecciona una categoría específica."}
            </p>
          </div>

          {selectedCategoria && (
            <button
              onClick={handleVolver}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl shadow-sm hover:shadow-md hover:text-red-600 hover:border-red-100 transition-all duration-300"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
              Volver al listado
            </button>
          )}
        </div>

        {/* --- BUSCADOR PRINCIPAL --- */}
        <div className={`relative transition-all duration-500 ${selectedCategoria ? 'max-w-4xl mx-auto' : 'w-full'}`}>
            <div className="relative group z-20">
                {/* Icono Izquierdo */}
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <FaSearch className={`text-xl transition-colors duration-300 ${
                        (selectedCategoria ? categorySearchTerm : globalSearchTerm) 
                        ? "text-red-500" 
                        : "text-gray-400 group-focus-within:text-red-500"
                    }`} />
                </div>

                {/* Input */}
                <input
                    ref={selectedCategoria ? categoryInputRef : globalInputRef}
                    type="text"
                    className="w-full pl-14 pr-14 py-5 bg-white text-gray-900 text-lg font-semibold rounded-2xl shadow-xl border-2 border-transparent focus:border-red-500/20 focus:ring-0 focus:shadow-red-500/10 transition-all placeholder-gray-400"
                    placeholder={selectedCategoria ? "Escanear carnet o buscar en categoría..." : "Escanear carnet o búsqueda global..."}
                    value={selectedCategoria ? categorySearchTerm : globalSearchTerm}
                    onChange={(e) => handleSearchInput(e, !selectedCategoria)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    autoFocus
                />

                {/* Acciones Derecha */}
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {(selectedCategoria ? categorySearchTerm : globalSearchTerm) ? (
                        <button 
                            onClick={() => selectedCategoria ? setCategorySearchTerm("") : setGlobalSearchTerm("")}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    ) : (
                        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            <FaQrcode /> <span>SCAN READY</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Sombra decorativa roja al enfocar */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition duration-500 pointer-events-none"></div>
        </div>

        {/* --- CONTENIDO --- */}
        
        {/* CASO 1: BÚSQUEDA GLOBAL ACTIVA */}
        {!selectedCategoria && globalSearchTerm.trim() !== "" && (
            <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xl font-bold text-gray-800">Resultados de búsqueda</h2>
                    <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {globalResultados.length} encontrados
                    </span>
                </div>
                
                {globalResultados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                            <FaSearch className="text-4xl text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium text-lg">No se encontraron coincidencias.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {globalResultados.map(jugador => (
                          <div key={jugador.usuario} onClick={() => handleJugadorClick(jugador.usuario)} className="cursor-pointer transition-transform hover:scale-[1.02]">
                            <JugadorCard key={jugador.usuario} jugador={jugador} />
                          </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* CASO 2: SELECCIÓN DE CATEGORÍA (Inicio) */}
        {!selectedCategoria && globalSearchTerm.trim() === "" && (
            <div className="animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoriasParaMostrar.length > 0 ? (
                        categoriasParaMostrar.map(cat => (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoriaClick(cat)}
                                className="group relative bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 hover:shadow-2xl border border-white hover:border-red-100 transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Background Decorativo */}
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                            {cat.disciplina_nombre}
                                        </span>
                                        <div className="bg-gray-50 p-2 rounded-full group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                            <FaUsers className="text-gray-400 text-sm group-hover:text-white" />
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                                        {cat.nombre_categoria}
                                    </h3>
                                    
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-gray-400 group-hover:text-gray-600">
                                        <span>Ver equipo</span>
                                        <FaArrowLeft className="rotate-180 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No tienes categorías asignadas.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* CASO 3: DENTRO DE UNA CATEGORÍA */}
        {selectedCategoria && (
            <div className="animate-fade-in-up">
                {loadingJugadores ? (
                    <div className="flex flex-col items-center justify-center py-24 opacity-70">
                        <FaSpinner className="animate-spin text-4xl text-red-600 mb-4" />
                        <p className="text-gray-500 font-medium">Recuperando datos...</p>
                    </div>
                ) : (
                    <div>
                        {categoriaResultados.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="inline-block p-4 rounded-full bg-red-50 mb-4">
                                    <FaUsers className="text-3xl text-red-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Sin resultados</h3>
                                <p className="text-gray-500">
                                    {categorySearchTerm 
                                        ? "No se encontraron jugadores con ese criterio." 
                                        : "Esta categoría aún no tiene jugadores asignados."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categoriaResultados.map(jugador => (
                                  <div key={jugador.usuario} onClick={() => handleJugadorClick(jugador.usuario)} className="cursor-pointer transition-transform hover:scale-[1.02]">
                                    <JugadorCard jugador={jugador} />
                                  </div>
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