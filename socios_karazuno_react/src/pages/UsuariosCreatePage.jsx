import { createUsuario } from "../api/usuarios.api";
import UsuariosForm from "../features/usuarios/usuariosForm";
import { useNavigate } from "react-router-dom";

export default function UsuariosCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    await createUsuario(data);
    navigate("/usuarios");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Crear Usuario</h1>
      <UsuariosForm onSubmit={handleCreate} />
    </div>
  );
}
