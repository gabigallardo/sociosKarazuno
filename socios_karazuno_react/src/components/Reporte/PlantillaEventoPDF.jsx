import React from 'react';
import logo from '../../assets/logo.webp';

const PlantillaEventoPDF = ({ id, evento, usuarios }) => {
  if (!evento) return null;

  const getNombre = (data) => {
    if (!usuarios || !data) return 'No asignado';
    
    const idToFind = (typeof data === 'object' && data !== null) ? data.id : data;

    const user = usuarios.find(u => u.id === idToFind);

    return user ? `${user.nombre} ${user.apellido}` : 'Desconocido';
  };

  // Formateadores
  const formatMoney = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-AR', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div id={id} style={{
      width: '794px',        
      minHeight: '1123px',   
      padding: '50px',
      backgroundColor: 'white',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#333',
      position: 'absolute',
      left: '-9999px',       // Oculto
      top: 0,
      boxSizing: 'border-box'
    }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #ea580c', paddingBottom: '20px', marginBottom: '30px' }}>
        <img src={logo} alt="Logo Karazuno" style={{ height: '70px', objectFit: 'contain' }} />
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#ea580c', textTransform: 'uppercase' }}>Ficha de Evento</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>Generado el: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Título */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#1f2937' }}>{evento.titulo}</h2>
        <span style={{ display: 'inline-block', padding: '6px 15px', backgroundColor: '#fff7ed', color: '#ea580c', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #fdba74' }}>
          {evento.tipo ? evento.tipo.toUpperCase() : 'EVENTO'}
        </span>
      </div>

      {/* Detalles Generales */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#ea580c', marginTop: 0 }}>Detalles Generales</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '2px' }}>LUGAR</strong>
            <span style={{ fontSize: '16px' }}>{evento.lugar || 'A confirmar'}</span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '2px' }}>FECHA INICIO</strong>
            <span style={{ fontSize: '14px' }}>{formatDate(evento.fecha_inicio)}</span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '2px' }}>FECHA FIN</strong>
            <span style={{ fontSize: '14px' }}>{formatDate(evento.fecha_fin)}</span>
          </div>

          <div>
            <strong style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '2px' }}>ORGANIZADOR</strong>
            <span style={{ fontSize: '14px' }}>{getNombre(evento.organizador)}</span>
          </div>
        </div>

        <div style={{ flex: 1.5, backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
          <h3 style={{ marginTop: 0, color: '#ea580c', fontSize: '16px' }}>Descripción</h3>
          <p style={{ lineHeight: '1.6', color: '#4b5563', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
            {evento.descripcion || "Sin descripción detallada disponible."}
          </p>
        </div>
      </div>

      {/* Tabla de Costos */}
      {(evento.costo > 0 || evento.costo_viaje > 0 || evento.costo_hospedaje > 0 || evento.costo_comida > 0) && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ borderLeft: '5px solid #ea580c', paddingLeft: '10px', color: '#1f2937' }}>Estructura de Costos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ea580c', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Concepto</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Responsable de Cobro</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {evento.costo > 0 && (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>Inscripción</td>
                  <td style={{ padding: '10px', color: '#666' }}>{getNombre(evento.pago_inscripcion_a)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(evento.costo)}</td>
                </tr>
              )}
              {evento.costo_viaje > 0 && (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>Transporte</td>
                  <td style={{ padding: '10px', color: '#666' }}>{getNombre(evento.pago_transporte_a)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(evento.costo_viaje)}</td>
                </tr>
              )}
              {evento.costo_hospedaje > 0 && (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>Hospedaje</td>
                  <td style={{ padding: '10px', color: '#666' }}>{getNombre(evento.pago_hospedaje_a)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(evento.costo_hospedaje)}</td>
                </tr>
              )}
              {evento.costo_comida > 0 && (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>Comida</td>
                  <td style={{ padding: '10px', color: '#666' }}>{getNombre(evento.pago_comida_a)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(evento.costo_comida)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Profesores */}
      {evento.profesores_a_cargo && evento.profesores_a_cargo.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ borderLeft: '5px solid #ea580c', paddingLeft: '10px', color: '#1f2937' }}>Equipo a Cargo</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
            {evento.profesores_a_cargo.map((profData, idx) => (
              <div key={idx} style={{ backgroundColor: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎓</span> {getNombre(profData)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
        <p style={{ margin: 0 }}>Documento generado por el Sistema de Gestión Socios Karazuno</p>
      </div>
    </div>
  );
};

export default PlantillaEventoPDF;