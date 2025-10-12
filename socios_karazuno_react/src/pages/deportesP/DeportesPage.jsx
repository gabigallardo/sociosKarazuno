import React, { useState, useEffect } from "react";
import { getAllDisciplinas, createDisciplina } from "../../api/disciplinas.api";
import { getAllCategorias, createCategoria } from "../../api/categorias.api";
import { FaFutbol, FaPlus } from "react-icons/fa";

const FormularioSimple = ({ onSubmit, placeholder }) => {
    const [nombre, setNombre] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (nombre) {
            onSubmit({ nombre });
            setNombre("");
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={placeholder}
                className="flex-grow p-2 border rounded-lg focus:ring-red-500 focus:outline-none"
            />
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700">
                <FaPlus/>
            </button>
        </form>
    );
};

export default function DeportesPage() {
    const [disciplinas, setDisciplinas] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const cargarDatos = async () => {
        const [disciplinasData, categoriasData] = await Promise.all([
            getAllDisciplinas(),
            getAllCategorias()
        ]);
        setDisciplinas(disciplinasData);
        setCategorias(categoriasData);
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleAddDisciplina = async (data) => {
        await createDisciplina(data);
        cargarDatos();
    };

    const handleAddCategoria = async (data) => {

        alert("La creación de categorías requiere un formulario más detallado.");
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border">
            <h1 className="text-3xl font-extrabold text-red-700 mb-6 flex items-center gap-3 border-b pb-4">
                <FaFutbol />
                Gestión de Deportes y Categorías
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Panel de Disciplinas (Deportes) */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Deportes</h2>
                    <ul className="space-y-2">
                        {disciplinas.map(d => (
                            <li key={d.id} className="p-3 bg-white rounded-lg shadow-sm border flex justify-between items-center">
                                {d.nombre}
                            </li>
                        ))}
                    </ul>
                    <FormularioSimple onSubmit={handleAddDisciplina} placeholder="Nuevo deporte..." />
                </div>

                {/* Panel de Categorías */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Categorías</h2>
                     <ul className="space-y-2">
                        {categorias.map(c => (
                            <li key={c.id} className="p-3 bg-white rounded-lg shadow-sm border">
                                {c.nombre_categoria} ({disciplinas.find(d => d.id === c.disciplina)?.nombre})
                            </li>
                        ))}
                    </ul>
                    {/* mejorar*/}
                </div>
            </div>
        </div>
    );
}