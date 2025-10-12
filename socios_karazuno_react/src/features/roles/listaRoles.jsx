import { useEffect, useState } from "react";
import { getAllRoles } from "../../api/roles.api"


export default function ListaRoles() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    async function loadRoles() {
        try {
            const data = await getAllRoles();
            console.log(data);
            setRoles(data);
        } catch (error) {
            console.error("Error cargando roles:", error);
        }
    }loadRoles();
  }, []);

  return (
    <div>
      <h1>Lista de Roles</h1>
      <ul>
        {roles.map((rol) => (
          <li key={rol.id}>
            {rol.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
};

