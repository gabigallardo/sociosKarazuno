import { useEffect, useState } from "react";
import { getSocios } from "../api/socios.api";
import { TarjetaLista } from "./TarjetaLista";
export default function ListaSocios() {
  const [socios, setSocios] = useState([]);

  useEffect(() => {
    async function loadSocios() {
      try {
        const data = await getSocios(); 
        setSocios(data);
      } catch (error) {
        console.error("Error cargando socios:", error);
      }
    }

    loadSocios();
  }, []);

return (
  <div>
    <h2>Lista de Socios</h2>
    {socios.length === 0 ? (
      <p>No hay socios para mostrar</p>
    ) : (
      socios.map((socio) => (
        <TarjetaLista key={socio.id} socio={socio} />
      ))
    )}
  </div>
);

}


