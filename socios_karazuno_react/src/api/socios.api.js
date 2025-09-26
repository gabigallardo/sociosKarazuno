import axios from "axios";
export const getSocios = async () => {
  const response = await axios.get("http://localhost:8000/socios/api/v1/usuarios/");
  return response.data;
}