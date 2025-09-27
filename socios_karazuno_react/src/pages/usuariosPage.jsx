import { useEffect, useState } from "react";
import {getAllUsuarios, deleteUsuario,} from "../api/usuarios.api";
import { useNavigate } from "react-router-dom";
import UsuariosList from "../features/usuarios/listaUsuarios";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getAllUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

   const handleEdit = (usuario) => {
    navigate(`/usuarios/editar/${usuario.id}`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUsuario(id);
      await fetchUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Usuarios</h1>

      <button
        onClick={() => navigate("/usuarios/crear")}
        className="bg-green-500 text-white px-3 py-1 rounded my-3"
      >
        Crear Usuario
      </button>

      <UsuariosList
        usuarios={usuarios}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
