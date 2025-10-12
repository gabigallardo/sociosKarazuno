import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEventos, deleteEvento } from "../../api/eventos.api"; 
import ListaEventos from "../../features/eventos/listaEventos"; 
import { UserContext } from "../../contexts/User.Context.jsx";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // --- LÓGICA DE PERMISOS ---
  const userRoles = user?.roles || [];
  const puedeGestionarEventos = userRoles.includes("admin") || userRoles.includes("profesor") || userRoles.includes("dirigente");

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const data = await getAllEventos(); 
      setEventos(data);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleEdit = (evento) => {
    navigate(`/eventos/editar/${evento.id}`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvento(id);
      await fetchEventos();
    } catch (error) {
      console.error("Error eliminando evento:", error);
    }
  };

  if (loading) { 
      return (
          <p className="text-lg p-6 font-semibold text-gray-700">
              Cargando Eventos...
          </p>
      );
  }
  
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-3">
            <FaCalendarAlt className="text-3xl"/>
            Administración de Eventos
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

      {eventos.length === 0 ? (
        <p className="text-center text-gray-500 italic p-10">No hay eventos registrados.</p>
      ) : (
        <ListaEventos
          eventos={eventos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          puedeGestionar={puedeGestionarEventos}
        />
      )}
    </div>
  );
}