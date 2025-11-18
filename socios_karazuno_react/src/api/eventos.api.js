import api from "../config/axiosConfig";

const BASE_PATH = "http://localhost:8000/socios/api/v1/eventos";

export const getAllEventos = async (filters = {}) => {
  try {
    // Convertimos filtros a query params si existen
    const response = await api.get(`${BASE_PATH}/`, { params: filters });
    console.log("✅ Eventos obtenidos:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching eventos:", error.response?.status, error.response?.data);
    throw error;
  }
};

export const getEventoById = async (id) => {
  try {
    const response = await api.get(`${BASE_PATH}/${id}/`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(`Evento con ID ${id} no encontrado.`);
      return null;
    }
    console.error("Error fetching evento by ID:", error);
    throw error;
  }
};

export const createEvento = async (eventoData) => {
  try {
    const response = await api.post(`${BASE_PATH}/`, eventoData);
    console.log("✅ Evento creado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al crear evento:", error.response?.data || error.message);
    throw error;
  }
};

export const updateEvento = async (id, eventoData) => {
  try {
    const response = await api.put(`${BASE_PATH}/${id}/`, eventoData);
    console.log("✅ Evento actualizado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating evento:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteEvento = async (id) => {
  try {
    await api.delete(`${BASE_PATH}/${id}/`);
    console.log("✅ Evento eliminado:", id);
  } catch (error) {
    console.error("❌ Error deleting evento:", error);
    throw error;
  }
};

export const getMisViajes = async () => {
  try {
    const response = await api.get(`${BASE_PATH}/mis-viajes/`);
    console.log("✅ Mis Viajes obtenidos:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching mis viajes:", error.response?.status, error.response?.data);
    throw error;
  }
};