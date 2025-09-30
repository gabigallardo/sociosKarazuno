import {useEffect, useState } from "react";
import { getEventoById, updateEvento } from "../../api/eventos.api";
import EventosForm from "../../features/eventos/eventosForm";
import { useParams, useNavigate } from "react-router-dom";
import { getAllUsuarios } from "../../api/usuarios.api";

export default function EventosEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const data = await getEventoById(id);
        setEvento(data);
      } catch (error) {
        console.error("Error cargando evento:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id]);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const data = await getAllUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error fetching usuarios en eventosEditarPage:", error);
      }
    }
    fetchUsuarios();
  }, []);

  const handleUpdate = async (eventoData) => {
    try {
      console.log("Enviando datos:", eventoData); // 👈 verifica

      await updateEvento(id, eventoData);
      navigate("/eventos");
    } catch (error) {
      console.error("Error actualizando evento:", error);
    }
  };

  if (loading) {
    return <p>Cargando Evento...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Editar Evento</h1>
      {<EventosForm initialValues={evento} onSubmit={handleUpdate} usuarios={usuarios} />}
    </div>
  );
}
