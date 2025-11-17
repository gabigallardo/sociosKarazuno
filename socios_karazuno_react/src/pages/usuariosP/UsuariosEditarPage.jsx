import { useEffect, useState } from "react";
import { getUsuarioById, updateUsuario } from "../../api/usuarios.api";
import UsuariosForm from "../../features/usuarios/usuariosForm";
import { useParams, useNavigate } from "react-router-dom";
import { getAllRoles } from "../../api/roles.api";
import { getAllDisciplinas } from "../../api/disciplinas.api";
import { getAllCategorias } from "../../api/categorias.api";
import { toast } from "react-hot-toast";

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
        // Usamos Promise.all para cargar todo en paralelo
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
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [id]);


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

  if (loading) return <div className="p-4">Cargando editor de usuario...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Editar Usuario</h1>
      {usuario && (
        <UsuariosForm
          onSubmit={handleUpdate}
          initialValues={usuario}
          allRoles={roles}
          allDisciplinas={disciplinas}
          allCategorias={categorias}
        />
      )}
    </div>
  );
}
