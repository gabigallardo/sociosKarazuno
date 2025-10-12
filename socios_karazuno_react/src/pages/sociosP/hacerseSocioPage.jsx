import React, { useState, useEffect, useContext, use } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { getAllNivelesSocio } from "../../api/nivelesSocio.api";
import { hacerseSocio } from "../../api/usuarios.api";
import { UserContext } from "../../contexts/User.Context";

export default function HacerseSocioPage() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [niveles, setNiveles] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const cuotaMensual = 15000; // Valor base en ARS

  useEffect(() => {
    async function fetchNiveles() {
      try {
        const nivelesData = await getAllNivelesSocio();
        setNiveles(nivelesData);
      } catch (error) {
        console.error("Error fetching niveles de socio:", error);
      }
    }
    fetchNiveles();
  }, []);

  const handleHacerseSocio = async () => {
    setLoading(true);
    try {
      const response = await hacerseSocio(user.id);
      //Actualizar el contexto del usuario para reflejar el nuevo estado de socio
      setUser({ ...user, roles: [...(user.roles || []), "socio"]});
      alert("¡Te has asociado exitosamente! Ya sos parte del club.");
      navigate("/socios");
    } catch (error) {
      console.error("Error al hacerse socio:", error);
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
      alert("Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-red-700 mb-6 text-center">
        ¡Hacete Socio del Club!
      </h1>

      {/* Valor de la cuota */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Cuota Social Mensual</h2>
        <div className="flex items-center justify-center gap-4 bg-red-50 p-6 rounded-lg">
          <FaMoneyBillWave className="text-5xl text-red-700" />
          <div>
            <p className="text-4xl font-extrabold text-red-700">${cuotaMensual.toLocaleString()}</p>
            <p className="text-gray-600">ARS por mes</p>
          </div>
        </div>
      </section>

      {/* Niveles de socio */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Niveles de Socio</h2>
        {niveles.length === 0 ? (
          <p className="text-gray-500 italic">Cargando niveles...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {niveles.map((nivel) => (
              <div
                key={nivel.id}
                className="bg-gradient-to-br from-red-50 to-white p-6 rounded-lg border-2 border-red-200 shadow hover:shadow-lg transition duration-200"
              >
                <h3 className="text-xl font-bold text-red-700 mb-2">
                  Nivel {nivel.nivel}
                </h3>
                <p className="text-gray-700 font-semibold mb-3">{nivel.descripcion}</p>
                <div className="mb-3">
                  <span className="text-sm font-bold text-red-600">Descuento:</span>
                  <p className="text-2xl font-extrabold text-red-700">{nivel.descuento}%</p>
                </div>
                <div className="mb-3">
                  <span className="text-sm font-bold text-red-600">Beneficios:</span>
                  <p className="text-gray-600 text-sm">{nivel.beneficios || "Sin detalles"}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-red-600">Requisitos:</span>
                  <p className="text-gray-600 text-sm">{nivel.requisitos || "Sin requisitos"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Métodos de pago */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Métodos de Pago Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <FaCreditCard className="text-3xl text-red-700" />
            <div>
              <p className="font-bold">Mercado Pago</p>
              <p className="text-sm text-gray-600">Tarjeta de crédito/débito</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <FaMoneyBillWave className="text-3xl text-red-700" />
            <div>
              <p className="font-bold">Efectivo</p>
              <p className="text-sm text-gray-600">En sede del club</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <FaCreditCard className="text-3xl text-red-700" />
            <div>
              <p className="font-bold">Transferencia</p>
              <p className="text-sm text-gray-600">CBU/Alias disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Botón de confirmación */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate("/socios")}
          className="bg-gray-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transition duration-300 hover:bg-gray-600 transform hover:scale-105"
          disabled={loading}
        >
          Volver
        </button>
        <button
          onClick={() => setShowConfirmModal(true)}
          className="bg-red-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition duration-300 hover:bg-red-800 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <FaCheckCircle />
          {loading ? "Procesando..." : "Confirmar Asociación"}
        </button>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md">
            <h3 className="text-2xl font-bold text-red-700 mb-4">Confirmar Asociación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro que deseas asociarte al club? Se te asignará el Nivel 1 
              y deberás abonar la cuota mensual de ${cuotaMensual.toLocaleString()}.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-full font-bold hover:bg-gray-600 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleHacerseSocio();
                }}
                className="flex-1 bg-red-700 text-white px-4 py-2 rounded-full font-bold hover:bg-red-800 transition disabled:opacity-50"
                disabled={loading}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
