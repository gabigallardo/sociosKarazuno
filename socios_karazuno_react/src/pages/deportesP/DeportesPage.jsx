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
import { FaFutbol, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";

// --- Componente Modal Genérico ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                {children}
                <button onClick={onClose} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-full">
                    Cerrar
                </button>
            </div>
        </div>
    );
};

// --- Componente de Página ---
export default function DeportesPage() {
    const [disciplinas, setDisciplinas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // { type: 'disciplina' | 'categoria', data: {...} }

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
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleOpenModalForEdit = (item, type) => {
        setEditingItem({ type, data: item });
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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (editingItem) { // Actualizando
                if (editingItem.type === 'disciplina') {
                    await updateDisciplina(editingItem.data.id, data);
                } else {
                    await updateCategoria(editingItem.data.id, data);
                }
            } else { // Creando
                // La creación se podría mover a un modal también si se desea
            }
        } catch (error) {
            console.error("Error guardando el ítem:", error);
        } finally {
            handleCloseModal();
            cargarDatos();
        }
    };
    
    const handleAddDisciplina = async (data) => {
        await createDisciplina(data);
        cargarDatos();
    };

    const handleAddCategoria = async (data) => {
        await createCategoria(data);
        cargarDatos();
    };

    const handleDelete = async (id, type) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este ítem?")) {
            try {
                if (type === 'disciplina') {
                    await deleteDisciplina(id);
                } else {
                    await deleteCategoria(id);
                }
                cargarDatos();
            } catch (error) {
                console.error("Error eliminando el ítem:", error);
            }
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border">
            <h1 className="text-3xl font-extrabold text-red-700 mb-6 flex items-center gap-3 border-b pb-4">
                <FaFutbol />
                Gestión de Deportes y Categorías
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Panel de Disciplinas */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Deportes</h2>
                    <ul className="space-y-2 mb-4">
                        {disciplinas.map((d) => (
                            <li key={d.id} className="p-3 bg-white rounded-lg shadow-sm border flex justify-between items-center">
                                <span>{d.nombre}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModalForEdit(d, 'disciplina')} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                                    <button onClick={() => handleDelete(d.id, 'disciplina')} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <FormularioSimple onSubmit={handleAddDisciplina} placeholder="Nuevo deporte..." icon={<FaPlus />} />
                </div>

                {/* Panel de Categorías */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Categorías</h2>
                    <ul className="space-y-2 mb-4">
                        {categorias.map((c) => (
                            <li key={c.id} className="p-3 bg-white rounded-lg shadow-sm border flex justify-between items-center">
                                <span>{c.nombre_categoria} ({disciplinas.find(d => d.id === c.disciplina)?.nombre})</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModalForEdit(c, 'categoria')} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                                    <button onClick={() => handleDelete(c.id, 'categoria')} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                     <FormularioCategoria onSubmit={handleAddCategoria} disciplinas={disciplinas} />
                </div>
            </div>

            {/* Modal para Edición */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? `Editar ${editingItem.type}` : ''}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {editingItem?.type === 'disciplina' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium">Nombre del Deporte</label>
                                <input {...register("nombre", { required: true })} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Descripción</label>
                                <textarea {...register("descripcion")} className="w-full p-2 border rounded" />
                            </div>
                        </>
                    )}
                    {editingItem?.type === 'categoria' && (
                         <>
                            <div>
                                <label className="block text-sm font-medium">Nombre de la Categoría</label>
                                <input {...register("nombre_categoria", { required: true })} className="w-full p-2 border rounded" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Deporte</label>
                                 <select {...register("disciplina", { required: true })} className="w-full p-2 border rounded">
                                     {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                 </select>
                             </div>
                             <div className="flex gap-4">
                                 <div className="w-1/2">
                                    <label>Edad Mínima</label>
                                     <input type="number" {...register("edad_minima", { required: true })} className="w-full p-2 border rounded" />
                                 </div>
                                 <div className="w-1/2">
                                    <label>Edad Máxima</label>
                                     <input type="number" {...register("edad_maxima", { required: true })} className="w-full p-2 border rounded" />
                                 </div>
                             </div>
                             <div>
                                 <label>Sexo</label>
                                 <select {...register("sexo")} className="w-full p-2 border rounded">
                                     <option value="mixto">Mixto</option>
                                     <option value="masculino">Masculino</option>
                                     <option value="femenino">Femenino</option>
                                 </select>
                             </div>
                         </>
                    )}
                    <button type="submit" className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700">Guardar Cambios</button>
                </form>
            </Modal>
        </div>
    );
}


// Componentes de formulario simples (puedes personalizarlos más si quieres)
const FormularioSimple = ({ onSubmit, placeholder, icon }) => {
    const { register, handleSubmit, reset } = useForm();
    const onFormSubmit = data => {
        onSubmit(data);
        reset();
    };
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex gap-2 mt-2">
            <input {...register("nombre", { required: true })} placeholder={placeholder} className="flex-grow p-2 border rounded-lg" />
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg">{icon}</button>
        </form>
    );
};

const FormularioCategoria = ({ onSubmit, disciplinas }) => {
    const { register, handleSubmit, reset } = useForm();
    const onFormSubmit = data => {
        onSubmit(data);
        reset();
    };
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-2 mt-2">
             <input {...register("nombre_categoria", { required: true })} placeholder="Nombre categoría..." className="w-full p-2 border rounded-lg" />
             <select {...register("disciplina", { required: true })} className="w-full p-2 border rounded-lg">
                <option value="">Selecciona un deporte</option>
                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            <div className="flex gap-2">
                <input type="number" {...register("edad_minima", { required: true })} placeholder="Edad mín." className="w-1/2 p-2 border rounded-lg" />
                <input type="number" {...register("edad_maxima", { required: true })} placeholder="Edad máx." className="w-1/2 p-2 border rounded-lg" />
            </div>
            <select {...register("sexo")} className="w-full p-2 border rounded-lg">
                <option value="mixto">Mixto</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
            </select>
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg"><FaPlus /></button>
        </form>
    );
};