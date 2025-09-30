import { useEffect, useState } from "react";
import { getUsuarioById } from "../../api/usuarios.api";
import { useParams, useNavigate } from "react-router-dom";

export default function UsuarioIdPage() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUsuario() {
      const data = await getUsuarioById(id);
      setUsuario(data);
    }
    loadUsuario();
  }, [id]);

  if (!usuario) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Detalle Usuario</h1>
      <p><strong>ID:</strong> {usuario.id}</p>
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Email:</strong> {usuario.email}</p>

      <button
        onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
        className="bg-yellow-400 px-3 py-1 rounded mt-3"
      >
        Editar
      </button>
    </div>
  );
}
