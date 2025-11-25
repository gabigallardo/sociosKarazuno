import React, { useEffect, useState, useContext } from "react";
import { getEventoById } from "../../api/eventos.api";
import { getAllUsuarios } from "../../api/usuarios.api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserContext } from "../../contexts/User.Context";
import { FaFilePdf, FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaUserTie, FaMoneyBillWave, FaBus, FaBed, FaUtensils, FaCheckCircle, FaRegCircle } from "react-icons/fa";

import { generarReportePDF } from "../../utils/pdfUtils"; 
import PlantillaEventoPDF from "../../components/Reporte/PlantillaEventoPDF"; 

// Componente interno para el Checklist
const ChecklistItem = ({ label, costo, aPagarA, pagado, onChange, icon, findUserName }) => {
    if (!costo || costo <= 0) return null;
    
    return (
        <div 
            onClick={onChange}
            className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 flex items-center justify-between group ${pagado ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-red-300 hover:bg-red-50'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${pagado ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 group-hover:text-red-500'}`}>
                    {icon}
                </div>
                <div>
                    <p className={`font-bold text-sm ${pagado ? 'text-green-800' : 'text-gray-800'}`}>{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        ${new Intl.NumberFormat('es-AR').format(costo)} • Pagar a: <span className="font-medium">{findUserName(aPagarA)}</span>
                    </p>
                </div>
            </div>
            <div className="text-2xl">
                {pagado ? <FaCheckCircle className="text-green-500" /> : <FaRegCircle className="text-gray-300 group-hover:text-red-400" />}
            </div>
        </div>
    );
};

const ChecklistPagosSocio = ({ evento, findUserName, userId }) => {
  const storageKey = `checklist-user${userId}-event${evento.id}`;

  const [pagos, setPagos] = useState(() => {
    try {
      const datosGuardados = localStorage.getItem(storageKey);
      return datosGuardados ? JSON.parse(datosGuardados) : { inscripcion: false, transporte: false, hospedaje: false, comida: false };
    } catch (error) {
      return { inscripcion: false, transporte: false, hospedaje: false, comida: false };
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(pagos));
  }, [pagos, storageKey]);

  const togglePago = (key) => setPagos(prev => ({ ...prev, [key]: !prev[key] }));

  // Calcular progreso
  const items = [
    { key: 'inscripcion', costo: evento.costo },
    { key: 'transporte', costo: evento.costo_viaje },
    { key: 'hospedaje', costo: evento.costo_hospedaje },
    { key: 'comida', costo: evento.costo_comida }
  ].filter(i => i.costo > 0);
  
  const completedCount = items.filter(i => pagos[i.key]).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 bg-gray-900 text-white">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold">Mi Checklist de Viaje</h2>
            <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">{Math.round(progress)}% Completo</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
      </div>
      
      <div className="p-5 space-y-3">
        <ChecklistItem 
            label="Inscripción" 
            costo={evento.costo} 
            aPagarA={evento.pago_inscripcion_a} 
            pagado={pagos.inscripcion} 
            onChange={() => togglePago('inscripcion')}
            icon={<FaMoneyBillWave />}
            findUserName={findUserName}
        />
        <ChecklistItem 
            label="Transporte" 
            costo={evento.costo_viaje} 
            aPagarA={evento.pago_transporte_a} 
            pagado={pagos.transporte} 
            onChange={() => togglePago('transporte')}
            icon={<FaBus />}
            findUserName={findUserName}
        />
        <ChecklistItem 
            label="Hospedaje" 
            costo={evento.costo_hospedaje} 
            aPagarA={evento.pago_hospedaje_a} 
            pagado={pagos.hospedaje} 
            onChange={() => togglePago('hospedaje')}
            icon={<FaBed />}
            findUserName={findUserName}
        />
        <ChecklistItem 
            label="Comida" 
            costo={evento.costo_comida} 
            aPagarA={evento.pago_comida_a} 
            pagado={pagos.comida} 
            onChange={() => togglePago('comida')}
            icon={<FaUtensils />}
            findUserName={findUserName}
        />
      </div>
    </div>
  );
};

export default function EventosIdPage() {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const esSocioUnicamente = user?.roles?.includes('socio') && !user?.roles?.some(r => ['admin', 'profesor', 'dirigente'].includes(r));
    const puedeGestionar = user?.roles?.some(r => ['admin', 'profesor', 'dirigente'].includes(r));

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [eventoData, usuariosData] = await Promise.all([
                    getEventoById(id),
                    getAllUsuarios(),
                ]);
                
                if (!eventoData) {
                    setError("El evento no existe.");
                    toast.error("Evento no encontrado");
                    navigate("/eventos");
                } else {
                    setEvento(eventoData);
                    setUsuarios(usuariosData);
                }
            } catch (err) {
                setError("Error al cargar datos.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, navigate]);
    
    const findUserName = (userOrId) => {
        if (!userOrId) return "No asignado";
        if (typeof userOrId === 'object' && userOrId.nombre) return `${userOrId.nombre} ${userOrId.apellido}`;
        const foundUser = usuarios.find(u => u.id === userOrId);
        return foundUser ? `${foundUser.nombre} ${foundUser.apellido}` : "Usuario desconocido";
    };

    const handleDescargarInfo = () => {
        if (!evento) return;
        const nombreArchivo = `Info_${evento.titulo.replace(/\s+/g, '_')}.pdf`;
        generarReportePDF('plantilla-info-evento', nombreArchivo);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div></div>;
    if (error) return <div className="text-center p-10 text-red-600 font-bold">{error}</div>;
    if (!evento) return null;

    return (
        <div className="max-w-5xl mx-auto my-8 px-4">
            {/* Botón volver */}
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-red-700 font-medium mb-6 transition-colors">
                <FaArrowLeft className="mr-2" /> Volver a la lista
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMNA IZQUIERDA: Detalles Principales */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <span className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                            {evento.tipo}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{evento.titulo}</h1>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><FaCalendarAlt /></div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold">Fecha y Hora</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(evento.fecha_inicio).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })}
                                    </p>
                                    <p className="text-xs text-gray-500">hasta {new Date(evento.fecha_fin).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><FaMapMarkerAlt /></div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold">Ubicación</p>
                                    <p className="text-gray-900 font-medium">{evento.lugar}</p>
                                </div>
                            </div>

                            {evento.organizador && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><FaUserTie /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-semibold">Organizador</p>
                                        <p className="text-gray-900 font-medium">{findUserName(evento.organizador)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="prose prose-red max-w-none bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-gray-800 font-bold mb-2">Sobre este evento</h3>
                            <p className="text-gray-600">{evento.descripcion || "Sin descripción detallada."}</p>
                        </div>
                    </div>

                    {/* Sección de Gestión para Admins (Profesores a cargo y costos) */}
                    {!esSocioUnicamente && evento.tipo === 'viaje' && (
                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaMoneyBillWave className="text-green-600" /> Detalles de Gestión (Admin)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Costo Inscripción</p>
                                    <p className="font-bold text-gray-900">${evento.costo}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Costo Transporte</p>
                                    <p className="font-bold text-gray-900">${evento.costo_viaje}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-2">Profesores a Cargo:</p>
                                <div className="flex flex-wrap gap-2">
                                    {evento.profesores_a_cargo?.length > 0 ? (
                                        evento.profesores_a_cargo.map(prof => (
                                            <span key={prof.id || prof} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                                                {findUserName(prof)}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Sin asignar</span>
                                    )}
                                </div>
                            </div>
                         </div>
                    )}
                </div>

                {/* COLUMNA DERECHA: Acciones y Checklist */}
                <div className="space-y-6">
                    
                    {/* Acciones Rápidas */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-gray-900 font-bold mb-4">Acciones</h3>
                        <div className="flex flex-col gap-3">
                             <button
                                onClick={handleDescargarInfo}
                                className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 border border-red-100"
                            >
                                <FaFilePdf /> Ficha Técnica
                            </button>
                            {puedeGestionar && (
                                <button 
                                    onClick={() => navigate(`/eventos/editar/${evento.id}`)} 
                                    className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-3 rounded-xl font-semibold transition-colors border border-yellow-100"
                                >
                                    Editar Evento
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Checklist solo para socios en viajes */}
                    {esSocioUnicamente && evento.tipo === 'viaje' && (
                        <ChecklistPagosSocio evento={evento} findUserName={findUserName} userId={user.id} />
                    )}

                </div>
            </div>

            {/* Elemento oculto para PDF */}
            <div className="absolute -left-[9999px]">
                 <PlantillaEventoPDF id="plantilla-info-evento" evento={evento} usuarios={usuarios} />
            </div>
        </div>
    );
}