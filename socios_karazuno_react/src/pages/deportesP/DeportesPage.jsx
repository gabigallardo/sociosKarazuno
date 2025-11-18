import React, { useState, useEffect } from "react";
import { 
    getAllDisciplinas, 
    createDisciplina, 
    updateDisciplina, 
    deleteDisciplina 
} from "../../api/disciplinas.api";
import { 
    getAllCategorias, 
    createCategoria, 
    updateCategoria, 
    deleteCategoria 
} from "../../api/categorias.api";
import { FaFutbol, FaPlus, FaEdit, FaTrash, FaLayerGroup, FaSave, FaTimes } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal"; 

export default function DeportesPage() {
    const [disciplinas, setDisciplinas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    
    // Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [modalType, setModalType] = useState('disciplina');
    const [editingId, setEditingId] = useState(null);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

    const cargarDatos = async () => {
        try {
            const [disciplinasData, categoriasData] = await Promise.all([
                getAllDisciplinas(),
                getAllCategorias(),
            ]);
            setDisciplinas(disciplinasData || []);
            setCategorias(categoriasData || []);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            toast.error("Error al cargar la información.");
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // --- Manejadores de Modal ---

    const abrirModalCrear = (type) => {
        setModalType(type);
        setModalMode('create');
        setEditingId(null);
        reset({
            nombre: '', descripcion: '', 
            nombre_categoria: '', disciplina: '', edad_minima: '', edad_maxima: '', sexo: 'mixto'
        });
        setIsModalOpen(true);
    };

    const abrirModalEditar = (item, type) => {
        setModalType(type);
        setModalMode('edit');
        setEditingId(item.id);
        
        // Rellenar formulario
        if (type === 'disciplina') {
            setValue('nombre', item.nombre);
            setValue('descripcion', item.descripcion);
        } else {
            setValue('nombre_categoria', item.nombre_categoria);
            setValue('disciplina', item.disciplina); 
            setValue('edad_minima', item.edad_minima);
            setValue('edad_maxima', item.edad_maxima);
            setValue('sexo', item.sexo);
        }
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        reset();
    };

    // --- Lógica de Guardado ---

    const onSubmit = async (data) => {
        try {
            if (modalType === 'disciplina') {
                if (modalMode === 'create') {
                    await createDisciplina(data);
                    toast.success("Deporte creado con éxito");
                } else {
                    await updateDisciplina(editingId, data);
                    toast.success("Deporte actualizado");
                }
            } else {
                // Validaciones extra para categoría si es necesario
                if (parseInt(data.edad_minima) > parseInt(data.edad_maxima)) {
                    toast.error("La edad mínima no puede ser mayor a la máxima");
                    return;
                }
                
                if (modalMode === 'create') {
                    await createCategoria(data);
                    toast.success("Categoría creada con éxito");
                } else {
                    await updateCategoria(editingId, data);
                    toast.success("Categoría actualizada");
                }
            }
            cerrarModal();
            cargarDatos();
        } catch (error) {
            console.error("Error guardando:", error);
            toast.error("Ocurrió un error al guardar.");
        }
    };

    const handleDelete = async (id, type) => {
        if (window.confirm(`¿Estás seguro de eliminar este ${type}?`)) {
            try {
                if (type === 'disciplina') await deleteDisciplina(id);
                else await deleteCategoria(id);
                toast.success("Eliminado correctamente");
                cargarDatos();
            } catch (error) {
                console.error("Error eliminando:", error);
                toast.error("No se pudo eliminar. Verifique que no tenga dependencias.");
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                    <FaFutbol className="text-red-600" />
                    Gestión Deportiva
                </h1>
                <div className="flex gap-3">
                    <button 
                        onClick={() => abrirModalCrear('disciplina')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2 text-sm font-medium"
                    >
                        <FaPlus /> Nuevo Deporte
                    </button>
                    <button 
                        onClick={() => abrirModalCrear('categoria')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2 text-sm font-medium"
                    >
                        <FaLayerGroup /> Nueva Categoría
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- SECCIÓN DEPORTES --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-700">Deportes ({disciplinas.length})</h2>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {disciplinas.length === 0 ? (
                            <p className="p-6 text-center text-gray-500 italic">No hay deportes registrados.</p>
                        ) : (
                            disciplinas.map((d) => (
                                <div key={d.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{d.nombre}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{d.descripcion || "Sin descripción"}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => abrirModalEditar(d, 'disciplina')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Editar">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(d.id, 'disciplina')} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Eliminar">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- SECCIÓN CATEGORÍAS --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-700">Categorías ({categorias.length})</h2>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {categorias.length === 0 ? (
                            <p className="p-6 text-center text-gray-500 italic">No hay categorías registradas.</p>
                        ) : (
                            categorias.map((c) => {
                                const deporteNombre = disciplinas.find(d => d.id === c.disciplina)?.nombre || "Desconocido";
                                return (
                                    <div key={c.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-800">{c.nombre_categoria}</h3>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                                                    {deporteNombre}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                                <span>Edad: {c.edad_minima}-{c.edad_maxima} años</span>
                                                <span className="capitalize">• {c.sexo}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => abrirModalEditar(c, 'categoria')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(c.id, 'categoria')} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={cerrarModal}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {modalMode === 'create' ? 'Crear' : 'Editar'} {modalType === 'disciplina' ? 'Deporte' : 'Categoría'}
                        </h2>
                        <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 transition">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* Campos para Disciplina */}
                        {modalType === 'disciplina' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Deporte</label>
                                    <input 
                                        {...register("nombre", { required: "El nombre es obligatorio" })} 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        placeholder="Ej: Fútbol"
                                    />
                                    {errors.nombre && <span className="text-red-500 text-xs">{errors.nombre.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea 
                                        {...register("descripcion")} 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none h-24"
                                        placeholder="Breve descripción..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Campos para Categoría */}
                        {modalType === 'categoria' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
                                    <input 
                                        {...register("nombre_categoria", { required: "Nombre requerido" })} 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Ej: Sub-18"
                                    />
                                    {errors.nombre_categoria && <span className="text-red-500 text-xs">{errors.nombre_categoria.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deporte Asociado</label>
                                    <select 
                                        {...register("disciplina", { required: "Selecciona un deporte" })} 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                    </select>
                                    {errors.disciplina && <span className="text-red-500 text-xs">{errors.disciplina.message}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad Mínima</label>
                                        <input 
                                            type="number" 
                                            {...register("edad_minima", { required: true, min: 0 })} 
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad Máxima</label>
                                        <input 
                                            type="number" 
                                            {...register("edad_maxima", { required: true, min: 0 })} 
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                    <select {...register("sexo")} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                                        <option value="mixto">Mixto</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Footer del Modal */}
                        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                            <button 
                                type="button"
                                onClick={cerrarModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none flex items-center gap-2 ${
                                    modalType === 'disciplina' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                <FaSave /> {modalMode === 'create' ? 'Crear' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}