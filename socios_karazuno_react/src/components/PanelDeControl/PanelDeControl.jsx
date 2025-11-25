import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserPlus, 
  FaCalendarPlus, 
  FaClipboardList, 
  FaChartLine, 
  FaIdCard 
} from 'react-icons/fa';

// Importamos las APIs
import { getAllSocios } from '../../api/socios.api';
import { getAllEventos } from '../../api/eventos.api';

// Componente reutilizable mejorado
import ProximosEventos from '../ProximosEventos/ProximosEventos';

function PanelDeControl({ nombreUsuario }) {
  const [stats, setStats] = useState({
    totalSocios: 0,
    sociosActivos: 0,
    totalEventos: 0
  });
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtenemos datos reales para el dashboard
        const sociosData = await getAllSocios();
        const eventosData = await getAllEventos();

        // Calculamos métricas simples
        const activos = sociosData.filter(s => s.estado === 'activo').length;

        setStats({
          totalSocios: sociosData.length,
          sociosActivos: activos,
          totalEventos: eventosData.length
        });
        setEventos(eventosData);
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
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 group-hover:text-red-700">{label}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Encabezado de Bienvenida */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        {/* Elemento decorativo de fondo */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            ¡Hola, {nombreUsuario}! 👋
          </h1>
          <p className="text-red-100 text-lg opacity-90 max-w-2xl">
            Bienvenido al panel de administración de Karazuno. Aquí tienes un resumen de la actividad del club hoy.
          </p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0">
          <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold border border-white/30">
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
          color="bg-blue-500" 
          subtext={`${stats.sociosActivos} activos actualmente`}
        />
        <StatCard 
          title="Eventos Creados" 
          value={stats.totalEventos} 
          icon={FaChartLine} 
          color="bg-purple-500" 
          subtext="En el historial del club"
        />
        <StatCard 
          title="Cuotas Pendientes" 
          value="--" 
          icon={FaClipboardList} 
          color="bg-orange-500" 
          subtext="Consultar gestión de pagos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal: Accesos Rápidos */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-l-4 border-red-600 pl-3">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <ActionButton 
              to="/hacerse-socio" 
              icon={FaUserPlus} 
              label="Nuevo Socio" 
              desc="Registrar inscripción" 
            />
            <ActionButton 
              to="/eventos/create" 
              icon={FaCalendarPlus} 
              label="Crear Evento" 
              desc="Agendar nueva actividad" 
            />
            <ActionButton 
              to="/control-acceso" 
              icon={FaIdCard} 
              label="Control Acceso" 
              desc="Escanear código QR" 
            />
            <ActionButton 
              to="/socios" 
              icon={FaUsers} 
              label="Gestionar Socios" 
              desc="Ver listado completo" 
            />
            <ActionButton 
              to="/eventos" 
              icon={FaClipboardList} 
              label="Ver Agenda" 
              desc="Gestionar eventos" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelDeControl;