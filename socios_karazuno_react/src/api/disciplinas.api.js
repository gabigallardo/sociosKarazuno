import api from "../config/axiosConfig";

const BASE_PATH = "/socios/api/v1/disciplinas";

export const getAllDisciplinas = async () => {
  try {
    const response = await api.get(`${BASE_PATH}/`);
    return response.data;
  } catch (error) {
    console.error(" Error fetching disciplinas:", error.response?.data);
    throw error;
  }
};

export const createDisciplina = async (data) => {
  try {
    const response = await api.post(`${BASE_PATH}/`, data);
    return response.data;
  } catch (error) {
    console.error(" Error creating disciplina:", error.response?.data);
    throw error;
  }
};
export const updateDisciplina = async (id, data) => {
  try {
    const response = await api.put(`${BASE_PATH}/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating disciplina:", error.response?.data);
    throw error;
  }
};

export const deleteDisciplina = async (id) => {
  try {
    await api.delete(`${BASE_PATH}/${id}/`);
  } catch (error) {
    console.error("Error deleting disciplina:", error.response?.data);
    throw error;
  }
};