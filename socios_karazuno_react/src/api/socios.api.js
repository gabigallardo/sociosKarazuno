import api from "../config/axiosConfig";

const BASE_PATH = "http://localhost:8000/socios/api/v1";

/**
 * Obtener todos los socios (usuarios con SocioInfo)
 */
export const getAllSocios = async () => {
  try {
    const response = await api.get(`${BASE_PATH}/socios-info/`);
    console.log("✅ Socios obtenidos:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching socios:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Obtener información de socio por ID de usuario
 */
export const getSocioById = async (usuarioId) => {
  try {
    const response = await api.get(`${BASE_PATH}/socios-info/${usuarioId}/`);
    console.log("✅ Socio obtenido:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching socio by ID:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Inactivar un socio (admin/dirigente)
 */
export const inactivarSocio = async (usuarioId, razon) => {
  try {
    const response = await api.post(
      `http://localhost:8000/socios/api/v1/usuarios/${usuarioId}/inactivar-socio/`,
      { razon }
    );
    console.log("✅ Socio inactivado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error inactivando socio:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Activar un socio inactivo (registrar pago + reactivar)
 * @param {number} usuarioId - ID del usuario socio
 * @param {object} datoPago - { medio_pago: string, comprobante?: string }
 */
export const activarSocio = async (usuarioId, datoPago) => {
  try {
    const response = await api.post(
      `${BASE_PATH}/usuarios/${usuarioId}/activar-socio/`,
      datoPago
    );
    console.log("✅ Socio activado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error activando socio:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Obtener cuotas pendientes de un usuario
 * @param {number} usuarioId - ID del usuario
 */
export const getCuotasPendientes = async (usuarioId) => {
  try {
    // Endpoint que devuelve cuotas sin pago completado
    const response = await api.get(
      `${BASE_PATH}/cuotas/?usuario=${usuarioId}&estado=pendiente`
    );
    console.log("✅ Cuotas pendientes obtenidas:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching cuotas pendientes:", error);
    throw error;
  }
};