import api from "../config/axiosConfig";

const BASE_PATH = "/socios/api/v1/sesiones";

/**
 * Obtener las sesiones de entrenamiento de una categoría específica, ordenadas por fecha.
 */
export const getSesionesPorCategoria = async (categoriaId) => {
  if (!categoriaId) return [];
  try {
    const response = await api.get(`${BASE_PATH}/?categoria=${categoriaId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sesiones:", error.response?.data);
    throw error;
  }
};