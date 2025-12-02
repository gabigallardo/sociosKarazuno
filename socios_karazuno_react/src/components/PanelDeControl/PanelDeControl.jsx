import React, { use, useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaCogs, 
  FaRunning, 
  FaIdCard,
  FaUsersCog,
  FaChartLine,
  FaClipboardList,
  FaCalendarCheck
} from 'react-icons/fa';

// Importamos las APIs
import { getAllSocios } from '../../api/socios.api';
import { getAllEventos } from '../../api/eventos.api';

// Importamos el logo (Asegúrate de que la ruta sea correcta)
import logoClub from '../../assets/logo.webp';
import { UserContext } from '../../contexts/User.Context';
import { registrarUsoFeature } from '../../api/usuarios.api';

// Definimos los accesos con un ID único para cada uno
const ACCESOS_BASE = [
  { id: 'calendario_club', to: "/mi-calendario", icon: FaCalendarAlt, label: "Calendario del club", desc: "Ver agenda completa" },
  { id: 'crear_evento', to: "/eventos/crear", icon: FaCalendarCheck, label: "Crear Evento", desc: "Agregar nueva actividad" },
  { id: 'gestion_horarios', to: "/horarios", icon: FaCogs, label: "Gestión horarios", desc: "Agregar, editar y eliminar horarios deportivos" },
  { id: 'panel_jugadores', to: "/jugadores", icon: FaRunning, label: "Panel Jugadores", desc: "Fichas y equipos" },
  { id: 'control_acceso', to: "/control-acceso", icon: FaIdCard, label: "Control Acceso", desc: "Escaner QR Portería" },
];

function PanelDeControl({ nombreUsuario }) {
  const [stats, setStats] = useState({
    totalSocios: 0,
    sociosActivos: 0,
    totalEventos: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [accesosOrdenados, setAccesosOrdenados] = useState(ACCESOS_BASE);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sociosData = await getAllSocios();
        const eventosData = await getAllEventos();

        const activos = sociosData.filter(s => s.estado === 'activo').length;

        setStats({
          totalSocios: sociosData.length,
          sociosActivos: activos,
          totalEventos: eventosData.length
        });
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (user && user.preferencias_gui) {
      const ranking = user.preferencias_gui;
      
      const ordenados = [...ACCESOS_BASE].sort((a, b) => {
        const usoA = ranking[a.id] || 0;
        const usoB = ranking[b.id] || 0;
        return usoB - usoA; // Mayor uso primero
      });
      
      setAccesosOrdenados(ordenados);
    }
  }, [user]);

  // Componente interno para Tarjetas de Estadísticas (KPI)
  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${color} text-white shadow-lg transform -rotate-3`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-800">{loading ? "..." : value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  // Componente ActionButton modificado para manejar el click
  const ActionButton = ({ item }) => (
    <div 
      onClick={() => handleNavigation(item.to, item.id)}
      className="cursor-pointer group bg-white p-5 rounded-xl border border-gray-200 hover:border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-3"
    >
      <div className="p-3 bg-gray-50 text-red-700 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors">
        <item.icon size={24} />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 group-hover:text-red-700">{item.label}</h4>
        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
      </div>
    </div>
  );

  const handleNavigation = (to, id) => {
    // 1. Registramos el uso en la BD (sin await para no bloquear la navegación)
    registrarUsoFeature(id);
    // 2. Navegamos
    navigate(to);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Encabezado de Bienvenida con Logo */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-600 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center relative overflow-hidden gap-6">
        
        {/* Elemento decorativo de fondo */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        


        <div className="relative z-10 flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            ¡Bienvenido de nuevo! 👋
          </h1>
          <p className="text-red-100 text-lg opacity-90">
            Panel de administración oficial del Club Karazuno.
          </p>
        </div>

        <div className="relative z-10 mt-6 md:mt-0">
          <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold border border-white/30 shadow-lg">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Sección de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Socios Totales" 
          value={stats.totalSocios} 
          icon={FaUsers} 
          color="bg-red-600" 
          subtext={`${stats.sociosActivos} activos actualmente`}
        />
        <StatCard 
          title="Eventos Globales" 
          value={stats.totalEventos} 
          icon={FaChartLine} 
          color="bg-red-600" 
          subtext="Actividades registradas"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal: Accesos Rápidos Actualizados */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-l-4 border-red-600 pl-3">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

            {accesosOrdenados.map((acceso) => (
              <ActionButton key={acceso.id} item={acceso} />
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelDeControl;