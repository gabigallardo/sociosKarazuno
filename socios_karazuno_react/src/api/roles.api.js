import api from "../config/axiosConfig";

const BASE_PATH = "/socios/api/v1/roles";

export const getAllRoles = async () => {
  try {
    const response = await api.get(`${BASE_PATH}/`);
    console.log("✅ Roles obtenidos:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching roles:", error.response?.status, error.response?.data);
    throw error;
  }
};