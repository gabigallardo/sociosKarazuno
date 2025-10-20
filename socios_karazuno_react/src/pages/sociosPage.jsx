import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/User.Context.jsx";
import { getAllEventos } from "../api/eventos.api.js";

import UsuarioNoAsociado from '../components/UsuarioNoAsociado/UsuarioNoAsociado.jsx';
import PanelDeControl from '../components/PanelDeControl/PanelDeControl.jsx';
import CredencialSocio from '../components/CredencialSocio/CredencialSocio.jsx';
import CalendarioSocio from '../components/CalendarioSocio/CalendarioSocio.jsx';
import ProximosEventos from '../components/ProximosEventos/ProximosEventos.jsx';

function SociosPage() {
  const { user } = useContext(UserContext);
  const [eventos, setEventos] = useState([]);

  const userRoles = user?.roles || [];
  const esSocio = userRoles.includes("socio");
  const esAdmin = userRoles.includes("admin");
  const esProfesor = userRoles.includes("profesor");
  const esDirigente = userRoles.includes("dirigente");
  const esUsuarioNoAsociado = !esSocio && !esAdmin && !esProfesor && !esDirigente;

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const data = await getAllEventos();
        setEventos(data.slice(0, 3));
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      }
    };
    if (user) {
      fetchEventos();
    }
  }, [user]);

  if (!user) {
    return <div className="p-6 text-center text-gray-600">Cargando...</div>;
  }

  if (esUsuarioNoAsociado) {
    return <UsuarioNoAsociado />;
  }

  const { nombre, apellido, nro_documento, fecha_nacimiento, sexo, foto_url, qr_token } = user;
  const userData = {
    nombreCompleto: `${nombre || ""} ${apellido || ""}`.trim() || "Nombre No Disponible",
    numeroDNI: nro_documento || "No disponible",
    fechaNacimiento: fecha_nacimiento ? new Date(fecha_nacimiento).toLocaleDateString() : "Fecha N/A",
    sexo: sexo || "N/A",
    fotoUrl: (foto_url && foto_url.trim() !== "") ? foto_url : "https://placehold.co/100x100",
    uuidQr: qr_token || "UUID-DEMO-12345",
  };

  return (
    <>
      {(esAdmin || esProfesor || esDirigente) && !esSocio && (
        <PanelDeControl nombreUsuario={user?.nombre} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {esSocio && <CredencialSocio userData={userData} />}
        <CalendarioSocio />
      </div>

      <ProximosEventos eventos={eventos} />
    </>
  );
}

export default SociosPage;