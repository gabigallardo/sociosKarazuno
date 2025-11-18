import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa"; 

// API Imports
import { getUsuarioById, updateUsuario } from "../../api/usuarios.api";
import { getAllRoles } from "../../api/roles.api";
import { getAllDisciplinas } from "../../api/disciplinas.api";
import { getAllCategorias } from "../../api/categorias.api";

// Componente Formulario
import UsuariosForm from "../../features/usuarios/usuariosForm";

export default function UsuariosEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        // Carga paralela de datos
        const [userData, rolesData, disciplinasData, categoriasData] = await Promise.all([
          getUsuarioById(id),
          getAllRoles(),
          getAllDisciplinas(),
          getAllCategorias(),
        ]);

        setUsuario(userData);
        setRoles(rolesData);
        setDisciplinas(disciplinasData);
        setCategorias(categoriasData);
        
      } catch (error) {
        console.error("Error cargando datos para la edición:", error);
        toast.error("No se pudieron cargar los datos del usuario.");
        navigate("/usuarios"); 
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [id, navigate]);


  const handleUpdate = async (usuarioData) => {
    try {
      console.log("Enviando payload COMPLETO:", usuarioData);
      await updateUsuario(id, usuarioData);
      toast.success("Usuario actualizado con éxito!");
      navigate("/usuarios");
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      toast.error("Error al actualizar. Revisa la consola.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando editor de usuario...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      
      {/* --- Encabezado con Botón Volver --- */}
      <div className="flex items-center gap-4 mb-6 border-b pb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Volver atrás"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-extrabold text-gray-800">Editar Usuario</h1>
      </div>

      {/* --- Formulario --- */}
      {usuario && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <UsuariosForm
            onSubmit={handleUpdate}
            initialValues={usuario}
            allRoles={roles}
            allDisciplinas={disciplinas}
            allCategorias={categorias}
            />
        </div>
      )}
    </div>
  );
}