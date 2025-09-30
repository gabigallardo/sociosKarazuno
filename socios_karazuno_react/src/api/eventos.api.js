import axios from "axios";

const eventosApi = axios.create({
  baseURL: "http://localhost:8000/socios/api/v1/eventos/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllEventos = async () => {
  const response = await eventosApi.get("/");
  return response.data;
};

export const getEventoById = async (id) => {
  const response = await eventosApi.get(`/${id}/`);
  return response.data;
};

export const createEvento = async (eventoData) => {
  try {
    const response = await eventosApi.post("/", eventoData);
    return response.data;
  } catch (error) {
    console.error("Error al crear evento:", error.response?.data || error.message);
    throw error;
  }
};

export const updateEvento = async (id, eventoData) => {
  const response = await eventosApi.put(`/${id}/`, eventoData);
  return response.data;
};

export const deleteEvento = async (id) => {
  await eventosApi.delete(`/${id}/`);
};
