import { useEffect, useState } from "react";
import { getUsuarioById, updateUsuario } from "../../api/usuarios.api";
import UsuariosForm from "../../features/usuarios/usuariosForm";
import { useParams, useNavigate } from "react-router-dom";
import { getAllRoles } from "../../api/roles.api";

export default function UsuariosEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    async function loadUsuario() {
      const data = await getUsuarioById(id);
      console.log("Usuario recibido:", data); // 👈 mirá la estructura exacta

      setUsuario(data);
    }
    loadUsuario();
  }, [id]);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const data = await getAllRoles();
        setRoles(data);
      } catch (error) {
        console.error("Error fetching roles en UsuariosEditarPage:", error);
      }
    }
    fetchRoles();
  }, []);

  const handleUpdate = async (usuarioData) => {
    try {
      console.log("Enviando datos:", usuarioData); // 👈 verifica
      const payload = { ...usuarioData, roles_ids: usuarioData.roles }; // Asegura que roles sea un array de IDs
      await updateUsuario(id, payload);
      navigate("/usuarios");
    } catch (error) {
      console.error("Error actualizando usuario:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Editar Usuario</h1>
      {usuario && <UsuariosForm onSubmit={handleUpdate} initialValues={usuario} allRoles={roles} />}
    </div>
  );
}
