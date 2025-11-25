import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEventos, deleteEvento, getMisViajes } from "../../api/eventos.api";
import { getAllDisciplinas } from "../../api/disciplinas.api.js";
import ListaEventos from "../../features/eventos/listaEventos";
import { UserContext } from "../../contexts/User.Context.jsx";
import { FaPlus, FaCalendarAlt, FaPlane, FaFilter, FaGlobeAmericas } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function EventosPage() {
  const [listaCompletaEventos, setListaCompletaEventos] = useState([]);
  const [listaMisViajes, setListaMisViajes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [eventosMostrados, setEventosMostrados] = useState([]);

  const [filtroDisciplina, setFiltroDisciplina] = useState(null);
  const [vistaActual, setVistaActual] = useState('todos'); // 'todos' | 'mis_viajes'
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const userRoles = user?.roles || [];
  const esSocio = userRoles.includes("socio");
  const puedeGestionarEventos = 
    userRoles.includes("admin") || 
    userRoles.includes("profesor") || 
    userRoles.includes("dirigente");

  useEffect(() => {
    async function cargarDatosIniciales() {
      setLoading(true);
      try {
        const [eventosData, disciplinasData, misViajesData = []] = await Promise.all([
          getAllEventos(), 
          getAllDisciplinas(),
          esSocio ? getMisViajes() : Promise.resolve([]),
        ]);

        const ahora = new Date();
        // Filtramos solo eventos futuros o en curso
        const eventosFuturos = eventosData.filter(evento => {
            const finEvento = new Date(evento.fecha_fin);
            return finEvento >= ahora;
        });

        setListaCompletaEventos(eventosFuturos);
        
        const misViajesFuturos = Array.isArray(misViajesData) 
            ? misViajesData.filter(viaje => new Date(viaje.fecha_fin) >= ahora) 
            : [];

        setListaMisViajes(misViajesFuturos);
        setDisciplinas(disciplinasData);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("No se pudieron cargar los eventos.");
      } finally {
        setLoading(false);
      }
    }
    cargarDatosIniciales();
  }, [esSocio]);

  useEffect(() => {
    const fuenteDeDatos = vistaActual === 'todos' ? listaCompletaEventos : listaMisViajes;

    if (filtroDisciplina) {
      const filtrados = fuenteDeDatos.filter(evento => evento.disciplina?.id === filtroDisciplina);
      setEventosMostrados(filtrados);
    } else {
      setEventosMostrados(fuenteDeDatos);
    }
  }, [vistaActual, filtroDisciplina, listaCompletaEventos, listaMisViajes]);

  const handleDelete = async (id) => {
    if (!puedeGestionarEventos) return;
    
    // Usamos toast.promise para feedback visual mejorado
    toast.promise(
      (async () => {
         await deleteEvento(id);
         setListaCompletaEventos(prev => prev.filter(e => e.id !== id));
         setListaMisViajes(prev => prev.filter(e => e.id !== id));
      })(),
      {
         loading: 'Eliminando evento...',
         success: <b>Evento eliminado correctamente</b>,
         error: <b>Error al eliminar.</b>,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
         <p className="text-gray-500 font-medium">Cargando calendario...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="bg-red-100 text-red-700 p-2 rounded-lg">
                <FaCalendarAlt size={24} />
            </span>
            Agenda del Club
          </h1>
          <p className="text-gray-500 mt-1 ml-14">Próximos eventos, torneos y viajes.</p>
        </div>

        {puedeGestionarEventos && (
          <button
            onClick={() => navigate("/eventos/crear")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-red-200/50 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <FaPlus /> Crear Evento
          </button>
        )}
      </div>

      {/* --- CONTROLES DE VISTA Y FILTROS --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          {/* TABS: Todos vs Mis Viajes */}
          {esSocio && (
            <div className="flex p-1 bg-gray-100 rounded-xl w-full lg:w-auto">
              <button 
                onClick={() => setVistaActual('todos')} 
                className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${vistaActual === 'todos' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaGlobeAmericas /> Global
              </button>
              <button 
                onClick={() => setVistaActual('mis_viajes')} 
                className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${vistaActual === 'mis_viajes' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaPlane /> Mis Viajes
              </button>
            </div>
          )}

          {/* FILTROS HORIZONTALES */}
          <div className="flex items-center gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
            <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                <FaFilter size={12}/> Disciplina:
            </span>
            <button 
                onClick={() => setFiltroDisciplina(null)} 
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${!filtroDisciplina ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              Todas
            </button>
            {disciplinas.map(d => (
              <button 
                key={d.id} 
                onClick={() => setFiltroDisciplina(d.id)} 
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${filtroDisciplina === d.id ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
              >
                {d.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- GRID DE CONTENIDO --- */}
      {eventosMostrados.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
           <div className="mx-auto bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <FaCalendarAlt size={30} />
           </div>
           <h3 className="text-lg font-semibold text-gray-900">No se encontraron eventos</h3>
           <p className="text-gray-500 mt-1">Intenta cambiar los filtros o revisa más tarde.</p>
        </div>
      ) : (
        <ListaEventos
          eventos={eventosMostrados}
          onEdit={(evento) => navigate(`/eventos/editar/${evento.id}`)}
          onDelete={handleDelete}
          puedeGestionar={puedeGestionarEventos}
        />
      )}
    </div>
  );
}