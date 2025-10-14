import { useEffect, useState } from "react";
import { getEventoById } from "../../api/eventos.api";
import { useParams, useNavigate } from "react-router-dom";

export default function EventosIdPage() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvento() {
      const data = await getEventoById(id);
      if (!data) {
        setError("El evento no existe");
        return;
      }
      setEvento(data);
    }
    loadEvento();
  }, [id]);

  if (error) return (<div><p className="text-red-500">{error}</p>
  <button
    className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full font-semibold shadow-md transition duration-200 flex items-center gap-2 transform hover:scale-[1.05]"
    onClick={() => navigate(-1)}
  >
    Volver
  </button>
</div>);

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
