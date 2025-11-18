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
      const data = await getHorariosPorCategoria(categoria.id);
      setHorarios(data);
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
        try {
            const response = await generarSesionesDeEntrenamiento(selectedCategoria.id, fechaInicio, fechaFin);
            toast.success(response.message);
            setIsGenerarModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || "Error al generar sesiones.");
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
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
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
      
      {loading ? <p>Cargando horarios...</p> : (
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