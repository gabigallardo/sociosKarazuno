import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaUserEdit } from "react-icons/fa"; 

// API Imports
import { getUsuarioById, updateUsuario } from "../../api/usuarios.api"; //
import { getAllRoles } from "../../api/roles.api"; //
import { getAllDisciplinas } from "../../api/disciplinas.api"; //
import { getAllCategorias } from "../../api/categorias.api"; //

// Componente Formulario
import UsuariosForm from "../../features/usuarios/usuariosForm"; //

export default function UsuariosEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
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
        console.error("Error cargando datos:", error);
        toast.error("No se pudieron cargar los datos.");
        navigate("/usuarios"); 
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [id, navigate]);


  const handleUpdate = async (usuarioData) => {
    try {
      await updateUsuario(id, usuarioData);
      toast.success("Usuario actualizado con éxito!");
      navigate("/usuarios");
    } catch (error) {
      console.error("Error actualizando:", error);
      const errorMsg = error.response?.data?.error || "Error al actualizar usuario.";
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando editor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 fade-in-enter">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Header --- */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-3 rounded-full shadow-sm border border-gray-200 transition-all"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <FaUserEdit className="text-red-600" /> Editar Usuario
            </h1>
            <p className="text-sm text-gray-500">Modifica la información y permisos del usuario.</p>
          </div>
        </div>

        {/* --- Form Container --- */}
        {usuario && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <UsuariosForm
              onSubmit={handleUpdate}
              initialValues={usuario}
              allRoles={roles}
              allDisciplinas={disciplinas}
              allCategorias={categorias}
              isEditing={true} // Prop opcional para ajustar textos del botón
            />
          </div>
        )}
      </div>
    </div>
  );
}