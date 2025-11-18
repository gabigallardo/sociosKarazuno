// src/pages/entrenadoresP/EntrenadoresPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllUsuarios, updateUsuario } from '../../api/usuarios.api';
import { getAllCategorias } from '../../api/categorias.api'; 
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modal'; // Asegúrate de importar tu componente Modal
import { FaEdit, FaCheckCircle } from 'react-icons/fa'; 

function EntrenadoresPage() {
    const [profesores, setProfesores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
    const [seleccionTemporalIds, setSeleccionTemporalIds] = useState(new Set()); // Para manejar cambios antes de guardar

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [categoriasData, usuariosData] = await Promise.all([
                    getAllCategorias(),
                    getAllUsuarios()
                ]);

                // 1. Procesar Categorías
                if (Array.isArray(categoriasData)) {
                    // Ordenar para que se vean bonitas
                    const ordenadas = [...categoriasData].sort((a, b) => 
                        a.disciplina_nombre.localeCompare(b.disciplina_nombre) || 
                        a.nombre_categoria.localeCompare(b.nombre_categoria)
                    );
                    setCategorias(ordenadas);
                }

                // 2. Procesar Profesores
                if (Array.isArray(usuariosData)) {
                    const profes = usuariosData.filter(u => u.roles && u.roles.includes('profesor'));
                    setProfesores(profes);
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar los datos.");
                toast.error("No se pudieron cargar los datos.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // --- Lógica del Modal ---

    // Abrir modal y cargar el estado actual del profesor
    const abrirModal = (profesor) => {
        setProfesorSeleccionado(profesor);
        // Creamos un Set con los IDs actuales para manipulación rápida
        const idsActuales = new Set(profesor.categorias_a_cargo_ids || []);
        setSeleccionTemporalIds(idsActuales);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setProfesorSeleccionado(null);
        setSeleccionTemporalIds(new Set());
    };

    const toggleCategoria = (categoriaId) => {
        const nuevosIds = new Set(seleccionTemporalIds);
        if (nuevosIds.has(categoriaId)) {
            nuevosIds.delete(categoriaId);
        } else {
            nuevosIds.add(categoriaId);
        }
        setSeleccionTemporalIds(nuevosIds);
    };

    // Guardar cambios en la API
    const guardarCambios = async () => {
        if (!profesorSeleccionado) return;

        const nuevasCategoriasArray = Array.from(seleccionTemporalIds);

        const datosActualizados = {
            ...profesorSeleccionado, 
            categorias_a_cargo_ids: nuevasCategoriasArray, 
        };
        
        delete datosActualizados.id; 
        delete datosActualizados.created_at; 
        delete datosActualizados.updated_at; 

        try {
            await updateUsuario(profesorSeleccionado.id, datosActualizados);
            
            // Actualizar estado local de la tabla sin recargar
            setProfesores(prev => prev.map(p => 
                p.id === profesorSeleccionado.id 
                ? { ...p, categorias_a_cargo_ids: nuevasCategoriasArray } 
                : p
            ));

            toast.success("Categorías actualizadas correctamente");
            cerrarModal();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar los cambios");
        }
    };


    const categoriasAgrupadas = useMemo(() => {
        return categorias.reduce((acc, cat) => {
            const disciplina = cat.disciplina_nombre || "Otras";
            if (!acc[disciplina]) acc[disciplina] = [];
            acc[disciplina].push(cat);
            return acc;
        }, {});
    }, [categorias]);


    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando sistema...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Equipo de Entrenadores</h1>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    Total: {profesores.length}
                </span>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Profesor</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Asignaciones</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {profesores.map((profesor) => {
                            const cantidadAsignada = profesor.categorias_a_cargo_ids?.length || 0;
                            return (
                                <tr key={profesor.id} className="hover:bg-blue-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
                                                {profesor.nombre.charAt(0)}{profesor.apellido.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{profesor.nombre} {profesor.apellido}</div>
                                                <div className="text-xs text-gray-500">DNI: {profesor.nro_documento}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {profesor.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {cantidadAsignada > 0 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {cantidadAsignada} Categoría{cantidadAsignada !== 1 && 's'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Sin asignar
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => abrirModal(profesor)}
                                            className="text-indigo-600 hover:text-indigo-900 font-semibold flex items-center justify-end gap-2 ml-auto hover:bg-indigo-50 px-3 py-1 rounded-md transition"
                                        >
                                            <FaEdit /> Gestionar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL --- */}
            <Modal isOpen={isModalOpen} onClose={cerrarModal}>
                {profesorSeleccionado && (
                    <div className="flex flex-col h-full max-h-[80vh]">
                        {/* Header Modal */}
                        <div className="border-b pb-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Asignar Categorías</h2>
                            <p className="text-sm text-gray-500">
                                Editando a: <span className="font-semibold text-indigo-600">{profesorSeleccionado.nombre} {profesorSeleccionado.apellido}</span>
                            </p>
                        </div>

                        {/* Body Modal (Scrollable) */}
                        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {Object.keys(categoriasAgrupadas).length === 0 ? (
                                <p className="text-gray-400 italic">No hay categorías disponibles.</p>
                            ) : (
                                Object.entries(categoriasAgrupadas).map(([disciplina, listaCats]) => (
                                    <div key={disciplina} className="mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                                            {disciplina}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {listaCats.map(cat => {
                                                const isSelected = seleccionTemporalIds.has(cat.id);
                                                return (
                                                    <label 
                                                        key={cat.id} 
                                                        className={`
                                                            flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                                            ${isSelected 
                                                                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                                                                : 'bg-white border-gray-200 hover:bg-gray-50'}
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
                                                            ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300'}
                                                        `}>
                                                            {isSelected && <FaCheckCircle className="text-xs" />}
                                                        </div>
                                                        <input 
                                                            type="checkbox" 
                                                            className="hidden"
                                                            checked={isSelected}
                                                            onChange={() => toggleCategoria(cat.id)}
                                                        />
                                                        <span className={`text-sm ${isSelected ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                                                            {cat.nombre_categoria}
                                                        </span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="border-t pt-4 mt-4 flex justify-end gap-3 bg-white">
                            <button 
                                onClick={cerrarModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={guardarCambios}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default EntrenadoresPage;