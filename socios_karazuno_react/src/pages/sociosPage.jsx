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
        const ahora = new Date();
        // Filtramos solo futuros para la lista inferior
        const futuros = data
            .filter(e => new Date(e.fecha_fin) >= ahora)
            .slice(0, 3);
            
        setEventos(futuros);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      }
    };
    if (user) {
      fetchEventos();
    }
  }, [user]);

  if (!user) {
    return <div className="p-6 text-center text-gray-600">Cargando perfil...</div>;
  }

  if (esUsuarioNoAsociado) {
    return <UsuarioNoAsociado />;
  }

  const { nombre, apellido, nro_documento, fecha_nacimiento, sexo, foto_url, qr_token } = user;
  const userData = {
    nombreCompleto: `${nombre || ""} ${apellido || ""}`.trim() || "Usuario",
    numeroDNI: nro_documento || "---",
    fechaNacimiento: fecha_nacimiento ? new Date(fecha_nacimiento).toLocaleDateString() : "---",
    sexo: sexo || "-",
    fotoUrl: (foto_url && foto_url.trim() !== "") ? foto_url : "https://placehold.co/150x150/png?text=Foto",
    uuidQr: qr_token || "NO-TOKEN",
  };

  return (
    <div className="space-y-8 fade-in-enter">
      
      {/* Panel de Control: Visible solo para roles de gestión que NO son socios (o híbridos si se desea) */}
      {(esAdmin || esProfesor || esDirigente) && !esSocio && (
        <PanelDeControl nombreUsuario={user?.nombre} />
      )}

      {/* SECCIÓN PRINCIPAL DEL SOCIO: Credencial + Calendario Widget */}
      {/* Esta sección completa solo se renderiza si es SOCIO */}
      {esSocio && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Columna Izquierda: Credencial */}
            <div className="flex flex-col h-full">
                 <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 h-full flex items-center justify-center bg-gradient-to-b from-red-50 to-white min-h-[450px]">
                    <CredencialSocio userData={userData} />
                 </div>
            </div>

            {/* Columna Derecha: Calendario (Modo Compacto) */}
            <div className="h-full">
                 <CalendarioSocio compacto={true} />
            </div>
          </div>
      )}

      {/* Lista Rápida de Próximos Eventos (Visible para todos) */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-red-600 pl-3">
            Próximas Actividades
        </h2>
        <ProximosEventos eventos={eventos} />
      </div>
    </div>
  );
}

export default SociosPage;