// src/pages/entrenadoresP/EntrenadoresPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllUsuarios, updateUsuario } from '../../api/usuarios.api';
// 👇 Importar la función para obtener categorías (¡asegúrate de crearla!)
import { getAllCategorias } from '../../api/categorias.api'; // Ajusta la ruta si es necesario
import { toast } from 'react-hot-toast';

function EntrenadoresPage() {
    const [profesores, setProfesores] = useState([]); // Renombrado para claridad
    const [categorias, setCategorias] = useState([]); // Estado para categorías
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                // 1. Obtener todas las CATEGORÍAS (espera array)
                const categoriasData = await getAllCategorias(); // Usa la nueva función API
                console.log("Datos de categorías recibidos:", categoriasData);

                if (Array.isArray(categoriasData)) {
                     // Ordenar categorías, por ejemplo, por nombre de disciplina y luego categoría
                    const categoriasOrdenadas = [...categoriasData].sort((a, b) => {
                        const compDisciplina = a.disciplina_nombre.localeCompare(b.disciplina_nombre);
                        if (compDisciplina !== 0) return compDisciplina;
                        return a.nombre_categoria.localeCompare(b.nombre_categoria);
                    });
                    setCategorias(categoriasOrdenadas);
                } else {
                    console.error("Respuesta inesperada de getAllCategorias (no es array):", categoriasData);
                    throw new Error("Formato de categorías inesperado.");
                }

                // 2. Obtener Usuarios (espera array)
                const usuariosData = await getAllUsuarios();
                if (Array.isArray(usuariosData)) {
                    const profesoresFiltrados = usuariosData.filter(user =>
                        user && Array.isArray(user.roles) && user.roles.includes('profesor')
                    );
                    setProfesores(profesoresFiltrados); // Guardar en el estado 'profesores'
                } else {
                    throw new Error("Formato de usuarios inesperado.");
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                const message = err.message || 'Error al cargar los datos. Intente nuevamente.';
                setError(message);
                toast.error(message);
                setCategorias([]); // Limpiar categorías en error
                setProfesores([]); // Limpiar profesores en error
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // **MODIFICADO:** Handler para checkboxes de CATEGORÍAS
    const handleCheckboxChange = async (profesorId, categoriaId, isChecked) => {
        const profesorActual = profesores.find(p => p.id === profesorId);
        if (!profesorActual) return;

        const currentCategoriaIds = Array.isArray(profesorActual.categorias_a_cargo_ids)
            ? [...profesorActual.categorias_a_cargo_ids]
            : [];

        let nuevasCategoriaIds;
        if (isChecked) {
            nuevasCategoriaIds = [...currentCategoriaIds, categoriaId];
        } else {
            nuevasCategoriaIds = currentCategoriaIds.filter(id => id !== categoriaId);
        }
        nuevasCategoriaIds = [...new Set(nuevasCategoriaIds)]; // Asegurar IDs únicos

        // --- AJUSTE Payload: Enviar categorias_a_cargo_ids ---
        const datosActualizados = {
            // Campos requeridos copiados del profesor actual
            tipo_documento: profesorActual.tipo_documento,
            nro_documento: profesorActual.nro_documento,
            nombre: profesorActual.nombre,
            apellido: profesorActual.apellido,
            email: profesorActual.email,
            // Campos opcionales
            telefono: profesorActual.telefono || null,
            fecha_nacimiento: profesorActual.fecha_nacimiento || null,
            direccion: profesorActual.direccion || null,
            sexo: profesorActual.sexo || null,
            activo: profesorActual.activo !== undefined ? profesorActual.activo : true,
            foto_url: profesorActual.foto_url || null,
            roles_ids: Array.isArray(profesorActual.roles_ids) ? profesorActual.roles_ids : [],
            disciplinas_a_cargo_ids: Array.isArray(profesorActual.disciplinas_a_cargo_ids) ? profesorActual.disciplinas_a_cargo_ids : [],
            categorias_a_cargo_ids: nuevasCategoriaIds,
        };
        // --- FIN AJUSTE Payload ---

        console.log("Enviando datos actualizados:", datosActualizados);

        try {
            await updateUsuario(profesorId, datosActualizados);

            // Actualizar estado local
            setProfesores(prevProfesores =>
                prevProfesores.map(p =>
                    p.id === profesorId
                        ? {
                            ...p,
                            // 👇 Actualizar los campos correctos en el estado local
                            categorias_a_cargo_ids: nuevasCategoriaIds,
                            // Opcional: Actualizar un campo con nombres si lo usas (ej: categorias_a_cargo)
                            categorias_a_cargo: categorias // Asume que necesitas los objetos completos o nombres
                                .filter(c => nuevasCategoriaIds.includes(c.id))
                                .map(c => `${c.disciplina_nombre} - ${c.nombre_categoria}`) // Ejemplo de nombre compuesto
                          }
                        : p
                )
            );
            toast.success(`Categorías actualizadas para ${profesorActual.nombre} ${profesorActual.apellido}`);
        } catch (err) {
            console.error("Error updating professor categories:", err);
            if (err.response && err.response.data) {
                console.error("Detalle del error 400:", err.response.data);
                toast.error(`Error al actualizar: ${JSON.stringify(err.response.data)}`);
            } else {
                toast.error('Error al actualizar las categorías.');
            }
        }
    };


    if (loading) return <p className="text-center mt-8 text-gray-600">Cargando profesores y categorías...</p>;
    if (error) return <p className="text-center mt-8 text-red-600 font-semibold">{error}</p>;
    if (!loading && profesores.length === 0 && !error) return <p className="text-center mt-8 text-gray-500">No se encontraron profesores.</p>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestionar Profesores y Categorías</h1>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-100">
                         <tr>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                             {/* 👇 Encabezado ajustado */}
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categorías Asignadas</th>
                         </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {profesores.map((profesor) => {
                             // 👇 Usar el campo correcto del profesor
                            const assignedIds = new Set(Array.isArray(profesor.categorias_a_cargo_ids) ? profesor.categorias_a_cargo_ids : []);

                            return (
                                <tr key={profesor.id} className="hover:bg-gray-50 transition duration-150 ease-in-out align-top">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {profesor.nombre} {profesor.apellido}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {profesor.email}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {/* **MODIFICADO:** Renderizar Checkboxes de CATEGORÍAS */}
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Scroll si hay muchas categorías */}
                                            <p className="text-xs font-medium text-gray-500 uppercase mb-2 sticky top-0 bg-white pt-1">Asignar/Quitar:</p>
                                            {categorias.length > 0 ? (
                                                categorias.map((categoria) => (
                                                    <div key={categoria.id} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`categoria-${profesor.id}-${categoria.id}`} // ID único
                                                            value={categoria.id}
                                                            checked={assignedIds.has(categoria.id)} // Comprobar si está asignada
                                                            onChange={(e) => handleCheckboxChange(profesor.id, categoria.id, e.target.checked)} // Usar ID de categoría
                                                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                        />
                                                        <label
                                                            htmlFor={`categoria-${profesor.id}-${categoria.id}`}
                                                            className="ml-2 block text-sm text-gray-900"
                                                        >
                                                            {/* Mostrar nombre de disciplina y categoría */}
                                                            {categoria.disciplina_nombre} - {categoria.nombre_categoria}
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className='text-xs text-gray-400'>No hay categorías para asignar.</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EntrenadoresPage;