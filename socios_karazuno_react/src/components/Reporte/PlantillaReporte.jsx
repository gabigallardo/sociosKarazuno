import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import logo from '../../assets/logo.webp';

// 1. Recibimos "socios" con valor por defecto vacío para evitar errores
const PlantillaReporte = ({ id, socios = [], usuarioActivo }) => {
  
  // 2. Validación simple
  if (!socios) return null;

  // Cálculo de datos
  const totalAlDia = socios.filter(s => s.cuota_al_dia).length;
  const totalDeuda = socios.length - totalAlDia;

  const dataGrafico = [
    {
      name: 'Estado de Cuotas',
      'Al Día': totalAlDia,
      'Con Deuda': totalDeuda,
    }
  ];

  return (
    <div id={id} style={{
      width: '794px',        // Ancho A4 en píxeles (aprox 96 DPI)
      minHeight: '1123px',   // Alto A4
      padding: '40px',
      backgroundColor: 'white',
      position: 'absolute',
      left: '-9999px',       // Oculto de la vista del usuario
      top: 0,
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b-4 border-orange-500 pb-4 mb-8">
        <div className="flex items-center gap-4">
           <img src={logo} alt="Logo" style={{ height: '60px', width: 'auto' }} />
           <div>
             <h1 className="text-2xl font-bold text-gray-800">REPORTE DE ESTADO DE SOCIOS</h1>
             <p className="text-gray-500 text-sm">Sistema Karazuno</p>
           </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-700">Fecha: {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">Generado por: {usuarioActivo || 'Admin'}</p>
        </div>
      </div>

      {/* Resumen Global */}
      <div className="mb-10 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Resumen Global</h3>
        <p className="text-gray-600">
          Se están visualizando un total de <span className="font-bold">{socios.length}</span> socios registrados en el sistema.
        </p>
      </div>

      {/* Gráfico */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-orange-500 pl-2">
          Estado de Pagos
        </h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={dataGrafico} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Al Día" fill="#16a34a" isAnimationActive={false} barSize={60} label={{ position: 'right' }} />
              <Bar dataKey="Con Deuda" fill="#dc2626" isAnimationActive={false} barSize={60} label={{ position: 'right' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Tabla de deudores (solo si hay deuda) */}
      {totalDeuda > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-red-500 pl-2">
            Detalle: Socios con Deuda
          </h3>
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Documento</th>
                <th className="px-4 py-2">Disciplina</th>
              </tr>
            </thead>
            <tbody>
              {socios.filter(s => !s.cuota_al_dia).slice(0, 10).map((socio, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-4 py-2 font-medium text-gray-900">{socio.nombre_completo}</td>
                  <td className="px-4 py-2">{socio.nro_documento}</td>
                  <td className="px-4 py-2">{socio.disciplina_nombre || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalDeuda > 10 && <p className="text-xs text-gray-400 mt-2">* Se muestran los primeros 10 resultados.</p>}
        </div>
      )}

      <div className="mt-20 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>Documento oficial interno.</p>
      </div>
    </div>
  );
};

export default PlantillaReporte;