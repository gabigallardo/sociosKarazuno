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

    const [busqueda, setBusqueda] = useState("");

    // Lógica para agrupar
    const deportesFiltrados = disciplinas.filter(d => 
        d.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const obtenerCategoriasPorDeporte = (disciplinaId) => {
        return categorias.filter(c => c.disciplina === disciplinaId);
    };

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
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header con Buscador */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                    <FaFutbol className="text-red-700" /> {/* Color de marca */}
                    Deportes y Categorías
                </h1>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <input 
                        type="text"
                        placeholder="Buscar deporte..."
                        className="border rounded-lg px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-red-500 outline-none"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button 
                        onClick={() => abrirModalCrear('disciplina')}
                        className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2 whitespace-nowrap"
                    >
                        <FaPlus /> Deporte
                    </button>
                </div>
            </div>

            {/* LISTA AGRUPADA (La gran mejora UX) */}
            <div className="space-y-6">
                {deportesFiltrados.map((deporte, index) => {
                    const catsDeEsteDeporte = obtenerCategoriasPorDeporte(deporte.id);

                    // Lógica para alternar estilos
                    const esPar = index % 2 === 0;

                    // Definimos clases dinámicas según si es par o impar
                    const cardBackground = esPar ? "bg-white" : "bg-slate-50";
                    const cardBorder = esPar ? "border-gray-200" : "border-slate-200";
                    
                    // Opcional: Un borde lateral de color para diferenciar aún más
                    // Alternamos entre Rojo y un Gris oscuro, o podrías usar colores por deporte
                    const accentColor = esPar ? "border-l-4 border-l-red-600" : "border-l-4 border-l-slate-500";
                    
                    return (
                        <div 
                            key={deporte.id} 
                            className={`${cardBackground} ${cardBorder} ${accentColor} rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md`}
                        >
                            {/* Cabecera del Deporte */}
                            {/* Ajustamos el fondo del header para que contraste ligeramente con la tarjeta */}
                            <div className={`${esPar ? 'bg-gray-50' : 'bg-slate-100'} px-6 py-4 flex justify-between items-center border-b border-gray-100`}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-red-600">
                                        <FaFutbol />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{deporte.nombre}</h3>
                                        <p className="text-sm text-gray-500">{deporte.descripcion}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => abrirModalEditar(deporte, 'disciplina')} className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(deporte.id, 'disciplina')} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                        <FaTrash />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            abrirModalCrear('categoria');
                                            setTimeout(() => setValue('disciplina', deporte.id), 100); 
                                        }}
                                        className="ml-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1"
                                    >
                                        <FaPlus size={10} /> Categoría
                                    </button>
                                </div>
                            </div>

                            {/* Lista de Categorías del Deporte */}
                            <div className="px-6 py-2">
                                {catsDeEsteDeporte.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
                                        {catsDeEsteDeporte.map(cat => (
                                            <div 
                                                key={cat.id} 
                                                // 3. Hacemos que las tarjetas de categoría sean siempre blancas
                                                // para que resalten sobre el fondo gris (si es impar)
                                                className="bg-white flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:border-red-200 hover:shadow-sm transition group"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{cat.nombre_categoria}</h4>
                                                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{cat.edad_minima}-{cat.edad_maxima} años</span>
                                                        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-600">{cat.sexo}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => abrirModalEditar(cat, 'categoria')} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded">
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(cat.id, 'categoria')} className="text-red-500 hover:bg-red-100 p-1.5 rounded">
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-gray-400 text-sm italic">
                                        Sin categorías asignadas.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
            })}
                
                {deportesFiltrados.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No se encontraron deportes.</p>
                    </div>
                )}
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