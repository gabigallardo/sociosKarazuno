import { useEffect, useState } from "react";
import { getEventoById, updateEvento } from "../../api/eventos.api";
import { getAllUsuarios } from "../../api/usuarios.api";
import EventosForm from "../../features/eventos/eventosForm";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function EventosEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      try {
        const eventoRes = await getEventoById(id);
        setEvento(eventoRes.data);

        const usuariosRes = await getAllUsuarios({ rol: 'profesor' });
        setProfesoresDisponibles(usuariosRes.data);

      } catch (error) {
        console.error("Error cargando los datos:", error);
        toast.error("No se pudieron cargar los datos para la edición.");
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      const profesoresIds = data.profesores.map(p => (typeof p === 'object' ? p.id : p));

      const payload = {
        ...data,
        profesores: profesoresIds,
      };

      await updateEvento(id, payload);
      toast.success("Evento actualizado correctamente");
      navigate("/eventos");
    } catch (error) {
      console.error("Error actualizando el evento:", error);
      toast.error("Hubo un error al actualizar el evento.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Cargando datos del evento...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10 border">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Editar Evento</h1>
      {evento && (
        <EventosForm
          initialValues={evento}
          onSubmit={handleUpdate}
          todosLosProfesores={profesoresDisponibles}
        />
      )}
    </div>
  );
}