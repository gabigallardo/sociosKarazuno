
import { useEffect, useState } from "react";
import { getAllEventos, deleteEvento } from "../../api/eventos.api";
import { useNavigate } from "react-router-dom"; 
import { toast } from "react-hot-toast";

export default function ListaEventos() {
  const [eventos, setEventos] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    async function loadEventos() {
      try {
        const data = await getAllEventos();
        setEventos(data);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        toast.error("No se pudieron cargar los eventos.");
      }
    }
    loadEventos();
  }, []);

  const handleDelete = async (id) => {
    const accepted = window.confirm("¿Estás seguro de eliminar este evento?");
    if (accepted) {
      try {
        await deleteEvento(id);
        setEventos(eventos.filter((evento) => evento.id !== id));
        toast.success("Evento eliminado con éxito");
      } catch (error) {
        toast.error("Error al eliminar el evento");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {eventos.map((evento) => (
        <div 
          key={evento.id} 
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => navigate(`/eventos/${evento.id}`)}
        >
          <h2 className="font-bold text-lg text-gray-800">{evento.titulo}</h2>
          <p className="text-gray-600 text-sm mt-1">{evento.descripcion}</p>
          <p className="text-gray-500 text-xs mt-2">
            Inicia: {new Date(evento.fecha_inicio).toLocaleDateString()}
          </p>
          
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                handleDelete(evento.id);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-semibold rounded-full"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}