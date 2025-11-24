import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocioById, getCuotasDeSocio, activarSocio, registrarPagoCuotas } from "../../api/socios.api.js";
import { 
  FaUserCircle, FaEnvelope, FaIdCard, FaPhone, FaCheckCircle, 
  FaTimesCircle, FaArrowLeft, FaShieldAlt, FaStar, FaRunning,
  FaTag, FaCalendarTimes, FaInfoCircle, FaFileInvoiceDollar,FaUserEdit, FaMoneyBillWave, FaCopy

} from "react-icons/fa";
import { toast } from "react-hot-toast";
import ModalActivarSocio from "../../features/socios/modalActivarSocio.jsx";
import ModalRegistrarPago from "../../features/socios/modalRegistrarPago.jsx";

// Componente para mostrar un badge de estado visualmente atractivo
const StatusBadge = ({ condition, trueText, falseText, trueColor, falseColor }) => (
  <span className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-2 ${condition ? trueColor : falseColor}`}>
    {condition ? <FaCheckCircle /> : <FaTimesCircle />}
    {condition ? trueText : falseText}
  </span>
);

export default function SocioDetailPage() {
  const { id } = useParams(); // Obtiene el ID del socio desde la URL
  const navigate = useNavigate();
  const [socio, setSocio] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingCuotas, setLoadingCuotas] = useState(true);
  const [showModalActivar, setShowModalActivar] = useState(false);
  const [showModalPago, setShowModalPago] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSocioYCuotas = async () => {
      setLoading(true);
      setError(null);
      try {
        // Primero, obtenemos la información del socio
        const dataSocio = await getSocioById(id);
        setSocio(dataSocio);
        
        // Luego, obtenemos su historial de cuotas
        setLoadingCuotas(true);
        const dataCuotas = await getCuotasDeSocio(id);
        setCuotas(dataCuotas);
        setLoadingCuotas(false);

      } catch (err) {
        console.error("Error cargando datos del socio:", err);
        setError("No se pudo cargar la información. Es posible que el socio no exista o haya ocurrido un error.");
      } finally {
        setLoading(false);
      }
    };
    fetchSocioYCuotas();
  }, [id]);

   // Derivamos las listas de cuotas desde el estado
  const cuotasPendientes = cuotas.filter(c => !c.pagada);
  const cuotasPagadas = cuotas.filter(c => c.pagada);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando información del socio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold text-lg">Error</p>
          <p>{error}</p>
          <button
            onClick={() => navigate("/socios")}
            className="mt-4 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800"
          >
            <FaArrowLeft className="inline mr-2" />
            Volver a la lista de socios
          </button>
        </div>
      </div>
    );
  }

  // --- MANEJADOR INTELIGENTE DEL BOTÓN "PAGAR" ---
    const handleClickPagar = () => {
        if (socio.estado === 'inactivo') {
            // Caso A: Está inactivo -> Usamos flujo de ACTIVACIÓN
            setShowModalActivar(true);
        } else {
            // Caso B: Está activo pero debe -> Usamos flujo de SOLO PAGO
            setShowModalPago(true);
        }
    };

    // Handler para Activar (reutilizando lógica)
    const handleConfirmarActivacion = async (datosPago) => {
        setIsSubmitting(true);
        try {
            await activarSocio(socio.usuario, datosPago);
            toast.success("Socio activado y pagos registrados");
            setShowModalActivar(false);
            // Recargar datos...
            window.location.reload(); // O llamar a fetchSocioYCuotas()
        } catch (error) {
            toast.error("Error al activar");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler para Solo Pagar
    const handleConfirmarPago = async (datosPago) => {
        setIsSubmitting(true);
        try {
            await registrarPagoCuotas(socio.usuario, cuotasPendientes, datosPago);            
            toast.success("Pago registrado exitosamente");
            setShowModalPago(false);
            // Recargar datos...
            window.location.reload(); 
        } catch (error) {
            toast.error("Error al registrar pago");
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            {socio.foto_url ? (
                <img src={socio.foto_url} alt="Perfil" className="w-16 h-16 rounded-full object-cover shadow-sm" />
            ) : (
                <FaUserCircle className="text-6xl text-gray-300" />
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">{socio.nombre_completo}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono">ID: {socio.usuario}</span>
                {socio.nivel_socio_info && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">
                        {socio.nivel_socio_info.descripcion}
                    </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Botón Volver (Secundario) */}
            <button onClick={() => navigate("/socios")} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition" title="Volver">
                <FaArrowLeft />
            </button>

            {/* Acciones Principales */}
            <button
                onClick={() => navigate(`/usuarios/editar/${socio.usuario}`)} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-2">
                <FaUserEdit /> Editar Datos
            </button>
            
            {!socio.cuota_al_dia && (
                <button 
                    onClick={handleClickPagar}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold..."
                >
                    <FaMoneyBillWave /> Registrar Pago
                </button>
            )}
          </div>
        </div>

        {/* Badges de Estado Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatusBadge 
            condition={socio.estado === 'activo'}
            trueText="Socio Activo"
            falseText="Socio Inactivo"
            trueColor="bg-green-100 text-green-800"
            falseColor="bg-orange-100 text-orange-800"
          />
          <StatusBadge 
            condition={socio.cuota_al_dia}
            trueText="Cuota al Día"
            falseText="Posee Deuda"
            trueColor="bg-green-100 text-green-800"
            falseColor="bg-red-100 text-red-800"
          />
        </div>

        {/* Contenedor de tarjetas de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta de Información Personal */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Información Personal</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3 group"><FaEnvelope className="text-red-600" />
                 <a href={`mailto:${socio.email}`} className="hover:text-red-700 hover:underline transition"> {socio.email} </a>
                {/* Botón fantasma que aparece al hacer hover */}
                <button 
                    onClick={() => {navigator.clipboard.writeText(socio.email); toast.success("Email copiado")}}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 text-xs"
                    title="Copiar email"
                >
                    <FaCopy />
                </button></li>
              <li className="flex items-center gap-3"><FaIdCard className="text-red-600" /> <span>{socio.nro_documento}</span></li>
              <li className="flex items-center gap-3"><FaPhone className="text-red-600" /> <span>{socio.telefono || 'No especificado'}</span></li>
            </ul>
          </div>

          {/* Tarjeta de Información de Membresía */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Membresía</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3"><FaStar className="text-yellow-500" /> <span>Nivel: <strong>{socio.nivel_socio_info?.nivel} ({socio.nivel_socio_info?.descripcion})</strong></span></li>
              <li className="flex items-center gap-3"><FaRunning className="text-blue-500" /> <span>Disciplina: <strong>{socio.disciplina_nombre || 'No asignada'}</strong></span></li>
              <li className="flex items-center gap-3"><FaTag className="text-green-500" /> <span>Categoría: <strong>{socio.categoria_nombre || 'No asignada'}</strong></span></li>
            </ul>
          </div>

          {/*  TARJETA DE HISTORIAL DE CUOTAS  */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
              <FaFileInvoiceDollar />
              Historial de Cuotas
            </h2>
            {loadingCuotas ? (
              <p className="text-gray-500">Cargando historial de cuotas...</p>
            ) : cuotas.length === 0 ? (
              <p className="text-gray-500 p-4 bg-gray-50 rounded-md">Este socio no tiene cuotas generadas.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Columna de Cuotas Pendientes */}
                <div>
                  <div className="flex justify-between items-end mb-2 border-b border-yellow-200 pb-1">
                    <h3 className="font-semibold text-yellow-800">
                        Pendientes ({cuotasPendientes.length})
                    </h3>
                    {cuotasPendientes.length > 0 && (
                        <span className="font-bold text-red-700 text-sm bg-red-50 px-2 py-0.5 rounded">
                            Deuda Total: {
                                cuotasPendientes.reduce((sum, c) => sum + Number(c.monto), 0)
                                .toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
                            }
                        </span>
                    )}
                  </div>

                  {cuotasPendientes.length > 0 ? (
                    <div className="space-y-2 bg-yellow-50 p-3 rounded-md border border-yellow-200 max-h-40 overflow-y-auto">
                      {cuotasPendientes.map(cuota => (
                        <div key={cuota.id} className="flex justify-between text-sm border-b border-yellow-200 pb-1">
                          <span className="text-gray-600 font-medium">Período: {cuota.periodo}</span>
                          <span className="font-bold text-yellow-700">
                            {Number(cuota.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-700 p-3 bg-green-50 rounded-md border border-green-200">No hay cuotas pendientes.</p>
                  )}
                </div>

                {/* Columna de Historial de Pagos */}
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Historial de Pagos ({cuotasPagadas.length})</h3>
                  {cuotasPagadas.length > 0 ? (
                    <div className="space-y-2 bg-blue-50 p-3 rounded-md border border-blue-200 max-h-40 overflow-y-auto">
                      {cuotasPagadas.map(cuota => (
                        <div key={cuota.id} className="flex justify-between text-sm border-b border-blue-200 pb-1">
                          <span className="text-gray-600 font-medium">Período: {cuota.periodo}</span>
                          <span className="font-semibold text-blue-700">
                            {Number(cuota.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md border border-gray-200">No se han registrado pagos.</p>
                  )}
                </div>

              </div>
            )}
          </div>          

          {/* Tarjeta de Estado de Cuenta (Condicional) */}
          {socio.estado === 'inactivo' && (
            <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200 md:col-span-2">
              <h2 className="text-xl font-bold text-orange-800 mb-4 border-b border-orange-200 pb-2">Estado de la Cuenta</h2>
              <ul className="space-y-3 text-orange-700">
                <li className="flex items-start gap-3">
                  <FaCalendarTimes className="text-orange-600 mt-1" /> 
                  <div>
                    <span>Fecha de Inactivación:</span><br/>
                    <strong className="text-lg">
                      {new Date(socio.fecha_inactivacion).toLocaleString('es-AR', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </strong>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaInfoCircle className="text-orange-600 mt-1" />
                  <div>
                    <span>Motivo de Inactivación:</span><br/>
                    <strong className="text-lg">{socio.razon_inactivacion}</strong>
                  </div>
                </li>
              </ul>
            </div>
          )}

        </div>
      </div>
      <ModalActivarSocio 
                socio={socio}
                cuotasPendientes={cuotasPendientes}
                isOpen={showModalActivar}
                onClose={() => setShowModalActivar(false)}
                onConfirm={handleConfirmarActivacion}
                loading={isSubmitting}
            />

            <ModalRegistrarPago
                socio={socio}
                cuotasPendientes={cuotasPendientes}
                isOpen={showModalPago}
                onClose={() => setShowModalPago(false)}
                onConfirm={handleConfirmarPago}
                loading={isSubmitting}
            />
    </div>
  );
}