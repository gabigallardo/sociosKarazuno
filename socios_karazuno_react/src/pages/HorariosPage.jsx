import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/User.Context';
import { getAllCategorias } from '../api/categorias.api';
import { getHorariosPorCategoria, createHorario, updateHorario, deleteHorario } from '../api/horarios.api';

// (Asumimos que crearás estos componentes en los siguientes pasos)
import HorarioCard from '../features/horarios/HorarioCard'; 
import HorarioForm from '../features/horarios/HorarioForm';
import Modal from '../components/Modal'; // Un componente Modal genérico

import { FaClock, FaPlus, FaArrowLeft, FaThLarge, FaCalendarPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import GenerarSesionesForm from '../features/horarios/GenerarSesionesForm'; // Importa el nuevo form
import { generarSesionesDeEntrenamiento } from '../api/horarios.api'; // Importa la nueva API

import { getSesionesPorCategoria } from '../api/sesiones.api';
import SesionCard from '../features/horarios/SesionCard'; 


export default function HorariosPage() {
  const { user } = useContext(UserContext);

  const [categorias, setCategorias] = useState([]);
  const [categoriasParaMostrar, setCategoriasParaMostrar] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [horarios, setHorarios] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null); // Para saber si estamos editando o creando
  const [isGenerarModalOpen, setIsGenerarModalOpen] = useState(false);

  const [sesiones, setSesiones] = useState([]);
  const [activeTab, setActiveTab] = useState('horarios');


  // Carga y filtra las categorías según el rol
  useEffect(() => {
    async function CargarCategorias() {
      setLoading(true);
      try {
        const data = await getAllCategorias();
        setCategorias(data);
        // Lógica de permisos
        const userRoles = user.roles || [];
        const esGestion = userRoles.includes('admin') || userRoles.includes('dirigente');
        if (esGestion) {
          setCategoriasParaMostrar(data);
        } else if (userRoles.includes('profesor')) {
          const idsACargo = user.categorias_a_cargo_ids || [];
          setCategoriasParaMostrar(data.filter(c => idsACargo.includes(c.id)));
        }
      } catch (error) {
        toast.error("No se pudieron cargar las categorías.");
      } finally {
        setLoading(false);
      }
    }
    CargarCategorias();
  }, [user]);

  // Carga los horarios cuando se selecciona una categoría
  const handleCategoriaClick = async (categoria) => {
    setSelectedCategoria(categoria);
    setLoading(true);
    try {
      // Carga en paralelo para más eficiencia
      const [horariosData, sesionesData] = await Promise.all([
        getHorariosPorCategoria(categoria.id),
        getSesionesPorCategoria(categoria.id)
      ]);
      setHorarios(horariosData);
      setSesiones(sesionesData);
    } catch (error) {
      toast.error("No se pudieron cargar los horarios.");
    } finally {
      setLoading(false);
    }
  };

  // Lógica para el modal y el formulario
  const handleOpenModal = (horario = null) => {
    setEditingHorario(horario);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHorario(null);
  };

  const handleSubmit = async (formData) => {
    const payload = { ...formData, categoria: selectedCategoria.id };
    try {
      if (editingHorario) {
        await updateHorario(editingHorario.id, payload);
        toast.success("Horario actualizado");
      } else {
        await createHorario(payload);
        toast.success("Horario creado");
      }
      handleCloseModal();
      // Recargar horarios
      const data = await getHorariosPorCategoria(selectedCategoria.id);
      setHorarios(data);
    } catch (error) {
      toast.error("Ocurrió un error al guardar.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este horario?")) {
      try {
        await deleteHorario(id);
        toast.success("Horario eliminado");
        setHorarios(horarios.filter(h => h.id !== id));
      } catch (error) {
        toast.error("Error al eliminar.");
      }
    }
  };

  const handleGenerarSubmit = async (fechaInicio, fechaFin) => {
    const toastId = toast.loading("Generando sesiones...");
        try {
            const response = await generarSesionesDeEntrenamiento(selectedCategoria.id, fechaInicio, fechaFin);
            setIsGenerarModalOpen(false);
            // Volvemos a pedir la lista COMPLETA y ACTUALIZADA de sesiones para esta categoría
            const nuevasSesiones = await getSesionesPorCategoria(selectedCategoria.id);            
            // Actualizamos el estado de React con la nueva lista
            setSesiones(nuevasSesiones);
            // 5. (Mejora UX) Cambiamos automáticamente a la pestaña de sesiones para ver el resultado
            setActiveTab('sesiones');            
            toast.success(response.message, { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.error || "Error al generar sesiones.", { id: toastId });
        }
    };

  if (loading && !selectedCategoria) {
    return <p>Cargando categorías...</p>;
  }

  // Vista 1: Selección de Categoría
  if (!selectedCategoria) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2"><FaThLarge /> Selecciona una Categoría</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriasParaMostrar.map(cat => (
            <div key={cat.id} onClick={() => handleCategoriaClick(cat)} className="p-4 bg-white rounded-lg shadow border cursor-pointer hover:border-red-500">
              <p className="font-bold text-red-700">{cat.disciplina_nombre}</p>
              <p>{cat.nombre_categoria}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vista 2: Gestión de Horarios para la Categoría seleccionada
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
            <button onClick={() => setSelectedCategoria(null)} className="flex items-center gap-2 text-gray-600 hover:text-black">
                <FaArrowLeft /> Volver a Categorías
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-2"><FaClock /> Horarios de {selectedCategoria.nombre_categoria}</h1>
        </div>
        <div className="flex gap-2"> {/* Contenedor para botones */}
              <button onClick={() => setIsGenerarModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FaCalendarPlus /> Generar Sesiones
              </button>
              <button onClick={() => handleOpenModal()} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FaPlus /> Añadir Horario
              </button>
            </div>
      </div>
      
       {/* Pestañas de Navegación */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-4">
          <button onClick={() => setActiveTab('horarios')} className={`py-2 px-4 font-semibold ${activeTab === 'horarios' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
            Horarios Semanales ({horarios.length})
          </button>
          <button onClick={() => setActiveTab('sesiones')} className={`py-2 px-4 font-semibold ${activeTab === 'sesiones' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
            Sesiones Programadas ({sesiones.length})
          </button>
        </nav>
      </div>
      
      {loading ? <p>Cargando...</p> : (
        <div>
          {/* Contenido Condicional basado en la Pestaña Activa */}
          {activeTab === 'horarios' && (
            <div className="space-y-4">
              {horarios.length > 0 ? (
                horarios.map(h => (
                  <HorarioCard key={h.id} horario={h} onEdit={() => handleOpenModal(h)} onDelete={() => handleDelete(h.id)} />
                ))
              ) : (
                <p>No hay horarios definidos para esta categoría.</p>
              )}
            </div>
          )}

          {activeTab === 'sesiones' && (
            <div className="space-y-4">
              {sesiones.length > 0 ? (
                sesiones.map(s => (
                  <SesionCard key={s.id} sesion={s} />
                ))
              ) : (
                <p>No hay sesiones programadas. Puedes generarlas desde la pestaña de "Horarios Semanales".</p>
              )}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-xl font-bold mb-4">{editingHorario ? "Editar" : "Crear"} Horario</h2>
        <HorarioForm 
            onSubmit={handleSubmit} 
            initialValues={editingHorario}
        />
      </Modal>

      <Modal isOpen={isGenerarModalOpen} onClose={() => setIsGenerarModalOpen(false)}>
            <GenerarSesionesForm 
              onSubmit={handleGenerarSubmit}
              onClose={() => setIsGenerarModalOpen(false)}
            />
      </Modal>
    </div>
  );
}