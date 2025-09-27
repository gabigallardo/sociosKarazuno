import { useEffect, useState } from "react";
import {
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../api/usuarios.api";
import UsuariosForm from "../features/usuarios/usuariosForm";
import UsuariosList from "../features/usuarios/listaUsuarios";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

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

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateUsuario(editing.id, data);
      } else {
        await createUsuario(data);
      }
      await fetchUsuarios();
      setEditing(null);
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
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

      <UsuariosForm onSubmit={handleSave} initialValues={editing} />

      <UsuariosList
        usuarios={usuarios}
        onEdit={(usuario) => setEditing(usuario)}
        onDelete={handleDelete}
      />
    </div>
  );
}
