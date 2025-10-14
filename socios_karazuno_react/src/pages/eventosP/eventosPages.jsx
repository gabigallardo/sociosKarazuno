import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEventos, deleteEvento, getMisViajes } from "../../api/eventos.api";
import { getAllDisciplinas } from "../../api/disciplinas.api.js";
import ListaEventos from "../../features/eventos/listaEventos";
import { UserContext } from "../../contexts/User.Context.jsx";
import { FaPlus, FaCalendarAlt, FaPlane } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function EventosPage() {
  const [listaCompletaEventos, setListaCompletaEventos] = useState([]);
  const [listaMisViajes, setListaMisViajes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [eventosMostrados, setEventosMostrados] = useState([]); 

  const [filtroDisciplina, setFiltroDisciplina] = useState(null);
  const [vistaActual, setVistaActual] = useState('todos'); 
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

        setListaCompletaEventos(eventosData);
        setListaMisViajes(misViajesData);
        setDisciplinas(disciplinasData);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    }
    cargarDatosIniciales();
  }, [esSocio]);

  useEffect(() => {
    const fuenteDeDatos = vistaActual === 'todos' ? listaCompletaEventos : listaMisViajes;

    if (filtroDisciplina) {
      const filtrados = fuenteDeDatos.filter(evento => evento.disciplina === filtroDisciplina);
      setEventosMostrados(filtrados);
    } else {
      setEventosMostrados(fuenteDeDatos);
    }
  }, [vistaActual, filtroDisciplina, listaCompletaEventos, listaMisViajes]);


  const handleDelete = async (id) => {
    if (!puedeGestionarEventos) {
      toast.error("No tienes permiso para realizar esta acción.");
      return;
    }

    if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      try {
        await deleteEvento(id);
        toast.success("Evento eliminado");
        setListaCompletaEventos(prev => prev.filter(e => e.id !== id));
        setListaMisViajes(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        toast.error("Error al eliminar el evento.");
      }
    }
  };

  if (loading) {
    return <p className="text-lg p-6 font-semibold text-gray-700">Cargando...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-3">
          <FaCalendarAlt className="text-3xl" />
          Eventos del Club
        </h1>
        {puedeGestionarEventos && (
          <button
            onClick={() => navigate("/eventos/crear")}
            className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full font-semibold shadow-md transition duration-200 flex items-center gap-2 transform hover:scale-[1.05]"
          >
            <FaPlus /> Añadir Evento
          </button>
        )}
      </div>

      {esSocio && (
        <div className="mb-6 flex border border-gray-200 rounded-lg p-1 w-fit bg-gray-50">
          <button onClick={() => setVistaActual('todos')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${vistaActual === 'todos' ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            Todos los Eventos
          </button>
          <button onClick={() => setVistaActual('mis_viajes')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${vistaActual === 'mis_viajes' ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FaPlane/> Mis Viajes
          </button>
        </div>
      )}

      <div className="my-4 flex flex-wrap gap-2 items-center">
        <p className="font-semibold mr-2 text-gray-600">Filtrar por Deporte:</p>
        <button onClick={() => setFiltroDisciplina(null)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!filtroDisciplina ? 'bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Todos
        </button>
        {disciplinas.map(d => (
          <button key={d.id} onClick={() => setFiltroDisciplina(d.id)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtroDisciplina === d.id ? 'bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            {d.nombre}
          </button>
        ))}
      </div>

      {eventosMostrados.length === 0 ? (
        <p className="text-center text-gray-500 italic p-10">
          {vistaActual === 'mis_viajes' 
            ? 'No hay viajes disponibles para tu disciplina o categoría.' 
            : 'No hay eventos que coincidan con el filtro.'}
        </p>
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