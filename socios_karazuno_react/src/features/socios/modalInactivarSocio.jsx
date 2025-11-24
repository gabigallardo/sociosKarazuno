import { useState, useEffect } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

const OPCIONES_MOTIVOS = [
  "Falta de pago",
  "Baja voluntaria",
  "Conducta indebida",
  "Lesión / Salud",
  "Cambio de residencia",
  "Otros motivos" // Esta opción activará el textarea
];

export default function ModalInactivarSocio({ socio, isOpen, onClose, onConfirm, loading }) {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
  const [detalleOtros, setDetalleOtros] = useState("");
  const [error, setError] = useState("");

  // Este hook se asegura de que el modal esté siempre limpio al abrirse
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { // Pequeño delay para no ver el cambio al cerrar
        setMotivoSeleccionado("");
        setDetalleOtros("");
        setError("");
      }, 200);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    // Validar que se haya seleccionado una opción
    if (!motivoSeleccionado) {
      setError("Debes seleccionar un motivo de la lista.");
      return;
    }
    
    let razonFinal = motivoSeleccionado;

    // Si es "Otros motivos", validar y concatenar el detalle
    if (motivoSeleccionado === "Otros motivos") {
      if (!detalleOtros.trim()) {
        setError("Por favor, especifica el motivo detallado.");
        return;
      }
      if (detalleOtros.trim().length < 5) {
        setError("El detalle debe tener al menos 5 caracteres.");
        return;
      }
      // Formato final que se enviará al backend
      razonFinal = `Otros: ${detalleOtros}`;
    }
    
    setError("");
    onConfirm(razonFinal);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-2xl text-red-600" />
            <h2 className="text-xl font-bold text-red-700">Inactivar Socio</h2>
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Socio:</strong> {socio?.nombre_completo}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {socio?.email}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Motivo de Inactivación *
            </label>
            
            {/* SELECTOR DE OPCIONES */}
            <select
              value={motivoSeleccionado}
              onChange={(e) => {
                setMotivoSeleccionado(e.target.value);
                setError("");
              }}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white mb-3"
            >
              <option value="">-- Selecciona un motivo --</option>
              {OPCIONES_MOTIVOS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>

            {/* TEXTAREA CONDICIONAL (Solo aparece si elige "Otros motivos") */}
            {motivoSeleccionado === "Otros motivos" && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Detalle del motivo:
                </label>
                <textarea
                  value={detalleOtros}
                  onChange={(e) => {
                    setDetalleOtros(e.target.value);
                    setError("");
                  }}
                  placeholder="Escriba aquí los detalles..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none text-sm"
                  rows="3"
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-600 font-medium">❌ {error}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-6">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Nota:</strong> El socio no podrá reactivarse si tiene cuotas pendientes de pago.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Procesando...
              </>
            ) : (
              "Inactivar Socio"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}