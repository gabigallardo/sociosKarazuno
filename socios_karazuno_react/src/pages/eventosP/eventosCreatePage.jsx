import { useState, useEffect } from "react";
import { createEvento } from "../../api/eventos.api";
import EventosForm from "../../features/eventos/eventosForm";
import { useNavigate } from "react-router-dom";
import { getAllUsuarios } from "../../api/usuarios.api";

export default function EventosCreatePage() {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const data = await getAllUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error fetching usuarios en eventosCreatePage:", error);
      }
    }
    fetchUsuarios();
  }, []);

  const handleCreate = async (data) => {
    try {
      console.log("Enviando datos:", data); // 👈 verifica

      await createEvento(data);
      navigate("/eventos");
    } catch (error) {
      console.error("Error creando evento:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Crear Evento</h1>
      <EventosForm onSubmit={handleCreate} usuarios={usuarios} />
    </div>
  );
}