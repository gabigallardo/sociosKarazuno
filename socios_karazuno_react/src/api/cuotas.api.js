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

