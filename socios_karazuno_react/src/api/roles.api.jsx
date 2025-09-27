import axios from "axios";

const rolesApi = axios.create({
  baseURL: "http://localhost:8000/socios/api/v1/roles/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllRoles = async () => {
  try {
    const response = await rolesApi.get("/");
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};