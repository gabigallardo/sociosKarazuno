import React, { useState, useEffect, useContext } from "react";
import { getMisCuotas } from "../../api/cuotas.api";
import { UserContext } from "../../contexts/User.Context.jsx";
import { FaMoneyBillWave, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MisCuotasPage() {
  const { user } = useContext(UserContext);
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCuotas() {
      try {
        const data = await getMisCuotas();
        setCuotas(data);
      } catch (error) {
        console.error("Error fetching cuotas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCuotas();
  }, []);

  const getCuotaStatus = (vencimiento, pagada) => {
    if (pagada) return "pagada";
    const hoy = new Date();
    const fechaVencimiento = new Date(vencimiento);
    return fechaVencimiento < hoy ? "vencida" : "vigente";
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-gray-500 text-center">Cargando cuotas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-red-700 mb-6 text-center">
        Mis Cuotas
      </h1>

      {cuotas.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-500 text-lg">No tienes cuotas registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cuotas.map((cuota) => {
            const status = getCuotaStatus(cuota.vencimiento, cuota.pagada);
            const isVencida = status === "vencida";
            const isPagada = status === "pagada";

            return (
              <div
                key={cuota.id}
                className={`p-6 rounded-xl shadow-lg border-2 ${
                  isPagada 
                    ? "bg-gray-100 border-gray-400" 
                    : isVencida 
                    ? "bg-white border-red-400" 
                    : "bg-white border-green-400"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${isPagada ? "text-gray-600" : "text-red-700"}`}>
                    Período: {cuota.periodo}
                  </h3>
                  {isPagada ? (
                    <FaCheckCircle className="text-3xl text-gray-500" />
                  ) : isVencida ? (
                    <FaExclamationTriangle className="text-3xl text-red-500" />
                  ) : (
                    <FaCheckCircle className="text-3xl text-green-500" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`font-semibold ${isPagada ? "text-gray-500" : "text-gray-600"}`}>
                      Monto:
                    </span>
                    <span className={`text-2xl font-bold ${isPagada ? "text-gray-600" : "text-red-700"}`}>
                      ${parseFloat(cuota.monto).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className={`font-semibold ${isPagada ? "text-gray-500" : "text-gray-600"}`}>
                      Vencimiento:
                    </span>
                    <span className={
                      isPagada 
                        ? "text-gray-500" 
                        : isVencida 
                        ? "text-red-600 font-bold" 
                        : "text-gray-700"
                    }>
                      {new Date(cuota.vencimiento).toLocaleDateString()}
                    </span>
                  </div>

                  {cuota.descuento_aplicado > 0 && (
                    <div className="flex justify-between">
                      <span className={`font-semibold ${isPagada ? "text-gray-500" : "text-gray-600"}`}>
                        Descuento:
                      </span>
                      <span className={`font-bold ${isPagada ? "text-gray-500" : "text-green-600"}`}>
                        {cuota.descuento_aplicado}%
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className={`font-semibold ${isPagada ? "text-gray-500" : "text-gray-600"}`}>
                      Estado:
                    </span>
                    <span
                      className={`font-bold ${
                        isPagada 
                          ? "text-gray-500" 
                          : isVencida 
                          ? "text-red-600" 
                          : "text-green-600"
                      }`}
                    >
                      {isPagada ? "PAGADA" : isVencida ? "VENCIDA" : "VIGENTE"}
                    </span>
                  </div>
                </div>

                {!isPagada && (
                    <button 
                        onClick={() => navigate(`/cuotas/pagar/${cuota.id}`)}
                        className={`mt-4 w-full py-2 rounded-lg font-bold transition ${
                        isVencida 
                            ? "bg-red-600 text-white hover:bg-red-700" 
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                    >
                        Pagar Ahora
                    </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}