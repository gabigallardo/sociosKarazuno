import { useEffect, useState } from "react";
import { createUsuario } from "../../api/usuarios.api"; //
import { getAllRoles } from "../../api/roles.api"; //
import { getAllDisciplinas } from "../../api/disciplinas.api"; //
import { getAllCategorias } from "../../api/categorias.api"; //
import UsuariosForm from "../../features/usuarios/usuariosForm"; //
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaUserPlus } from "react-icons/fa";

export default function UsuariosCreatePage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos auxiliares para los selectores del formulario
  useEffect(() => {
    async function loadAuxData() {
      try {
        const [rolesData, disciplinasData, categoriasData] = await Promise.all([
          getAllRoles(),
          getAllDisciplinas(),
          getAllCategorias(),
        ]);
        setRoles(rolesData);
        setDisciplinas(disciplinasData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error cargando datos auxiliares:", error);
        toast.error("Error al cargar opciones del formulario.");
      } finally {
        setLoading(false);
      }
    }
    loadAuxData();
  }, []);

  const handleCreate = async (data) => {
    try {
      await createUsuario(data);
      toast.success("Usuario creado exitosamente");
      navigate("/usuarios");
    } catch (error) {
        console.error("Error al crear usuario:", error);
        // Manejo simple de errores del backend
        const msg = error.response?.data?.error || "Error al crear el usuario. Verifica los datos.";
        toast.error(msg);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Preparando formulario...</div>;

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
                <FaUserPlus className="text-red-600" /> Nuevo Usuario
            </h1>
            <p className="text-sm text-gray-500">Registra un nuevo miembro en el sistema.</p>
          </div>
        </div>

        {/* --- Form Container --- */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <UsuariosForm 
            onSubmit={handleCreate} 
            allRoles={roles}
            allDisciplinas={disciplinas}
            allCategorias={categorias}
          />
        </div>
      </div>
    </div>
  );
}