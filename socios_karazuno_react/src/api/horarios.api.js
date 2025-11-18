import api from "../config/axiosConfig";

const BASE_PATH = "/socios/api/v1/horarios";

/**
 * Obtener los horarios de una categoría específica.
 */
export const getHorariosPorCategoria = async (categoriaId) => {
  try {
    const response = await api.get(`${BASE_PATH}/?categoria=${categoriaId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching horarios:", error.response?.data);
    throw error;
  }
};

/**
 * Crear un nuevo horario.
 */
export const createHorario = async (data) => {
  try {
    const response = await api.post(`${BASE_PATH}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating horario:", error.response?.data);
    throw error;
  }
};

/**
 * Actualizar un horario existente.
 */
export const updateHorario = async (id, data) => {
  try {
    const response = await api.put(`${BASE_PATH}/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating horario:", error.response?.data);
    throw error;
  }
};

/**
 * Eliminar un horario.
 */
export const deleteHorario = async (id) => {
  try {
    await api.delete(`${BASE_PATH}/${id}/`);
  } catch (error) {
    console.error("Error deleting horario:", error.response?.data);
    throw error;
  }
};

/**
 * Genera sesiones de entrenamiento para una categoría en un rango de fechas.
 */
export const generarSesionesDeEntrenamiento = async (categoriaId, fechaInicio, fechaFin) => {
  try {
    const payload = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    };
    const response = await api.post(`/socios/api/v1/categorias/${categoriaId}/generar-sesiones/`, payload);
    return response.data;
  } catch (error) {
    console.error("Error generando sesiones:", error.response?.data);
    throw error;
  }
};