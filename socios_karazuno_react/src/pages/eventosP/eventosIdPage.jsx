import { useEffect, useState } from "react";
import { getEventoById } from "../../api/eventos.api";
import { getAllUsuarios } from "../../api/usuarios.api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function EventosIdPage() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [showManage, setShowManage] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eventoData, usuariosData] = await Promise.all([
          getEventoById(id),
          getAllUsuarios(),
        ]);
        
        if (!eventoData) {
          setError("El evento no existe o no se pudo cargar.");
          toast.error("El evento no fue encontrado.");
          navigate("/eventos");
        } else {
          setEvento(eventoData);
          setUsuarios(usuariosData);
        }
      } catch (err) {
        setError("Ocurrió un error al cargar los datos del evento.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, navigate]);
  
  const findUserName = (userId) => {
    if (!userId || !usuarios.length) return <span className="text-gray-500">No asignado</span>;
    
    const idToSearch = typeof userId === 'object' ? userId.id : userId;

    const user = usuarios.find(u => u.id === idToSearch);
    return user ? `${user.nombre} ${user.apellido}` : <span className="text-red-500">Usuario no encontrado</span>;
  };

  if (loading) {
    return <p className="text-center mt-8">Cargando detalles del evento...</p>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full font-semibold shadow-md"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    );
  }

  if (!evento) return null;

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{evento.titulo}</h1>
      <div className="space-y-3 text-gray-700">
        <p><strong>Tipo:</strong> <span className="capitalize">{evento.tipo}</span></p>
        <p><strong>Lugar:</strong> {evento.lugar}</p>
        <p><strong>Descripción:</strong> {evento.descripcion || "No hay descripción."}</p>
        <p><strong>Desde:</strong> {new Date(evento.fecha_inicio).toLocaleString()}</p>
        <p><strong>Hasta:</strong> {new Date(evento.fecha_fin).toLocaleString()}</p>
        {evento.organizador && (
          <p>
                <strong>Organizador:</strong> 
                {findUserName(evento.organizador?.id || evento.organizador)}
            </p>
        )}
      </div>

      {evento.tipo === 'viaje' && (
        <div className="mt-6 border-t pt-4">
          <button
            onClick={() => setShowManage(!showManage)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow-sm w-full text-left"
          >
            {showManage ? "Ocultar Gestión de Viaje" : "Mostrar Gestión de Viaje"}
          </button>

          {showManage && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 animate-fade-in">
              <h2 className="text-xl font-bold mb-3 text-gray-800">Checklist de Pagos</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Inscripción:</strong> ${evento.costo || '0.00'} - Pagar a: <strong>{findUserName(evento.pago_inscripcion_a?.id || evento.pago_inscripcion_a)}</strong></li>
                <li><strong>Transporte:</strong> ${evento.costo_viaje || '0.00'} - Pagar a: <strong>{findUserName(evento.pago_transporte_a?.id || evento.pago_transporte_a)}</strong></li>
                <li><strong>Hospedaje:</strong> ${evento.costo_hospedaje || '0.00'} - Pagar a: <strong>{findUserName(evento.pago_hospedaje_a?.id || evento.pago_hospedaje_a)}</strong></li>
                <li><strong>Comida:</strong> ${evento.costo_comida || '0.00'} - Pagar a: <strong>{findUserName(evento.pago_comida_a?.id || evento.pago_comida_a)}</strong></li>
              </ul>
              
              <h2 className="text-xl font-bold mt-5 mb-3 text-gray-800">Profesores a Cargo</h2>
              <ul className="space-y-1 list-disc list-inside">
                {evento.profesores_a_cargo?.length > 0 ? (
                    evento.profesores_a_cargo.map(prof => (
                        <li key={prof.id || prof}>{findUserName(prof.id || prof)}</li>
                    ))
                ) : (
                    <li className="text-gray-500">No hay profesores asignados.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-4 border-t pt-4">
        <button
          onClick={() => navigate(`/eventos/editar/${evento.id}`)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm"
        >
          Editar
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm"
        >
          Volver
        </button>
      </div>
    </div>
  );
}