import React, { useContext } from "react";
import { UserContext } from "../contexts/User.Context.jsx";
import { QRCodeCanvas } from "qrcode.react";
import { FaFileDownload } from "react-icons/fa"; 
import patternImg from '../assets/pattern.jpg'; 

function SociosPage() {
  const { user } = useContext(UserContext);

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-600">
        Cargando datos del socio...
      </div>
    );
  }

  const {
    nombre,
    apellido,
    nro_documento,
    fecha_nacimiento,
    sexo,
    foto_url,
    qr_token,
  } = user;

  const userData = {
    nombreCompleto:
      `${nombre || ""} ${apellido || ""}`.trim() || "Nombre No Disponible",
    numeroDNI: nro_documento || "No disponible",
    fechaNacimiento: fecha_nacimiento
      ? new Date(fecha_nacimiento).toLocaleDateString()
      : "Fecha N/A",
    sexo: sexo || "N/A",
    fotoUrl: foto_url || "https://via.placeholder.com/100",
    uuidQr: qr_token || "UUID-DEMO-12345",
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* -------- CREDENCIAL (ORDEN DE LA IMAGEN DE BLOQUES) -------- */}
        <section 
          className="bg-gradient-to-br from-red-800 via-red-700 to-black text-white p-6 rounded-3xl shadow-2xl transition duration-300 transform hover:scale-[1.03] hover:shadow-red-900/50 relative overflow-hidden flex flex-col"
          style={{ height: '450px' }} // Altura fija para evitar el corte y forzar el diseño 2x3
        >
          {/* Fondo estético */}
          <div className="absolute inset-0 opacity-10 bg-repeat bg-center" style={{ backgroundImage: `url(${patternImg})` }}></div>
          
          <h2 className="font-extrabold uppercase tracking-widest text-xl mb-4 text-center z-10 relative">
            Credencial de Socio
          </h2>

          <div className="grid grid-cols-3 gap-3 flex-1 z-10 relative">
            
            {/* 1. Bloque Foto perfil  */}
<div className="row-span-2 col-span-1 flex flex-col items-center justify-center p-2 bg-black/50 rounded-lg backdrop-blur-sm shadow-inner border border-white/30">
  <div className="w-40 h-40 border-4 border-white rounded-md overflow-hidden shadow-lg mb-2 transition duration-300 hover:ring-4 ring-white/50">
    <img
      src={userData.fotoUrl}
      alt="Foto de perfil"
      className="w-full h-full object-cover"
    />
  </div>
  <p className="text-sm text-center">Foto perfil</p>
</div>

            
            {/* 2. Bloque NUMERO DNI  */}
            <div className="col-span-2 bg-black/70 flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 transition duration-200 hover:bg-black/80">
                <span className="text-sm font-bold text-red-200 uppercase">Número DNI</span>
                <span className="text-xl font-extrabold tracking-wider">{userData.numeroDNI}</span>
            </div>
            
            {/* 3. Bloque FECHA NACIMIENTO  */}
            <div className="col-span-1 bg-black/70 flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 transition duration-200 hover:bg-black/80">
                <span className="text-sm font-bold text-red-200 uppercase">Fecha Nacimiento</span>
                <span className="text-xl font-extrabold tracking-wider">{userData.fechaNacimiento}</span>
            </div>
            
            {/* 4. Bloque QR */}
            <div className="col-span-1 flex flex-col items-center justify-center p-2 bg-black/70 rounded-lg backdrop-blur-sm shadow-inner border border-white/30">
                <div className="p-1 bg-white rounded shadow-xl mb-1">
                    <QRCodeCanvas
                        value={userData.uuidQr}
                        size={80}
                        bgColor="#fff"
                        fgColor="#000"
                    />
                </div>
            </div>

            {/* 5. Bloque NOMBRE Y APELLIDO  */}
            <div className="col-span-2 bg-black/70 flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 transition duration-200 hover:bg-black/80">
                <span className="text-sm font-bold text-red-200 uppercase">Nombre y Apellido</span>
                <span className="text-2xl font-extrabold tracking-wider text-center">{userData.nombreCompleto.toUpperCase()}</span>
            </div>
            
            {/* 6. Bloque SEXO */}
            <div className="col-span-1 bg-black/70 flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 transition duration-200 hover:bg-black/80">
                <span className="text-sm font-bold text-red-200 uppercase">Sexo</span>
                <span className="text-2xl font-extrabold tracking-wider">{userData.sexo.toUpperCase()}</span>
            </div>

          </div>
          
          {/* Botón PDF */}
          <div className="flex justify-end mt-4 z-10 relative">
            <button 
                className="text-sm bg-white text-red-700 px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-lg transition duration-300 hover:bg-gray-100 transform hover:scale-105"
                title="Descargar credencial"
            >
                <FaFileDownload className="text-xl" /> 
                Descargar PDF
            </button>
          </div>
        </section>

        {/* -------- CALENDARIO -------- */}
        <section className="bg-white text-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 transition duration-300 transform hover:scale-[1.01] flex flex-col">
          <h2 className="mb-4 font-bold text-2xl text-red-700 border-b pb-2">
            Calendario de Socio
          </h2>
          <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-red-300/50 shadow-inner p-4">
            <span className="text-gray-500 italic text-center">
              Aquí se implementará la visualización interactiva del calendario (eventos, reservas, etc.).
            </span>
          </div>
        </section>
      </div>

      {/* -------- PRÓXIMOS EVENTOS -------- */}
      <section className="bg-white text-gray-800 p-6 rounded-3xl shadow-xl mt-8 border border-gray-200 transition duration-300 transform hover:scale-[1.01]">
        <h2 className="font-bold mb-4 text-2xl text-red-700 border-b pb-2">
          Próximos Eventos del Club
        </h2>
        <div className="bg-gray-100 h-40 rounded-lg flex items-center justify-center shadow-inner border border-red-300/50">
          <p className="text-lg italic text-gray-500">
            Lista de tarjetas de eventos se implementará aquí con fechas y detalles.
          </p>
        </div>
      </section>
    </>
  );
}

export default SociosPage;