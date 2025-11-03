import api from "../config/axiosConfig";

const BASE_PATH = "/socios/api/v1/cuotas";

export const getMisCuotas = async () => {
    try {
        // Usar el endpoint list en vez de mis-cuotas
        const response = await api.get(`${BASE_PATH}/`);
        console.log("✅ Cuotas obtenidas:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching cuotas:", error.response?.status, error.response?.data);
        throw error;
    }
};

/**
 * SIMULACIÓN: Llama al backend para registrar un pago como si fuera de Mercado Pago.
 * @param {number} cuotaId - El ID de la cuota a pagar.
 */
export const simularPagoMercadoPago = async (cuotaId) => {
    try {
        // Hacemos un POST al nuevo endpoint de simulación
        const response = await api.post(`${BASE_PATH}/${cuotaId}/simular-pago-mp/`);
        console.log("✅ Pago simulado con éxito:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al simular el pago:", error.response?.data || error.message);
        throw error;
    }
};

