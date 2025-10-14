import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventosForm from "../../features/eventos/eventosForm";
import { getEventoById, updateEvento } from "../../api/eventos.api";
import { getAllDisciplinas } from "../../api/disciplinas.api";
import { getAllCategorias } from "../../api/categorias.api";
import { getAllUsuarios } from "../../api/usuarios.api"; 
import { toast } from "react-hot-toast";

export default function EventosEditarPage() {
  const [initialData, setInitialData] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAllDataForEdit() {
      try {
        setIsLoading(true);
        const [eventoRes, disciplinasRes, categoriasRes, usuariosRes] = await Promise.all([
          getEventoById(params.id),
          getAllDisciplinas(),
          getAllCategorias(),
          getAllUsuarios(),
        ]);

        if (!eventoRes) {
          toast.error("El evento que intentas editar no fue encontrado.");
          navigate("/eventos");
          return;
        }

        setInitialData(eventoRes);
        setDisciplinas(disciplinasRes);
        setCategorias(categoriasRes);
        setUsuarios(usuariosRes);
        
      } catch (error) {
        console.error("Error al cargar los datos para editar:", error);
        toast.error("No se pudieron cargar los datos necesarios para la edición.");
      } finally {
        setIsLoading(false);
      }
    }
    loadAllDataForEdit();
  }, [params.id, navigate]);

  const handleUpdate = async (data) => {
    try {
      await updateEvento(params.id, data);
      toast.success("Evento actualizado con éxito");
      navigate("/eventos");
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
      toast.error("No se pudo actualizar el evento.");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Cargando formulario de edición...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Evento</h1>
      <EventosForm 
        onSubmit={handleUpdate} 
        initialValues={initialData}
        disciplinas={disciplinas}
        categorias={categorias}
        usuarios={usuarios}
        isLoading={false} 
      />
    </div>
  );
}