import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSocios, inactivarSocio, activarSocio, getCuotasPendientes } from "../../api/socios.api";
import ListaSocios from "../../features/socios/listaSocios";
import { FaUsers, FaUserPlus, FaUserCheck, FaUserTimes } from "react-icons/fa";
import ModalInactivarSocio from "../../features/socios/modalInactivarSocio";
import ModalActivarSocio from "../../features/socios/modalActivarSocio";
import { toast } from "react-hot-toast";

export default function SociosPage() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados modales
  const [showModalInactivar, setShowModalInactivar] = useState(false);
  const [showModalActivar, setShowModalActivar] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [cuotasPendientes, setCuotasPendientes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchSocios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSocios();
      setSocios(data);
    } catch (error) {
      console.error("Error cargando socios:", error);
      setError("No se pudieron cargar los socios. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  const handleViewDetail = (socio) => navigate(`/socios/${socio.usuario}`);

  // --- Lógica Inactivar ---
  const handleInactivar = (socio) => {
    setSocioSeleccionado(socio);
    setShowModalInactivar(true);
  };

  const handleConfirmarInactivacion = async (razon) => {
    setIsSubmitting(true);
    try {
      await inactivarSocio(socioSeleccionado.usuario, razon);
      toast.success(`✅ Socio "${socioSeleccionado.nombre_completo}" inactivado.`);
      setShowModalInactivar(false);
      setSocioSeleccionado(null);
      await fetchSocios();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error al inactivar";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Lógica Activar ---
  const handleActivar = async (socio) => {
    setSocioSeleccionado(socio);
    setIsSubmitting(true);
    try {
      const cuotas = await getCuotasPendientes(socio.usuario);
      setCuotasPendientes(cuotas);
      setShowModalActivar(true);
    } catch (error) {
      toast.error("❌ Error al obtener datos del socio");
      setSocioSeleccionado(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmarActivacion = async (datoPago) => {
    setIsSubmitting(true);
    try {
      const res = await activarSocio(socioSeleccionado.usuario, datoPago);
      const msg = res.pagos_registrados > 0 ? ` (${res.pagos_registrados} pagos)` : '';
      toast.success(`✅ Socio activado exitosamente${msg}`);
      setShowModalActivar(false);
      setSocioSeleccionado(null);
      setCuotasPendientes([]);
      await fetchSocios();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error al activar";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Cargando directorio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 shadow-sm">
          <p className="text-lg font-bold mb-2">Ocurrió un problema</p>
          <p>{error}</p>
          <button onClick={fetchSocios} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Cálculos para tarjetas
  const totalSocios = socios.length;
  const activos = socios.filter(s => s.estado === 'activo').length;
  const inactivos = socios.filter(s => s.estado === 'inactivo').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gray-50/50">
      
      {/* Header y Acciones Principales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Socios</h1>
          <p className="text-gray-500 mt-1">Administración integral de membresías del club</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/usuarios")}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition"
          >
            Ver Usuarios
          </button>
  
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Socios" 
          value={totalSocios} 
          icon={<FaUsers className="text-blue-600" />} 
          color="bg-blue-50 border-blue-100" 
        />
        <StatCard 
          title="Activos" 
          value={activos} 
          icon={<FaUserCheck className="text-emerald-600" />} 
          color="bg-emerald-50 border-emerald-100" 
        />
        <StatCard 
          title="Inactivos" 
          value={inactivos} 
          icon={<FaUserTimes className="text-gray-500" />} 
          color="bg-gray-100 border-gray-200" 
        />
      </div>

      {/* Componente de Lista */}
      <ListaSocios 
        socios={socios} 
        onViewDetail={handleViewDetail}
        onInactivar={handleInactivar}
        onActivar={handleActivar}
      />

      {/* Modales */}
      <ModalInactivarSocio
        socio={socioSeleccionado}
        isOpen={showModalInactivar}
        onClose={() => { setShowModalInactivar(false); setSocioSeleccionado(null); }}
        onConfirm={handleConfirmarInactivacion}
        loading={isSubmitting}
      />

      <ModalActivarSocio
        socio={socioSeleccionado}
        cuotasPendientes={cuotasPendientes}
        isOpen={showModalActivar}
        onClose={() => { setShowModalActivar(false); setSocioSeleccionado(null); setCuotasPendientes([]); }}
        onConfirm={handleConfirmarActivacion}
        loading={isSubmitting}
      />
    </div>
  );
}

// Componente pequeño auxiliar para las tarjetas
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${color}`}>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-white bg-opacity-60 rounded-lg text-xl">
        {icon}
      </div>
    </div>
  );
}