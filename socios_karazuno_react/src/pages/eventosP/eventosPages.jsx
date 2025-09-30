import { useEffect, useState } from "react";
import { getAllEventos, deleteEvento} from "../../api/eventos.api";
import { useNavigate } from "react-router-dom";
import ListaEventos from "../../features/eventos/listaEventos";

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) { return <p>Cargando Eventos...</p>;}

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Eventos</h1>
      <button
        onClick={() => navigate("/eventos/crear")}
        className="bg-green-500 text-white px-3 py-1 rounded my-3"
      >
        Añadir Evento
      </button>
      <ListaEventos
       eventos={eventos}
       onEdit={handleEdit}
       onDelete={handleDelete}
      />
    </div>
  );
}