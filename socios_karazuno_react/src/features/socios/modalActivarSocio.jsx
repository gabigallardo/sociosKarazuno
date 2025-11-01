import { useState, useEffect } from "react";
import { FaCheckCircle, FaTimes, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";

export default function ModalActivarSocio({ socio, cuotasPendientes, isOpen, onClose, onConfirm, loading }) {
  const [medioPago, setMedioPago] = useState("efectivo");
  const [comprobante, setComprobante] = useState("");
  const [error, setError] = useState("");
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMedioPago("efectivo");
        setComprobante("");
        setError("");
        setMostrarDetalles(false);
      }, 200);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!medioPago.trim()) {
      setError("Debe seleccionar un medio de pago");
      return;
    }
    
    setError("");
    onConfirm({ medio_pago: medioPago, comprobante });
  };

  if (!isOpen || !socio) return null;

  const totalDeuda = cuotasPendientes?.reduce((sum, c) => sum + c.monto, 0) || 0;
  const hayDeuda = cuotasPendientes && cuotasPendientes.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50 sticky top-0">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-2xl text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-green-700">Activar Socio</h2>
              <p className="text-xs text-green-600">{socio.nombre_completo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* Info del Socio */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-1">
              <strong>Socio:</strong> {socio.nombre_completo}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {socio.email}
            </p>
          </div>

          {/* Deuda pendiente */}
          {hayDeuda ? (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FaExclamationTriangle className="text-yellow-600" />
                <p className="text-sm font-semibold text-yellow-800">
                  Cuotas Pendientes a Pagar
                </p>
              </div>
              
              {/* Toggle para mostrar/ocultar detalles */}
              <button
                onClick={() => setMostrarDetalles(!mostrarDetalles)}
                className="text-xs text-yellow-700 hover:text-yellow-900 font-semibold mb-2"
              >
                {mostrarDetalles ? "▼ Ocultar detalles" : "▶ Ver detalles"}
              </button>

              {/* Detalles de cuotas */}
              {mostrarDetalles && (
                <div className="bg-white rounded p-3 mb-3 max-h-40 overflow-y-auto border border-yellow-200">
                  <div className="space-y-2">
                    {cuotasPendientes.map((cuota) => (
                      <div key={cuota.id} className="flex justify-between text-sm border-b border-yellow-100 pb-1">
                        <span className="text-gray-600 font-medium">{cuota.periodo}</span>
                        <span className="font-bold text-yellow-700">${cuota.monto.toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total a pagar */}
              <div className="bg-white rounded p-3 border-2 border-yellow-400">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total a pagar:</span>
                  <span className="text-2xl font-extrabold text-yellow-700">
                    ${totalDeuda.toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  {cuotasPendientes.length} cuota{cuotasPendientes.length !== 1 ? 's' : ''} pendiente{cuotasPendientes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <FaCheckCircle className="inline mr-2 text-green-600" />
                <strong>Sin deuda pendiente.</strong> El socio puede ser activado directamente.
              </p>
            </div>
          )}

          {/* Medio de Pago */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medio de Pago *
            </label>
            <select
              value={medioPago}
              onChange={(e) => {
                setMedioPago(e.target.value);
                setError("");
              }}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white"
            >
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia">🏦 Transferencia bancaria</option>
              <option value="mercado_pago">💳 Mercado Pago</option>
              <option value="tarjeta">💰 Tarjeta de crédito/débito</option>
            </select>
          </div>

          {/* Comprobante */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Número de Comprobante <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
              placeholder="Ej: 12345, CBU, referencia de transferencia"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Mostrar error si hay */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">❌ {error}</p>
            </div>
          )}

          {/* Info importante */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-6">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Al confirmar:</strong> Se registrará {hayDeuda ? "el pago de todas las cuotas pendientes " : ""}y el socio será activado automáticamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Procesando...
              </>
            ) : (
              <>
                <FaCheckCircle />
                {hayDeuda ? "Pagar y Activar" : "Activar"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}