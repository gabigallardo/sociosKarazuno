import api from "../config/axiosConfig";

const BASE_PATH = "http://localhost:8000/socios/api/v1/usuarios";

export const getAllUsuarios = async () => {
  try {
    const response = await api.get(`${BASE_PATH}/`);
    console.log("✅ Usuarios obtenidos:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching usuarios:", error.response?.status, error.response?.data);
    throw error;
  }
};

export const getUsuarioById = async (id) => {
  try {
    const response = await api.get(`${BASE_PATH}/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching usuario by ID:", error);
    throw error;
  }
};

export const createUsuario = async (usuarioData) => {
  try {
    const response = await api.post(`${BASE_PATH}/`, usuarioData);
    console.log("✅ Usuario creado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating usuario:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUsuario = async (id, usuarioData) => {
  try {
    const response = await api.put(`${BASE_PATH}/${id}/`, usuarioData);
    console.log("✅ Usuario actualizado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating usuario:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteUsuario = async (id) => {
  try {
    const response = await api.delete(`${BASE_PATH}/${id}/`);
    console.log("✅ Usuario eliminado:", id);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting usuario:", error);
    throw error;
  }
};