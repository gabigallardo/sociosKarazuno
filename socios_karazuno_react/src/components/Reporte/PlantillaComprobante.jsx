import React from 'react';
import logo from '../../assets/logo.webp'; // Ajusta la ruta a tu logo

const PlantillaComprobante = ({ id, cuota, usuario }) => {
  if (!cuota || !usuario) return null;

  // Cálculos y Formatos
  const montoBase = parseFloat(cuota.monto) || 0;
  const descuento = cuota.descuento_aplicado ? (montoBase * cuota.descuento_aplicado) / 100 : 0;
  const totalPagado = montoBase - descuento;

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
  const fechaHoy = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div id={id} style={{
      width: '794px',       // Ancho A4
      minHeight: '1123px',  // Alto A4
      padding: '60px',
      backgroundColor: 'white',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#333',
      position: 'absolute',
      left: '-9999px',      // Oculto
      top: 0,
      boxSizing: 'border-box'
    }}>
      
      {/* Marca de agua PAGADO */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '150px',
        color: 'rgba(22, 163, 74, 0.1)', // Verde muy suave
        fontWeight: 'bold',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        PAGADO
      </div>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={logo} alt="Logo" style={{ height: '80px' }} />
          <div>
            <h2 style={{ margin: 0, color: '#B91C1C', textTransform: 'uppercase', fontSize: '24px' }}>Karazuno</h2>
            <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>Club Deportivo y Social</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>RUC: 20-12345678-9</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: 0, fontSize: '32px', color: '#333' }}>RECIBO</h1>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>N°: {String(cuota.id).padStart(8, '0')}</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Fecha: {fechaHoy}</p>
        </div>
      </div>

      {/* Datos del Cliente */}
      <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'relative', zIndex: 1 }}>
        <h3 style={{ margin: '0 0 15px', fontSize: '16px', color: '#B91C1C', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>Datos del Socio</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
          <p style={{ margin: 0 }}><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
          <p style={{ margin: 0 }}><strong>Email:</strong> {usuario.email}</p>
          <p style={{ margin: 0 }}><strong>DNI:</strong> {usuario.nro_documento || '-'}</p>
          <p style={{ margin: 0 }}><strong>ID Socio:</strong> {usuario.id}</p>
        </div>
      </div>

      {/* Detalle del Pago */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#B91C1C', color: 'white', fontSize: '14px' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Concepto</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Periodo</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee', fontSize: '14px' }}>
              <td style={{ padding: '15px 12px' }}>Cuota Social Mensual</td>
              <td style={{ padding: '15px 12px', textAlign: 'center' }}>{cuota.periodo}</td>
              <td style={{ padding: '15px 12px', textAlign: 'right' }}>{formatMoney(montoBase)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
              <span>Subtotal:</span>
              <span>{formatMoney(montoBase)}</span>
            </div>
            {descuento > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#16a34a' }}>
                <span>Descuento ({cuota.descuento_aplicado}%):</span>
                <span>- {formatMoney(descuento)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', borderTop: '2px solid #333', paddingTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Total Pagado:</span>
              <span>{formatMoney(totalPagado)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div style={{ marginTop: '100px', textAlign: 'center', fontSize: '12px', color: '#999', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p>Este documento es un comprobante de pago válido emitido electrónicamente.</p>
        <p>Gracias por ser parte de Karazuno.</p>
      </div>

    </div>
  );
};

export default PlantillaComprobante;