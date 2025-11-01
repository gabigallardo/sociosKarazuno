import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSocios, inactivarSocio, activarSocio, getCuotasPendientes } from "../../api/socios.api";
import ListaSocios from "../../features/socios/listaSocios";
import { FaUsers, FaUserPlus } from "react-icons/fa";
import ModalInactivarSocio from "../../features/socios/modalInactivarSocio";
import ModalActivarSocio from "../../features/socios/modalActivarSocio";
import { toast } from "react-hot-toast";

export default function SociosPage() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modal de inactivación
  const [showModalInactivar, setShowModalInactivar] = useState(false);
  
  // Estados para modal de activación
  const [showModalActivar, setShowModalActivar] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [cuotasPendientes, setCuotasPendientes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  // Cargar todos los socios
  const fetchSocios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSocios();
      setSocios(data);
    } catch (error) {
      console.error("Error cargando socios:", error);
      setError("No se pudieron cargar los socios. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  const handleViewDetail = (socio) => {
    navigate(`/socios/${socio.usuario}`);
  };

  // ==================== INACTIVAR SOCIO ====================
  const handleInactivar = (socio) => {
    setSocioSeleccionado(socio);
    setShowModalInactivar(true);
  };

  const handleConfirmarInactivacion = async (razon) => {
    setIsSubmitting(true);
    try {
      await inactivarSocio(socioSeleccionado.usuario, razon);
      
      toast.success(
        `✅ Socio "${socioSeleccionado.nombre_completo}" ha sido inactivado.`
      );
      
      setShowModalInactivar(false);
      setSocioSeleccionado(null);
      await fetchSocios();

    } catch (error) {
      console.error("Error inactivando socio:", error);
      const errorMsg = error.response?.data?.error || "Error al inactivar el socio";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== ACTIVAR SOCIO ====================
  const handleActivar = async (socio) => {
    setSocioSeleccionado(socio);
    setIsSubmitting(true);
    
    try {
      // Obtener cuotas pendientes
      const cuotas = await getCuotasPendientes(socio.usuario);
      setCuotasPendientes(cuotas);
      setShowModalActivar(true);
    } catch (error) {
      console.error("Error al obtener cuotas pendientes:", error);
      toast.error("❌ Error al obtener cuotas pendientes");
      setSocioSeleccionado(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmarActivacion = async (datoPago) => {
    setIsSubmitting(true);
    try {
      const resultado = await activarSocio(socioSeleccionado.usuario, datoPago);
      
      const pagosMsg = resultado.pagos_registrados > 0 
        ? ` Se registraron ${resultado.pagos_registrados} pago${resultado.pagos_registrados !== 1 ? 's' : ''}.`
        : '';
      
      toast.success(
        `✅ Socio "${socioSeleccionado.nombre_completo}" activado exitosamente.${pagosMsg}`
      );
      
      setShowModalActivar(false);
      setSocioSeleccionado(null);
      setCuotasPendientes([]);
      await fetchSocios();

    } catch (error) {
      console.error("Error activando socio:", error);
      const errorMsg = error.response?.data?.error || "Error al activar el socio";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando socios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchSocios}
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-red-700 flex items-center gap-2">
              <FaUsers />
              Gestión de Socios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra las membresías del club
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/usuarios")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-600 transition"
            >
              Ver Usuarios
            </button>
            <button
              onClick={() => navigate("/hacerse-socio")}
              className="bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-800 transition flex items-center gap-2"
            >
              <FaUserPlus />
              Nuevo Socio
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 font-semibold">Total de Socios</p>
          <p className="text-3xl font-extrabold text-red-700">{socios.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 font-semibold">Socios Activos</p>
          <p className="text-3xl font-extrabold text-green-600">
            {socios.filter(s => s.estado === "activo").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 font-semibold">Socios Inactivos</p>
          <p className="text-3xl font-extrabold text-orange-600">
            {socios.filter(s => s.estado === "inactivo").length}
          </p>
        </div>
      </div>

      {/* Tabla de socios */}
      <ListaSocios 
        socios={socios} 
        onViewDetail={handleViewDetail}
        onInactivar={handleInactivar}
        onActivar={handleActivar}
      />

      {/* Modal de inactivación */}
      <ModalInactivarSocio
        socio={socioSeleccionado}
        isOpen={showModalInactivar}
        onClose={() => {
          setShowModalInactivar(false);
          setSocioSeleccionado(null);
        }}
        onConfirm={handleConfirmarInactivacion}
        loading={isSubmitting}
      />

      {/* Modal de activación */}
      <ModalActivarSocio
        socio={socioSeleccionado}
        cuotasPendientes={cuotasPendientes}
        isOpen={showModalActivar}
        onClose={() => {
          setShowModalActivar(false);
          setSocioSeleccionado(null);
          setCuotasPendientes([]);
        }}
        onConfirm={handleConfirmarActivacion}
        loading={isSubmitting}
      />
    </div>
  );
}