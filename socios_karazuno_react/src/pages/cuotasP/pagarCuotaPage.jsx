import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { getMisCuotas } from "../../api/cuotas.api";

export default function PagarCuotaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cuota, setCuota] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCuota() {
      try {
        const data = await getMisCuotas();
        const cuotaEncontrada = data.find(c => c.id === parseInt(id));
        setCuota(cuotaEncontrada);
      } catch (error) {
        console.error("Error fetching cuota:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCuota();
  }, [id]);

  const handlePagoEfectivo = () => {
    // Lógica para pago en efectivo
    alert("Por favor, acércate a la administración para realizar el pago en efectivo.");
  };

  const handlePagoMercadoPago = () => {
    // Lógica para integración con Mercado Pago
    alert("Redirigiendo a Mercado Pago...");
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-gray-500 text-center">Cargando información...</p>
      </div>
    );
  }

  if (!cuota) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-red-600 text-center">Cuota no encontrada.</p>
        <button 
          onClick={() => navigate("/mis-cuotas")}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg mx-auto block"
        >
          Volver a Mis Cuotas
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-red-700 mb-6 text-center">
        Pagar Cuota
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalle de la Cuota</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Período:</span>
            <span className="text-gray-800">{cuota.periodo}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Monto:</span>
            <span className="text-2xl font-bold text-red-700">
              ${parseFloat(cuota.monto).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Vencimiento:</span>
            <span className="text-gray-800">
              {new Date(cuota.vencimiento).toLocaleDateString()}
            </span>
          </div>
          {cuota.descuento_aplicado > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Descuento aplicado:</span>
              <span className="text-green-600 font-bold">{cuota.descuento_aplicado}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Selecciona el método de pago</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handlePagoEfectivo}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-red-600 hover:bg-red-50 transition"
          >
            <FaMoneyBillWave className="text-6xl text-green-600 mb-3" />
            <span className="text-xl font-bold text-gray-800">Efectivo</span>
            <span className="text-sm text-gray-500 mt-2 text-center">
              Paga en la administración del club
            </span>
          </button>

          <button
            onClick={handlePagoMercadoPago}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition"
          >
            <FaCreditCard className="text-6xl text-blue-600 mb-3" />
            <span className="text-xl font-bold text-gray-800">Mercado Pago</span>
            <span className="text-sm text-gray-500 mt-2 text-center">
              Paga online con tarjeta o transferencia
            </span>
          </button>
        </div>

        <button
          onClick={() => navigate("/mis-cuotas")}
          className="mt-6 w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}