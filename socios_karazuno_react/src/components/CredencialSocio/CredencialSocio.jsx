import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { FaFileDownload } from 'react-icons/fa';
import patternImg from '../../assets/pattern.jpg';

function CredencialSocio({ userData }) {
  return (
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
  );
}

export default CredencialSocio;