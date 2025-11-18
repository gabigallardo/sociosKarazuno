import { useEffect, useState, useContext } from "react";
import { getEventoById } from "../../api/eventos.api";
import { getAllUsuarios } from "../../api/usuarios.api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserContext } from "../../contexts/User.Context";
import { FaFilePdf } from "react-icons/fa";

import { generarReportePDF } from "../../utils/pdfUtils"; 
import PlantillaEventoPDF from "../../components/Reporte/PlantillaEventoPDF"; 

const ChecklistPagosSocio = ({ evento, findUserName, userId }) => {
  const storageKey = `checklist-user${userId}-event${evento.id}`;

  const [pagos, setPagos] = useState(() => {
    try {
      const datosGuardados = localStorage.getItem(storageKey);
      return datosGuardados ? JSON.parse(datosGuardados) : { inscripcion: false, transporte: false, hospedaje: false, comida: false };
    } catch (error) {
      console.error("Error al leer de localStorage", error);
      return { inscripcion: false, transporte: false, hospedaje: false, comida: false };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(pagos));
    } catch (error) {
      console.error("Error al guardar en localStorage", error);
    }
  }, [pagos, storageKey]);

  const handlePagoChange = (pago) => {
    setPagos(prev => ({ ...prev, [pago]: !prev[pago] }));
  };

  const pagosData = [
    { key: 'inscripcion', label: 'Inscripción', costo: evento.costo, a_pagar: evento.pago_inscripcion_a },
    { key: 'transporte', label: 'Transporte', costo: evento.costo_viaje, a_pagar: evento.pago_transporte_a },
    { key: 'hospedaje', label: 'Hospedaje', costo: evento.costo_hospedaje, a_pagar: evento.pago_hospedaje_a },
    { key: 'comida', label: 'Comida', costo: evento.costo_comida, a_pagar: evento.pago_comida_a },
  ];

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 animate-fade-in">
      <h2 className="text-xl font-bold mb-3 text-gray-800">Mi Checklist de Pagos</h2>
      <ul className="space-y-3">
        {pagosData.map(pago => (
          pago.costo > 0 && (
            <li key={pago.key} className="flex items-center">
              <input
                type="checkbox"
                id={pago.key}
                checked={pagos[pago.key]}
                onChange={() => handlePagoChange(pago.key)}
                className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor={pago.key} className={`ml-3 text-gray-700 transition-colors ${pagos[pago.key] ? 'line-through text-gray-400' : ''}`}>
                <strong>{pago.label}:</strong> ${new Intl.NumberFormat('es-AR').format(pago.costo || 0)} - Pagar a: <strong>{findUserName(pago.a_pagar)}</strong>
              </label>
            </li>
          )
        ))}
      </ul>
    </div>
  );
};

export default function EventosIdPage() {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [showManage, setShowManage] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const esSocioUnicamente = user?.roles?.includes('socio') && !user?.roles?.includes('admin') && !user?.roles?.includes('profesor') && !user?.roles?.includes('dirigente');
    const puedeGestionar = user?.roles?.includes('admin') || user?.roles?.includes('profesor') || user?.roles?.includes('dirigente');

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
                    toast.error("El evento no fue encontrado.");
                    navigate("/eventos");
                } else {
                    setEvento(eventoData);
                    setUsuarios(usuariosData);
                }
            } catch (err) {
                setError("Ocurrió un error al cargar los datos.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, navigate]);
    
    const findUserName = (userOrId) => {
        if (!userOrId) return <span className="text-gray-500">No asignado</span>;

        if (typeof userOrId === 'object' && userOrId !== null) {
             if (userOrId.nombre) {
                 return `${userOrId.nombre} ${userOrId.apellido}`;
             }
        }

        if (!usuarios.length) return <span className="text-gray-500">Cargando...</span>;

        const idToFind = typeof userOrId === 'object' ? userOrId.id : userOrId;
        const foundUser = usuarios.find(u => u.id === idToFind);
        
        return foundUser ? `${foundUser.nombre} ${foundUser.apellido}` : <span className="text-red-500">Usuario no encontrado</span>;
    };

    // Función para descargar el PDF
    const handleDescargarInfo = () => {
        if (!evento) return;
        const nombreArchivo = `Info_Evento_${evento.titulo.replace(/\s+/g, '_')}.pdf`;
        generarReportePDF('plantilla-info-evento', nombreArchivo);
    };

    if (loading) {
        return <p className="text-center mt-8">Cargando detalles del evento...</p>;
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500 font-semibold">{error}</p>
                <button className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full font-semibold shadow-md" onClick={() => navigate(-1)}>
                    Volver
                </button>
            </div>
        );
    }

    if (!evento) return null;

    return (
        <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md relative">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{evento.titulo}</h1>
            <div className="space-y-3 text-gray-700">
                <p><strong>Tipo:</strong> <span className="capitalize">{evento.tipo}</span></p>
                
                {evento.costo > 0 && (
                    <p><strong>Costo de Inscripción:</strong> ${new Intl.NumberFormat('es-AR').format(evento.costo)}</p>
                )}
                
                <p><strong>Lugar:</strong> {evento.lugar}</p>
                <p><strong>Descripción:</strong> {evento.descripcion || "No hay descripción."}</p>
                <p><strong>Desde:</strong> {new Date(evento.fecha_inicio).toLocaleString()}</p>
                <p><strong>Hasta:</strong> {new Date(evento.fecha_fin).toLocaleString()}</p>
                {evento.organizador && (
                    <p><strong>Organizador:</strong> {findUserName(evento.organizador)}</p>
                )}
            </div>

            {evento.tipo === 'viaje' && (
                <div className="mt-6 border-t pt-4">
                    {esSocioUnicamente ? (
                        <ChecklistPagosSocio evento={evento} findUserName={findUserName} userId={user.id} />
                    ) : (
                        <>
                            <button onClick={() => setShowManage(!showManage)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow-sm w-full text-left">
                                {showManage ? "Ocultar Gestión de Viaje" : "Mostrar Gestión de Viaje"}
                            </button>
                            {showManage && (
                                <div className="mt-4 p-4 border rounded-lg bg-gray-50 animate-fade-in">
                                    <h2 className="text-xl font-bold mb-3 text-gray-800">Desglose de Costos del Viaje</h2>
                                    <ul className="space-y-2 list-disc list-inside">
                                        {evento.costo > 0 && <li><strong>Inscripción:</strong> ${new Intl.NumberFormat('es-AR').format(evento.costo)} - Pagar a: <strong>{findUserName(evento.pago_inscripcion_a)}</strong></li>}
                                        {evento.costo_viaje > 0 && <li><strong>Transporte:</strong> ${new Intl.NumberFormat('es-AR').format(evento.costo_viaje)} - Pagar a: <strong>{findUserName(evento.pago_transporte_a)}</strong></li>}
                                        {evento.costo_hospedaje > 0 && <li><strong>Hospedaje:</strong> ${new Intl.NumberFormat('es-AR').format(evento.costo_hospedaje)} - Pagar a: <strong>{findUserName(evento.pago_hospedaje_a)}</strong></li>}
                                        {evento.costo_comida > 0 && <li><strong>Comida:</strong> ${new Intl.NumberFormat('es-AR').format(evento.costo_comida)} - Pagar a: <strong>{findUserName(evento.pago_comida_a)}</strong></li>}
                                    </ul>
                                    
                                    <h2 className="text-xl font-bold mt-5 mb-3 text-gray-800">Profesores a Cargo</h2>
                                    <ul className="space-y-1 list-disc list-inside">
                                        {evento.profesores_a_cargo?.length > 0 ? (
                                            evento.profesores_a_cargo.map(prof => (
                                                <li key={prof.id || prof}>{findUserName(prof)}</li>
                                            ))
                                        ) : (
                                            <li className="text-gray-500">No hay profesores asignados.</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="mt-6 flex flex-wrap gap-4 border-t pt-4">
                {puedeGestionar && (
                    <button onClick={() => navigate(`/eventos/editar/${evento.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm">
                        Editar
                    </button>
                )}
                
                <button
                    onClick={handleDescargarInfo}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold shadow-sm flex items-center gap-2"
                    title="Descargar ficha técnica del evento en PDF"
                >
                    <FaFilePdf />
                    Descargar Info
                </button>

                <button onClick={() => navigate(-1)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm">
                    Volver
                </button>
            </div>

            <PlantillaEventoPDF 
                id="plantilla-info-evento" 
                evento={evento} 
                usuarios={usuarios} 
            />

        </div>
    );
}