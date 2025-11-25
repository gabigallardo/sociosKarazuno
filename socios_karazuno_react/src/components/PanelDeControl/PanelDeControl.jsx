import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaCogs, 
  FaRunning, 
  FaIdCard,
  FaUsersCog,
  FaChartLine,
  FaClipboardList
} from 'react-icons/fa';

// Importamos las APIs
import { getAllSocios } from '../../api/socios.api';
import { getAllEventos } from '../../api/eventos.api';

// Importamos el logo (Asegúrate de que la ruta sea correcta)
import logoClub from '../../assets/logo.webp';

function PanelDeControl({ nombreUsuario }) {
  const [stats, setStats] = useState({
    totalSocios: 0,
    sociosActivos: 0,
    totalEventos: 0
  });
  const [loading, setLoading] = useState(true);

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

  // Componente interno para Botones de Acción Rápida
  const ActionButton = ({ to, icon: Icon, label, desc }) => (
    <Link 
      to={to} 
      className="group bg-white p-5 rounded-xl border border-gray-200 hover:border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-3"
    >
      <div className="p-3 bg-gray-50 text-red-700 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 group-hover:text-red-700">{label}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Encabezado de Bienvenida con Logo */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-600 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center relative overflow-hidden gap-6">
        
        {/* Elemento decorativo de fondo */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        {/* Escudo del equipo */}
        <div className="relative z-10 flex-shrink-0">
            <img 
                src={logoClub} 
                alt="Escudo Karazuno" 
                className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl filter brightness-110" 
            />
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            ¡Hola, {nombreUsuario}! 👋
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Socios Totales" 
          value={stats.totalSocios} 
          icon={FaUsers} 
          color="bg-blue-600" 
          subtext={`${stats.sociosActivos} activos actualmente`}
        />
        <StatCard 
          title="Eventos Globales" 
          value={stats.totalEventos} 
          icon={FaChartLine} 
          color="bg-purple-600" 
          subtext="Actividades registradas"
        />
        <StatCard 
          title="Estado Financiero" 
          value="--" 
          icon={FaClipboardList} 
          color="bg-emerald-600" 
          subtext="Gestión de cuotas al día"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal: Accesos Rápidos Actualizados */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-l-4 border-red-600 pl-3">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

            {/* 1. Calendario del Club */}
            <ActionButton 
              to="/mi-calendario" 
              icon={FaCalendarAlt} 
              label="Calendario Club" 
              desc="Ver agenda completa" 
            />

            {/* 2. Gestionar Usuarios */}
            <ActionButton 
              to="/gestionar-usuarios" 
              icon={FaUsersCog} 
              label="Gestionar Usuarios" 
              desc="Roles y permisos" 
            />

            {/* 3. Gestión del Club */}
            <ActionButton 
              to="/gestion-club" 
              icon={FaCogs} 
              label="Gestión del Club" 
              desc="Deportes y horarios" 
            />

            {/* 4. Panel de Jugadores */}
            <ActionButton 
              to="/jugadores" 
              icon={FaRunning} 
              label="Panel Jugadores" 
              desc="Fichas y equipos" 
            />

            {/* 5. Control de Acceso */}
            <ActionButton 
              to="/control-acceso" 
              icon={FaIdCard} 
              label="Control Acceso" 
              desc="Escaner QR Portería" 
            />

          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelDeControl;