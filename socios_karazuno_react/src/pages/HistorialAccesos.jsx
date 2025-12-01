import React, { useEffect, useState } from 'react';
import { getHistorialAccesos } from '../api/socios.api'; // Asegúrate de que el nombre del archivo coincida exactamente
import { FaCheck, FaTimes, FaArrowLeft, FaHistory, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function HistorialAccesosPage() {
    const [historial, setHistorial] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        cargarHistorial();
        // Auto-refresh cada 10 segundos
        const intervalo = setInterval(cargarHistorial, 10000);
        return () => clearInterval(intervalo);
    }, []);

    const cargarHistorial = async () => {
        try {
   
            const data = await getHistorialAccesos();
            
            if (Array.isArray(data)) {
                setHistorial(data);
            } else if (data && Array.isArray(data.results)) {
                setHistorial(data.results);
            } else {
                console.warn("Formato de historial desconocido:", data);
                setHistorial([]); 
            }
        } catch (error) {
            console.error("Error cargando historial", error);
            setHistorial([]);
        }
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return { hora: '--:--', dia: '--/--/----' };
        const fecha = new Date(fechaString);
        return {
            hora: fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dia: fecha.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })
        };
    };

    return (
        <div className="min-h-screen bg-black p-6 flex flex-col items-center">
            {/* Cabecera Fija */}
            <div className="w-full max-w-3xl flex justify-between items-center mb-10 sticky top-0 bg-black/90 backdrop-blur-md z-20 py-4 border-b border-white/10">
                <button 
                    onClick={() => navigate('/control-acceso')}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
                >
                    <FaArrowLeft /> Volver
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <FaHistory className="text-blue-400"/> Historial de Accesos
                </h1>
                <div className="w-24"></div>
            </div>

            {/* Contenedor Timeline */}
            <div className="w-full max-w-3xl relative pb-20">
                {/* Línea vertical central */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-slate-700 rounded-full"></div>

                <div className="space-y-8">
                    {Array.isArray(historial) && historial.map((item, index) => {
                        const { hora, dia } = formatearFecha(item.fecha_hora);
                        const esAprobado = item.estado === 'aprobado';

                        return (
                            <div key={item.id || index} className="relative flex flex-col md:flex-row items-center md:justify-between group animate-fade-in-up">
                                
                                {/* Fecha/Hora */}
                                <div className="w-full md:w-5/12 md:text-right pl-12 md:pl-0 md:pr-8 mb-2 md:mb-0">
                                    <p className="text-xl md:text-2xl font-bold text-slate-200 font-mono">{hora}</p>
                                    <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">{dia}</p>
                                </div>

                                {/* Punto Central e Icono */}
                                <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center top-0 md:top-auto">
                                    <div className={`
                                        w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg z-10
                                        ${esAprobado ? 'bg-emerald-500' : 'bg-rose-500'}
                                    `}>
                                        {esAprobado ? <FaCheck className="text-white text-xs md:text-sm" /> : <FaTimes className="text-white text-xs md:text-sm" />}
                                    </div>
                                </div>

                                {/* Detalles */}
                                <div className="w-full md:w-5/12 pl-12 md:pl-8">
                                    <div className={`
                                        p-4 rounded-xl border backdrop-blur-sm shadow-xl transition-all hover:scale-[1.02]
                                        ${esAprobado 
                                            ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 border-emerald-500/30' 
                                            : 'bg-gradient-to-br from-rose-500/10 to-rose-900/20 border-rose-500/30'}
                                    `}>
                                        <h3 className="text-lg font-bold text-white truncate capitalize">
                                            {item.nombre_usuario}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${esAprobado ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                                {esAprobado ? 'PERMITIDO' : 'DENEGADO'}
                                            </span>
                                        </div>
                                        <p className={`mt-2 text-sm font-medium flex items-center gap-2 ${esAprobado ? 'text-emerald-200/80' : 'text-rose-200/80'}`}>
                                            {esAprobado ? <FaCheckCircle/> : <FaTimesCircle/>}
                                            {item.motivo || (esAprobado ? 'Cuota al día' : 'Sin motivo especificado')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {Array.isArray(historial) && historial.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-slate-500 bg-slate-800/50 inline-block px-6 py-3 rounded-xl border border-white/5">
                                No hay registros de acceso aún.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}