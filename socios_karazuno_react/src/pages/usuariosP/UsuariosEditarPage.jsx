import { useEffect, useState } from "react";
import { getUsuarioById, updateUsuario } from "../../api/usuarios.api";
import UsuariosForm from "../../features/usuarios/usuariosForm";
import { useParams, useNavigate } from "react-router-dom";

export default function UsuariosEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function loadUsuario() {
      const data = await getUsuarioById(id);
      setUsuario(data);
    }
    loadUsuario();
  }, [id]);

  const handleUpdate = async (data) => {
    await updateUsuario(id, data);
    navigate("/usuarios");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Editar Usuario</h1>
      {usuario && <UsuariosForm onSubmit={handleUpdate} initialValues={usuario} />}
    </div>
  );
}
