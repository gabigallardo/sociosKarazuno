import { useEffect, useState } from "react";
import { getAllUsuarios, deleteUsuario } from "../../api/usuarios.api"; //
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaSearch, FaUsers } from "react-icons/fa";
import UsuariosList from "../../features/usuarios/listaUsuarios"; //
import { toast } from "react-hot-toast";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getAllUsuarios();
      setUsuarios(data);
      setFilteredUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast.error("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado en tiempo real
  useEffect(() => {
    const results = usuarios.filter(user => 
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsuarios(results);
  }, [searchTerm, usuarios]);

  const handleEdit = (e, usuario) => {
    e.stopPropagation(); 
    navigate(`/usuarios/editar/${usuario.id}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    
    try {
      await deleteUsuario(id);
      toast.success("Usuario eliminado correctamente");
      fetchUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      toast.error("No se pudo eliminar el usuario.");
    }
  };

  const handleRowClick = (usuario) => {
    navigate(`/usuarios/${usuario.id}`);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 fade-in-enter">
      
      {/* --- Header de la Página --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FaUsers className="text-red-600" /> Gestión de Usuarios
            </h1>
            <p className="text-gray-500 mt-1">Administra el acceso y roles del personal del club.</p>
          </div>
          
          <button
            onClick={() => navigate("/usuarios/crear")}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 font-bold"
          >
            <FaUserPlus /> Nuevo Usuario
          </button>
        </div>

        {/* --- Barra de Búsqueda --- */}
        <div className="mt-6 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Contenido Principal --- */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No se encontraron usuarios</h3>
            <p className="text-gray-500 mt-2">Intenta con otra búsqueda o crea un nuevo usuario.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
             <UsuariosList
                usuarios={filteredUsuarios}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onItemClick={handleRowClick} 
              />
          </div>
        )}
      </div>
    </div>
  );
}