import { useEffect, useState } from "react";
import { getUsuarioById } from "../../api/usuarios.api"; //
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaEnvelope, FaIdCard, FaUserShield, FaUser } from "react-icons/fa";

export default function UsuarioIdPage() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUsuario() {
      try {
        const data = await getUsuarioById(id);
        setUsuario(data);
      } catch (error) {
        console.error("Error al cargar usuario", error);
      } finally {
        setLoading(false);
      }
    }
    loadUsuario();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando perfil...</div>;
  if (!usuario) return <div className="min-h-screen flex items-center justify-center text-red-500">Usuario no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center fade-in-enter">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
        
        {/* --- Header con Fondo --- */}
        <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800 relative">
            <button 
                onClick={() => navigate("/usuarios")} 
                className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10"
            >
                <FaArrowLeft />
            </button>
            <button 
                onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                className="absolute top-6 right-6 bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 z-10 text-sm"
            >
                <FaEdit /> Editar
            </button>
        </div>

        {/* --- Foto y Datos Principales --- */}
        <div className="px-8 pb-8 relative">
            <div className="relative -mt-16 mb-6 flex justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gray-200 overflow-hidden">
                    {usuario.foto_url ? (
                        <img src={usuario.foto_url} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <FaUser className="text-5xl" />
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-1">
                    {usuario.nombre} {usuario.apellido}
                </h1>
                <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {usuario.roles && usuario.roles.length > 0 ? usuario.roles[0] : "Sin Rol"}
                </span>
            </div>

            {/* --- Grid de Detalles --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-100 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-red-600">
                            <FaEnvelope />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                    </div>
                    <p className="text-gray-900 font-semibold break-all">{usuario.email}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-100 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-red-600">
                            <FaIdCard />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">DNI</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{usuario.nro_documento || "No registrado"}</p>
                </div>

                <div className="col-span-1 md:col-span-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-100 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-red-600">
                            <FaUserShield />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ID Sistema</span>
                    </div>
                    <p className="text-gray-900 font-mono text-sm">{usuario.id}</p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}