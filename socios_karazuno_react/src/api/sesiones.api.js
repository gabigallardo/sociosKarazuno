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

/**
 * Obtener la hoja de asistencia (lista de jugadores y estado) para una sesión.
 */
export const getHojaAsistencia = async (sesionId) => {
  try {
    const response = await api.get(`${BASE_PATH}/${sesionId}/hoja-asistencia/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching hoja de asistencia:", error.response?.data);
    throw error;
  }
};

/**
 * Guardar la asistencia.
 * @param {number} sesionId
 * @param {Array} listaAsistencia - Array de objetos { usuario_id, estado, nota }
 */
export const registrarAsistencia = async (sesionId, listaAsistencia) => {
  try {
    const payload = { asistencias: listaAsistencia };
    const response = await api.post(`${BASE_PATH}/${sesionId}/registrar-asistencia/`, payload);
    return response.data;
  } catch (error) {
    console.error("Error registrando asistencia:", error.response?.data);
    throw error;
  }
};

/**
 * Obtener las sesiones de entrenamiento correspondientes al usuario logueado
 * (Ya sea por ser socio de una categoría o profesor de ella).
 */
export const getMisSesiones = async () => {
  try {
    const response = await api.get(`${BASE_PATH}/mis-sesiones/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mis sesiones:", error.response?.data);
    throw error;
  }
};