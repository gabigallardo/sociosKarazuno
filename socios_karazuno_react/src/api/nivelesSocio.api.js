import api from "../config/axiosConfig";

const BASE_PATH = "/socios/api/v1/niveles-socio";

export const getAllNivelesSocio = async () => {
    try {
        const response = await api.get(`${BASE_PATH}/`);
        console.log("✅ Niveles de Socio obtenidos:", response.data.length);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching niveles de socio:", error.response?.status, error.response?.data);
        throw error;
    }
};

export const getNivelSocioById = async (id) => {
    try {
        const response = await api.get(`${BASE_PATH}/${id}/`);
        console.log("✅ Nivel de Socio obtenido:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching nivel de socio:", error.response?.status, error.response?.data);
        throw error;
    }
};
