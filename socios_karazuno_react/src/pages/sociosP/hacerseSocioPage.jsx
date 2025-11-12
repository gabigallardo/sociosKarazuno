import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { UserContext } from "../../contexts/User.Context";
import { getAllNivelesSocio } from "../../api/nivelesSocio.api";

import { hacerseSocio } from "../../api/usuarios.api";
import { createSocioInfo } from "../../api/socios.api";
import AuthLayout from "../../components/Auth/AuthLayout";
import InputField from "../../components/Form/InputField";
import SelectField from "../../components/Form/SelectField";
import SubmitButton from "../../components/Form/SubmitButton";

function HacerseSocioPage() {
  const navigate = useNavigate();
  const { user, login } = useContext(UserContext); 
  
  const [formData, setFormData] = useState({
    tipo_documento: user?.tipo_documento || "",
    nro_documento: user?.nro_documento || "",
    telefono: user?.telefono || "",
    fecha_nacimiento: user?.fecha_nacimiento || "",
    direccion: user?.direccion || "",
    sexo: user?.sexo || "",
    foto_url: user?.foto_url || "",
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Validación de datos personales ---
  const validate = (data) => {
    const newErrors = {};
    if (!data.tipo_documento) newErrors.tipo_documento = "El tipo de documento es obligatorio.";
    if (!data.nro_documento) newErrors.nro_documento = "El número de documento es obligatorio.";
    if (!data.telefono) newErrors.telefono = "El teléfono es obligatorio.";
    if (!data.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria.";
    if (!data.direccion) newErrors.direccion = "La dirección es obligatoria.";
    if (!data.sexo) newErrors.sexo = "El sexo es obligatorio.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Si el usuario ya es socio, no debería estar aquí
    if (user?.socioinfo) {
      navigate("/mi-perfil");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(formData)) {
      setMessage("Por favor, completa todos los campos obligatorios.");
      return;
    }

    setIsLoading(true);
    setMessage("Procesando asociación...");

    try {
      // --- PASO 1: Actualizar datos personales del Usuario ---
      // (Usamos PATCH para actualizar el usuario existente)
      const usuarioResponse = await hacerseSocio.patch(`/${user.id}/`, formData);

      // --- PASO 2: Crear el registro de SocioInfo ---
      // (Esto vincula al usuario como socio)
      const socioData = {
        usuario: user.id,
      };
      const socioResponse = await createSocioInfo(socioData);

      // Combinamos la info del usuario actualizada y la nueva info de socio
      const usuarioActualizado = {
        ...usuarioResponse.data,
        socioinfo: socioResponse.data,
      };
      
      // Usamos la función 'login' (o 'setUser') para guardar el estado actualizado
      login(user.token, usuarioActualizado); 

      setMessage("¡Felicitaciones! Ya eres socio del club.");
      setTimeout(() => navigate("/mi-perfil"), 2000); // Redirigir al perfil

    } catch (error) {
      console.error("Error al asociarse:", error);
      let errorMessage = "Error al procesar la solicitud. Inténtalo de nuevo.";
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const firstErrorKey = Object.keys(errorData)[0];
        if (firstErrorKey && Array.isArray(errorData[firstErrorKey])) {
          errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey][0]}`;
        }
      }
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Opciones para los <select>
  const tipoDocumentoOptions = [
    { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
    { value: 'CI', label: 'CI - Cédula de Identidad' },
    { value: 'LC', label: 'LC - Libreta Cívica' },
    { value: 'LE', label: 'LE - Libreta de Enrolamiento' },
    { value: 'PAS', label: 'PAS - Pasaporte' },
  ];
  
  const sexoOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
  ];

  return (
    <AuthLayout title="Completar Perfil" subtitle="¡Último paso para hacerte socio!" size="2xl">
      {message && (
        <p className={`text-center mb-4 p-3 rounded-lg font-medium ${message.includes("Error") || message.includes("completa") ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300"}`}>
          {message}
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <SelectField label="Tipo de Documento" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} error={errors.tipo_documento} options={tipoDocumentoOptions} />
        <InputField label="Número de Documento" name="nro_documento" value={formData.nro_documento} onChange={handleChange} error={errors.nro_documento} />
        
        <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} error={errors.telefono} />
        <InputField type="date" label="Fecha de Nacimiento" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} error={errors.fecha_nacimiento} />
        
        <div className="md:col-span-2">
          <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} error={errors.direccion} />
        </div>

        <SelectField label="Sexo" name="sexo" value={formData.sexo} onChange={handleChange} options={sexoOptions} error={errors.sexo} />
        
        <InputField label="URL de Foto de Perfil (Opcional)" name="foto_url" placeholder="https://ejemplo.com/mi-foto.jpg" value={formData.foto_url} onChange={handleChange} />

        <div className="md:col-span-2 mt-4">
          <SubmitButton icon={FaUserCheck} disabled={isLoading}>
            {isLoading ? "Procesando..." : "Completar y Asociarme"}
          </SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
}

export default HacerseSocioPage;