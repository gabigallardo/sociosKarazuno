import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import logo from '../../assets/logo.png'; 

const PlantillaCredencialPDF = ({ id, userData }) => {
  if (!userData) return null;

  return (
    <div id={id} style={{
      width: '794px',        
      minHeight: '1123px',  
      padding: '60px',
      backgroundColor: 'white',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#333',
      position: 'absolute',
      left: '-9999px',      
      top: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      
      {/* Encabezado */}
      <div style={{ width: '100%', borderBottom: '4px solid #B91C1C', paddingBottom: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logo} alt="Logo Karazuno" style={{ height: '80px' }} />
        <div>
             <h1 style={{ margin: 0, color: '#B91C1C', textTransform: 'uppercase', fontSize: '28px' }}>Pase de Acceso</h1>
             <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Uso exclusivo para socios</p>
        </div>
      </div>

      {/* Mensaje de Bienvenida */}
      <div style={{ marginBottom: '40px', width: '80%' }}>
        <h2 style={{ fontSize: '36px', margin: '0 0 20px', color: '#1F2937' }}>
          ¡Hola, <span style={{ color: '#B91C1C' }}>{userData.nombreCompleto}</span>!
        </h2>
        <p style={{ fontSize: '24px', lineHeight: '1.5', color: '#4B5563' }}>
          Utiliza este código QR para poder acceder a través del molinete de entrada.
        </p>
      </div>

      <div style={{ 
          padding: '30px', 
          border: '2px dashed #B91C1C', 
          borderRadius: '20px', 
          backgroundColor: '#FEF2F2',
          marginBottom: '40px'
      }}>
        <QRCodeCanvas 
            value={userData.uuidQr} 
            size={350} 
            level={"H"} 
            fgColor={"#000000"}
            bgColor={"#ffffff"}
        />
        <p style={{ marginTop: '15px', fontSize: '16px', fontWeight: 'bold', color: '#991B1B' }}>
            {userData.uuidQr}
        </p>
      </div>

      {/* Instrucciones */}
      <div style={{ backgroundColor: '#F3F4F6', padding: '20px', borderRadius: '10px', width: '90%', marginBottom: 'auto' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '18px', color: '#374151' }}>Instrucciones de uso:</h3>
        <ul style={{ textAlign: 'left', fontSize: '16px', color: '#4B5563', lineHeight: '1.8' }}>
            <li>Asegúrate de subir el brillo de tu pantalla al máximo antes de escanear.</li>
            <li>Si lo imprimes, evita doblar la hoja sobre el código QR.</li>
            <li>Este código es personal e intransferible.</li>
        </ul>
      </div>

      {/* Footer */}
      <div style={{ width: '100%', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '12px', color: '#9CA3AF' }}>
        <p>Club Deportivo Socios Karazuno - Sistema de Gestión</p>
        <p>Generado el: {new Date().toLocaleDateString()}</p>
      </div>

    </div>
  );
};

export default PlantillaCredencialPDF;