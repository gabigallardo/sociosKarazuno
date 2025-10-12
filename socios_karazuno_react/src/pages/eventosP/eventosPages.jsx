import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEventos, deleteEvento } from "../../api/eventos.api";
import { getAllDisciplinas } from "../../api/disciplinas.api.js"; 
import ListaEventos from "../../features/eventos/listaEventos";
import { UserContext } from "../../contexts/User.Context.jsx";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";

export default function EventosPage() {
  const [todosLosEventos, setTodosLosEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const userRoles = user?.roles || [];
  const puedeGestionarEventos = userRoles.includes("admin") || userRoles.includes("profesor") || userRoles.includes("dirigente");

  useEffect(() => {
    async function CargarDatos() {
        setLoading(true);
        try {
            const [eventosData, disciplinasData] = await Promise.all([
                getAllEventos(),
                getAllDisciplinas()
            ]);
            setTodosLosEventos(eventosData);
            setEventosFiltrados(eventosData);
            setDisciplinas(disciplinasData);
        } catch (error) {
            console.error("Error cargando datos de eventos:", error);
        } finally {
            setLoading(false);
        }
    }
    CargarDatos();
  }, []);

  const filtrarPorDisciplina = (disciplinaId) => {
    setFiltroActivo(disciplinaId);
    if (disciplinaId === null) {
        setEventosFiltrados(todosLosEventos);
    } else {
        const filtrados = todosLosEventos.filter(evento => evento.disciplina === disciplinaId);
        setEventosFiltrados(filtrados);
    }
  };

  const handleEdit = (evento) => {
    if (puedeGestionarEventos) {
      navigate(`/eventos/editar/${evento.id}`);
    }
  };

  const handleDelete = async (id) => {
    if (puedeGestionarEventos) {
      try {
        await deleteEvento(id);
        const nuevosEventos = todosLosEventos.filter(e => e.id !== id);
        setTodosLosEventos(nuevosEventos);
        setEventosFiltrados(nuevosEventos);
      } catch (error) {
        console.error("Error eliminando evento:", error);
      }
    }
  };

  if (loading) {
    return <p className="text-lg p-6 font-semibold text-gray-700">Cargando Eventos...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-3">
            <FaCalendarAlt className="text-3xl"/>
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

      <div className="my-4 flex flex-wrap gap-2 items-center">
        <p className="font-semibold mr-2 text-gray-600">Filtrar por Deporte:</p>
        <button onClick={() => filtrarPorDisciplina(null)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtroActivo === null ? 'bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Todos
        </button>
        {disciplinas.map(d => (
            <button key={d.id} onClick={() => filtrarPorDisciplina(d.id)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtroActivo === d.id ? 'bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {d.nombre}
            </button>
        ))}
      </div>

      {eventosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500 italic p-10">No hay eventos que coincidan con el filtro.</p>
      ) : (
        <ListaEventos
          eventos={eventosFiltrados}
          onEdit={handleEdit}
          onDelete={handleDelete}
          puedeGestionar={puedeGestionarEventos}
        />
      )}
    </div>
  );
}