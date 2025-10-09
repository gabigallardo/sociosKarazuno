import api from "../config/axiosConfig";
export const getSocios = async () => {
  const response = await api.get("http://localhost:8000/socios/api/v1/usuarios/");
  return response.data;
}