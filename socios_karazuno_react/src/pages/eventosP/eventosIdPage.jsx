import { useEffect, useState } from "react";
import { getEventoById } from "../../api/eventos.api";
import { useParams, useNavigate } from "react-router-dom";

export default function EventosIdPage() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvento() {
      const data = await getEventoById(id);
      setEvento(data);
    }
    loadEvento();
  }, [id]);

  if (!evento) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Detalle Evento</h1>
      <p><strong>ID:</strong> {evento.id}</p>
      <p><strong>Nombre:</strong> {evento.nombre}</p>
      <p><strong>Fecha:</strong> {evento.fecha}</p>

      <button
        onClick={() => navigate(`/eventos/editar/${evento.id}`)}
        className="bg-yellow-400 px-3 py-1 rounded mt-3"
      >
        Editar
      </button>
    </div>
  );
}
