import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAllEventos, deleteEvento, getMisViajes } from "../../api/eventos.api"; 
import { getAllDisciplinas } from "../../api/disciplinas.api.js";
import { UserContext } from "../../contexts/User.Context.jsx";
import { FaPlus, FaCalendarAlt, FaPlane, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function EventosPage() {
  const [todosLosEventos, setTodosLosEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('todos');
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const userRoles = user?.roles || [];
  const esSocio = userRoles.includes("socio");
  const puedeGestionarEventos = userRoles.includes("admin") || userRoles.includes("profesor") || userRoles.includes("dirigente");

  useEffect(() => {
    async function CargarDatos() {
      setLoading(true);
      try {
        let eventosResponse;
        if (vistaActual === 'todos') {
          eventosResponse = await getAllEventos();
        } else {
          eventosResponse = await getMisViajes();
        }
        
        const disciplinasResponse = await getAllDisciplinas();

        const eventosData = Array.isArray(eventosResponse.data) ? eventosResponse.data : [];
        const disciplinasData = Array.isArray(disciplinasResponse.data) ? disciplinasResponse.data : [];

        setTodosLosEventos(eventosData);
        setEventosFiltrados(eventosData);
        setDisciplinas(disciplinasData);
        setFiltroActivo(null);
      } catch (error) {
        console.error("Error cargando datos de eventos:", error);
        toast.error("No se pudieron cargar los eventos.");
      } finally {
        setLoading(false);
      }
    }
    CargarDatos();
  }, [vistaActual]);

  const filtrarPorDisciplina = (disciplinaId) => {
    setFiltroActivo(disciplinaId);
    if (disciplinaId === null) {
      setEventosFiltrados(todosLosEventos);
    } else {
      const filtrados = todosLosEventos.filter(evento => evento.disciplina === disciplinaId);
      setEventosFiltrados(filtrados);
    }
  };

  const handleEdit = (e, eventoId) => {
    e.preventDefault();
    e.stopPropagation();
    if (puedeGestionarEventos) {
      navigate(`/eventos/editar/${eventoId}`);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (puedeGestionarEventos) {
        if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            try {
                await deleteEvento(id);
                toast.success("Evento eliminado");
                const nuevosEventos = todosLosEventos.filter(e => e.id !== id);
                setTodosLosEventos(nuevosEventos);
                setEventosFiltrados(nuevosEventos);
            } catch (error) {
                console.error("Error eliminando evento:", error);
                toast.error("Error al eliminar el evento.");
            }
        }
    }
  };

  if (loading) {
    return <p className="text-lg p-6 font-semibold text-gray-700 text-center">Cargando...</p>;
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
            <FaPlus />
            Añadir Evento
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
        <button onClick={() => filtrarPorDisciplina(null)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtroActivo === null ? 'bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Todos
        </button>
        {disciplinas?.map(d => (
            <button key={d.id} onClick={() => filtrarPorDisciplina(d.id)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtroActivo === d.id ? 'bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {d.nombre}
            </button>
        ))}
      </div>

      {eventosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500 italic p-10">
          {vistaActual === 'mis_viajes' 
            ? 'No hay viajes disponibles para tu disciplina o categoría. ¡Asegúrate de configurar tu perfil!' 
            : 'No hay eventos que coincidan con el filtro.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((evento) => (
                <Link to={`/eventos/${evento.id}`} key={evento.id} className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
                    <div className="h-48 overflow-hidden">
                        <img
                        src={evento.imagen_url || 'https://placehold.co/400x200/ef4444/white?text=Evento'}
                        alt={`Imagen de ${evento.titulo}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    <div className="p-4">
                        <h2 className="text-xl font-bold text-gray-800 truncate">{evento.titulo}</h2>
                        <p className="text-sm text-gray-500 mt-1">{new Date(evento.fecha_inicio).toLocaleDateString()}</p>
                    </div>
                    {puedeGestionarEventos && (
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleEdit(e, evento.id)} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                            <FaEdit/>
                        </button>
                        <button onClick={(e) => handleDelete(e, evento.id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg">
                            <FaTrash/>
                        </button>
                        </div>
                    )}
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}
