import axios from "axios";

const usuariosApi = axios.create({
  baseURL: "http://localhost:8000/socios/api/v1/usuarios/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllUsuarios = async () => {
  try {
    const response = await usuariosApi.get("/");
    return response.data;
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    throw error;
  }
};

export const getUsuarioById = async (id) => {
  const res = await usuariosApi.get(`/${id}/`);
  return res.data;
};

export const createUsuario = async (usuarioData) => {
  try {
    const response = await usuariosApi.post("/", usuarioData);
    return response.data;
  } catch (error) {
    console.error("Error creating usuario:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUsuario = async (id, usuarioData) => {
  const res = await usuariosApi.put(`/${id}/`, usuarioData);
  return res.data;
};

export const deleteUsuario = async (id) => {
  const res = await usuariosApi.delete(`/${id}/`);
  return res.data;
};
