import { useState, useEffect } from "react";
import { createEvento } from "../../api/eventos.api";
import EventosForm from "../../features/eventos/eventosForm";
import { useNavigate } from "react-router-dom";
import { getAllUsuarios } from "../../api/usuarios.api";
import { getAllDisciplinas } from "../../api/disciplinas.api";
import { getAllCategorias } from "../../api/categorias.api";
import { FaCalendarPlus } from "react-icons/fa";

export default function EventosCreatePage() {
  const [usuarios, setUsuarios] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [usuariosData, disciplinasData, categoriasData] = await Promise.all([
          getAllUsuarios(),
          getAllDisciplinas(),
          getAllCategorias()
        ]);
        setUsuarios(usuariosData || []);
        setDisciplinas(disciplinasData || []);
        setCategorias(categoriasData || []);
      } catch (error) {
        console.error("Error fetching data for eventosCreatePage:", error);
        setUsuarios([]);
        setDisciplinas([]);
        setCategorias([]);
      }
    }
    fetchData();
  }, []);

  const handleCreate = async (payload) => {
    try {
      console.log("Enviando payload final:", payload);
      await createEvento(payload);
      navigate("/eventos");
    } catch (error) {
      console.error("Error creando evento:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-extrabold text-red-700 mb-6 flex items-center gap-3 border-b pb-4">
        <FaCalendarPlus className="text-3xl"/>
        Crear Nuevo Evento
      </h1>
      
      <EventosForm 
        onSubmit={handleCreate} 
        usuarios={usuarios}
        disciplinas={disciplinas}
        categorias={categorias}
      />
    </div>
  );
}