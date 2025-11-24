import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaTimes, FaCheckCircle } from "react-icons/fa";

export default function ModalRegistrarPago({ socio, cuotasPendientes, isOpen, onClose, onConfirm, loading }) {
  const [medioPago, setMedioPago] = useState("efectivo");
  const [comprobante, setComprobante] = useState("");
  
  // Si quieres permitir pagar solo algunas, podrías agregar selección aquí.
  // Por ahora, asumimos que paga todo lo pendiente.

  useEffect(() => {
    if (!isOpen) {
      setMedioPago("efectivo");
      setComprobante("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onConfirm({ medio_pago: medioPago, comprobante });
  };

  if (!isOpen) return null;

  const total = cuotasPendientes.reduce((acc, c) => acc + Number(c.monto), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b bg-green-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
            <FaMoneyBillWave /> Registrar Pago
          </h2>
          <button onClick={onClose}><FaTimes className="text-gray-500" /></button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Registrando pago para <strong>{socio.nombre_completo}</strong>
          </p>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 text-center">
            <p className="text-sm text-yellow-800 font-bold uppercase">Total a Pagar</p>
            <p className="text-3xl font-extrabold text-yellow-700">
              ${total.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              {cuotasPendientes.length} cuotas seleccionadas
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Medio de Pago</label>
              <select 
                value={medioPago} 
                onChange={(e) => setMedioPago(e.target.value)}
                className="w-full border p-2 rounded-lg"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercado_pago">Mercado Pago</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Comprobante (Opcional)</label>
              <input 
                type="text" 
                value={comprobante}
                onChange={(e) => setComprobante(e.target.value)}
                placeholder="Nro de operación..."
                className="w-full border p-2 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3 rounded-b-xl">
            <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg font-bold text-gray-700">Cancelar</button>
            <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 flex justify-center items-center gap-2"
            >
                {loading ? "Procesando..." : <><FaCheckCircle /> Confirmar Pago</>}
            </button>
        </div>
      </div>
    </div>
  );
}