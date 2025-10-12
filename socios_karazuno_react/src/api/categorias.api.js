import api from "../config/axiosConfig";

const BASE_PATH = "/socios/api/v1/categorias";

export const getAllCategorias = async () => {
  try {
    const response = await api.get(`${BASE_PATH}/`);
    return response.data;
  } catch (error) {
    console.error(" Error fetching categorias:", error.response?.data);
    throw error;
  }
};

export const createCategoria = async (data) => {
    try {
      const response = await api.post(`${BASE_PATH}/`, data);
      return response.data;
    } catch (error) {
      console.error(" Error creating categoria:", error.response?.data);
      throw error;
    }
  };
export const updateCategoria = async (id, data) => {
    try {
      const response = await api.put(`${BASE_PATH}/${id}/`, data);      
        return response.data;   
    } catch (error) {
      console.error("Error updating categoria:", error.response?.data);
      throw error;
    }
    };
export const deleteCategoria = async (id) => {
    try {
      await api.delete(`${BASE_PATH}/${id}/`);
    } catch (error) {
      console.error("Error deleting categoria:", error.response?.data);
      throw error;
    }   
    };
    