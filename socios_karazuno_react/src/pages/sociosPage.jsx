import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/User.Context.jsx";
import { QRCodeCanvas } from "qrcode.react";
import { FaFileDownload, FaUserPlus, FaUsers } from "react-icons/fa";
import patternImg from '../assets/pattern.jpg';
import { useNavigate } from "react-router-dom";
import { getAllEventos } from "../api/eventos.api.js";
import logoImg from '../assets/logo.png';

function SociosPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
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
        // La API ya devuelve los eventos futuros y ordenados.
        // Tomamos solo los primeros 3 para mostrar en la home.
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
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border max-w-4xl mx-auto">
          <img src={logoImg} alt="Logo Karazuno" className="mx-auto w-40 mb-4"/>
          <h1 className="text-4xl font-extrabold text-red-700 mb-4">¡Bienvenido a Karazuno!</h1>
          <p className="text-lg text-gray-600 mb-6">Estás a un paso de ser parte de nuestro club. Como socio, tendrás acceso a increíbles beneficios:</p>
          
          <ul className="list-disc list-inside text-left text-gray-700 mb-8 space-y-2 max-w-md mx-auto">
              <li>Acceso a todas las instalaciones del club.</li>
              <li>Descuentos en cuotas y eventos especiales.</li>
              <li>Inscripción prioritaria a torneos y actividades.</li>
              <li>Una credencial digital para un acceso rápido y seguro.</li>
          </ul>

          <button
            onClick={() => navigate("/hacerse-socio")}
            className="bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-lg transition duration-300 hover:bg-red-700 transform hover:scale-105 flex items-center gap-3 mx-auto text-lg"
          >
            <FaUserPlus />
            ¡Quiero Hacerme Socio Ahora!
          </button>
      </div>
    );
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
        <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
          <h2 className="text-3xl font-extrabold text-red-700 flex items-center gap-3"><FaUsers/> Panel de Control</h2>
          <p className="mt-2 text-gray-600">Bienvenido, {user?.nombre}. Desde aquí puedes acceder a las funciones administrativas disponibles para tu rol.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {esSocio && (
          <section 
            className="bg-gradient-to-br from-red-800 via-red-700 to-black text-white p-6 rounded-3xl shadow-2xl transition duration-300 transform hover:scale-[1.03] hover:shadow-red-900/50 relative overflow-hidden flex flex-col"
            style={{ height: '450px' }}
          >
            <div className="absolute inset-0 opacity-10 bg-repeat bg-center" style={{ backgroundImage: `url(${patternImg})` }}></div>
            <h2 className="font-extrabold uppercase tracking-widest text-xl mb-4 text-center z-10 relative">Credencial de Socio</h2>
            <div className="grid grid-cols-3 gap-3 flex-1 z-10 relative">
              <div className="row-span-2 col-span-1 flex flex-col items-center justify-center p-2 bg-black/50 rounded-lg backdrop-blur-sm shadow-inner border border-white/30">
                <div className="w-40 h-40 border-4 border-white rounded-md overflow-hidden shadow-lg mb-2 transition duration-300 hover:ring-4 ring-white/50">
                  <img src={userData.fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-center">Foto perfil</p>
              </div>
              <div className="col-span-2 bg-black/70 flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 transition duration-200 hover:bg-black/80">
                  <span className="text-sm font-bold text-red-200 uppercase">Número DNI</span>
                  <span className="text-xl font-extrabold tracking-wider">{userData.numeroDNI}</span>
              </div>
              <div className="col-span-1 bg-black/70 flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 transition duration-200 hover:bg-black/80">
                  <span className="text-sm font-bold text-red-200 uppercase">Fecha Nacimiento</span>
                  <span className="text-xl font-extrabold tracking-wider">{userData.fechaNacimiento}</span>
              </div>
              <div className="col-span-1 flex flex-col items-center justify-center p-2 bg-black/70 rounded-lg backdrop-blur-sm shadow-inner border border-white/30">
                  <div className="p-1 bg-white rounded shadow-xl mb-1">
                      <QRCodeCanvas value={userData.uuidQr} size={80} bgColor="#fff" fgColor="#000" />
                  </div>
              </div>
              <div className="col-span-2 bg-black/70 flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 transition duration-200 hover:bg-black/80">
                  <span className="text-sm font-bold text-red-200 uppercase">Nombre y Apellido</span>
                  <span className="text-2xl font-extrabold tracking-wider text-center">{userData.nombreCompleto.toUpperCase()}</span>
              </div>
              <div className="col-span-1 bg-black/70 flex flex-col items-center justify-center p-2 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 transition duration-200 hover:bg-black/80">
                  <span className="text-sm font-bold text-red-200 uppercase">Sexo</span>
                  <span className="text-2xl font-extrabold tracking-wider">{userData.sexo.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex justify-end mt-4 z-10 relative">
              <button className="text-sm bg-white text-red-700 px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-lg transition duration-300 hover:bg-gray-100 transform hover:scale-105" title="Descargar credencial">
                  <FaFileDownload className="text-xl" /> Descargar PDF
              </button>
            </div>
          </section>
        )}

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

      <section className="bg-white text-gray-800 p-6 rounded-3xl shadow-xl mt-8 border border-gray-200">
        <h2 className="font-bold mb-4 text-2xl text-red-700 border-b pb-2">Próximos Eventos del Club</h2>
        <div className="bg-gray-100 rounded-lg p-6 shadow-inner border border-red-300/50">
          {eventos.length === 0 ? ( <p className="text-gray-500 italic">No hay eventos próximos.</p> ) : (
            <div className="flex flex-col gap-6">
              {eventos.map((evento) => (
                <div key={evento.id} onClick={() => navigate(`/eventos/${evento.id}`)} className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition duration-200 border border-gray-200 w-full cursor-pointer">
                  <h3 className="text-xl font-bold mb-2 text-red-700">{evento.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-2">{new Date(evento.fecha_inicio).toLocaleDateString()} – {new Date(evento.fecha_fin).toLocaleDateString()}</p>
                  <p className="text-gray-700">{evento.descripcion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 text-right">
          <button onClick={() => navigate('/eventos')} className="text-sm bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg transition duration-300 hover:bg-red-800 transform hover:scale-105">
            Ver todos los eventos
          </button>
        </div>
      </section>
    </>
  );
}

export default SociosPage;