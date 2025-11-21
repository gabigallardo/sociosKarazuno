import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { FaQrcode, FaIdCard, FaBirthdayCake, FaVenusMars, FaUser } from 'react-icons/fa';
import patternImg from '../../assets/pattern.jpg'; //

import { generarReportePDF } from '../../utils/pdfUtils';
import PlantillaCredencialPDF from '../Reporte/PlantillaCredencialPDF';

function CredencialSocio({ userData, className = "" }) {

  const handleDescargarPase = () => {
    const nombreArchivo = `Pase_Acceso_${userData.nombreCompleto.replace(/\s+/g, '_')}.pdf`;
    generarReportePDF('plantilla-pase-acceso-oculta', nombreArchivo);
  };

  return (
    <section
      id="credencial-completa"
      className={`relative overflow-hidden rounded-3xl shadow-2xl bg-black text-white transition-all duration-500 hover:shadow-red-900/50 border border-white/20 flex flex-col p-6 ${className}`}
      style={{ minHeight: '460px' }} 
    >
      {/* --- Fondo: Gradiente Rojo a Negro --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-900 to-black z-0"></div>
      
      {/* Patrón sutil superpuesto */}
      <div 
        className="absolute inset-0 opacity-20 z-0 mix-blend-overlay" 
        style={{ 
            backgroundImage: `url(${patternImg})`,
            backgroundSize: '150px',
            backgroundRepeat: 'repeat'
        }}
      ></div>
      
      {/* Header Centrado Verticalmente un poco si hay espacio extra */}
      <div className="flex-none">
        <h2 className="font-black uppercase tracking-[0.2em] text-xl mb-6 text-center z-10 relative text-white drop-shadow-md border-b border-white/20 pb-2 mx-auto w-fit">
            Credencial de Socio
        </h2>
      </div>
      
      {/* items-center para centrar contenido si la tarjeta es muy alta */}
      <div className="grid grid-cols-3 gap-4 flex-1 z-10 relative content-center">
        
        {/* --- Foto de Perfil --- */}
        <div 
          id="foto-perfil-container" 
          className="row-span-2 col-span-1 flex flex-col items-center justify-center p-3 bg-black/40 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner h-full"
        >
          <div className="aspect-square w-full max-w-[140px] rounded-full overflow-hidden shadow-lg border-4 border-white/80 bg-gray-300">
            <img 
              src={userData.fotoUrl} 
              alt="Foto de perfil" 
              className="w-full h-full object-cover" 
              crossOrigin="anonymous"
            />
          </div>
          <p className="text-[10px] text-white/80 mt-2 uppercase tracking-widest font-bold">Socio Activo</p>
        </div>
        
        {/* --- DNI --- */}
        <div className="col-span-2 bg-white/10 flex flex-col items-center justify-center p-3 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg h-full">
          <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest mb-1">Número DNI</span>
          <span className="text-3xl font-black tracking-widest text-white drop-shadow-md font-mono">
            {userData.numeroDNI}
          </span>
        </div>
        
        {/* --- Fecha Nacimiento --- */}
        <div className="col-span-1 bg-white/10 flex flex-col items-center justify-center p-2 rounded-2xl backdrop-blur-sm border border-white/10 h-full">
          <span className="text-[9px] font-bold text-white/80 uppercase mb-1">Nacimiento</span>
          <span className="text-lg font-bold text-white">{userData.fechaNacimiento}</span>
        </div>
        
        {/* --- Código QR --- */}
        <div className="col-span-1 flex flex-col items-center justify-center p-2 bg-white rounded-2xl shadow-lg h-full">
          <div className="p-1">
            <QRCodeCanvas id="qr-code-canvas" value={userData.uuidQr} size={75} bgColor="#fff" fgColor="#000" style={{ width: '100%', height: 'auto', maxHeight: '80px', maxWidth: '80px' }} />
          </div>
        </div>
        
        {/* --- Nombre y Apellido --- */}
        <div className="col-span-2 bg-gradient-to-r from-red-950/50 to-black/50 flex flex-col items-center justify-center p-3 rounded-2xl backdrop-blur-sm border border-white/10 h-full">
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Nombre y Apellido</span>
          <span className="text-lg md:text-xl font-black tracking-wide text-center text-white leading-tight uppercase drop-shadow-md">
            {userData.nombreCompleto}
          </span>
        </div>
        
        {/* --- Sexo --- */}
        <div className="col-span-1 bg-white/10 flex flex-col items-center justify-center p-2 rounded-2xl backdrop-blur-sm border border-white/10 h-full">
          <span className="text-[9px] font-bold text-white/80 uppercase mb-1">Sexo</span>
          <span className="text-lg font-bold text-white">{userData.sexo.toUpperCase()}</span>
        </div>
      </div>

      {/* --- Botón --- */}
      <div className="flex-none flex justify-center mt-6 z-10 relative pb-2">
        <button 
          onClick={handleDescargarPase}
          className="bg-white text-red-800 hover:bg-gray-100 px-6 py-2.5 rounded-full flex items-center gap-2 font-bold shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-red-600" 
          title="Descargar Pase de Acceso PDF"
        >
          <FaQrcode className="text-xl" /> 
          <span className="uppercase text-sm tracking-wide">Descargar Pase PDF</span>
        </button>
      </div>

      {/* Elemento oculto visualmente pero disponible para html2canvas */}
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '210mm' }}>
        <PlantillaCredencialPDF 
            id="plantilla-pase-acceso-oculta"
            userData={userData}
        />
      </div>

    </section>
  );
}

export default CredencialSocio;