import { useEffect, useState } from "react";
import { getSocios } from "../api/socios.api";

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
    {socios.length === 0 ? (
      <p>No hay socios para mostrar</p>
    ) : (
      socios.map((socio) => (
        <div key={socio.id}>
          {socio.nombre} {socio.apellido}
        </div>
      ))
    )}
  </div>
);

}
