// src/pages/eventosP/eventosPages.jsx

import React, { useState, useEffect, useContext } from "react"; // <-- ¡AGREGAR useEffect AQUÍ!
import { useNavigate } from "react-router-dom";
// Ajusta la ruta a tu API de Eventos y a tu componente ListaEventos
import { getAllEventos, deleteEvento} from "../../api/eventos.api"; 
import ListaEventos from "../../features/eventos/listaEventos"; 
import { UserContext } from "../../contexts/User.Context.jsx"; // Si usas el contexto aquí
import { FaPlus, FaCalendarAlt } from "react-icons/fa"; // Si usas los íconos de la versión anterior

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const { user } = useContext(UserContext); // Si necesitas el contexto

  // --- Lógica de Carga y Gestión ---
  const fetchEventos = async () => {
    setLoading(true);
    try {
      // Nota: Asegúrate de que getAllEventos y deleteEvento 
      // estén importados correctamente desde "../../api/eventos.api"
      const data = await getAllEventos(); 
      setEventos(data);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  // El useEffect que estaba dando error ahora funcionará
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
  // --- Fin Lógica de Carga y Gestión ---

  if (loading) { 
      return (
          <p className="text-lg p-6 font-semibold text-gray-700">
              Cargando Eventos...
          </p>
      );
  }
  
  // Usando los estilos modernos de la respuesta anterior
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-3">
            <FaCalendarAlt className="text-3xl"/>
            Administración de Eventos
        </h1>
        <button
          onClick={() => navigate("/eventos/crear")}
          className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full font-semibold shadow-md transition duration-200 flex items-center gap-2 transform hover:scale-[1.05]"
        >
          <FaPlus />
          Añadir Evento
        </button>
      </div>

      {eventos.length === 0 ? (
        <p className="text-center text-gray-500 italic p-10">No hay eventos registrados.</p>
      ) : (
        <ListaEventos
          eventos={eventos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}