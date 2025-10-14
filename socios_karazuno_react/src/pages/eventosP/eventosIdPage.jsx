import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getEventoById } from '../../api/eventos.api'; 
import { UserContext } from '../../contexts/User.Context';
import { FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

function EventoIdPage() {
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useContext(UserContext); 

  const rolesPermitidos = ['socio', 'jugador'];
  const puedeVerChecklist = user && user.roles.some(rol => rolesPermitidos.includes(rol));

  const checklistItems = [
    { id: 1, label: 'Inscripción', pagado: true, responsable: 'Tesorería Club' },
    { id: 2, label: 'Transporte', pagado: false, responsable: 'Coordinador de Viaje' },
    { id: 3, label: 'Comida', pagado: false, responsable: 'Delegado de Equipo' },
    { id: 4, label: 'Hospedaje', pagado: true, responsable: 'Tesorería Club' },
  ];


  useEffect(() => {
    async function cargarEvento() {
      try {
        const res = await getEventoById(id);
        setEvento(res.data);
      } catch (error) {
        console.error("Error al cargar el evento:", error);
      } finally {
        setLoading(false);
      }
    }
    cargarEvento();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Cargando evento...</p>;
  }

  if (!evento) {
    return <p className="text-center mt-10 text-red-500">No se pudo encontrar el evento.</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <img
            src={evento.imagen_url || 'https://via.placeholder.com/1200x400'}
            alt={`Banner de ${evento.nombre}`}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="p-6 md:p-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{evento.nombre}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-red-600" />
                <span>{new Date(evento.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-600" />
                <span>{evento.lugar || 'Lugar a confirmar'}</span>
              </div>
            </div>
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg">{evento.descripcion}</p>
            </div>

            {puedeVerChecklist && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Gestión de Pagos del Viaje</h2>
                <ul className="space-y-4">
                  {checklistItems.map(item => (
                    <li key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        {item.pagado ? (
                          <FaCheckCircle className="text-green-500 text-2xl mr-4" />
                        ) : (
                          <FaRegCircle className="text-gray-400 text-2xl mr-4" />
                        )}
                        <div>
                           <span className="font-semibold text-lg text-gray-800">{item.label}</span>
                           <p className="text-sm text-gray-500">Responsable: {item.responsable}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-bold rounded-full ${item.pagado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.pagado ? 'Pagado' : 'Pendiente'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventoIdPage;