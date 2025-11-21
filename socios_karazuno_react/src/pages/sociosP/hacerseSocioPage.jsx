// src/pages/sociosP/hacerseSocioPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCheck } from "react-icons/fa";
import { UserContext } from "../../contexts/User.Context";
// Agregamos getMe para recuperar datos si el socio ya existía
import { hacerseSocio, getMe } from "../../api/usuarios.api"; 
import { createSocioInfo } from "../../api/socios.api";
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
  const [isSuccess, setIsSuccess] = useState(false);

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
    if (user?.socioinfo && !isSuccess) {
      navigate("/mi-perfil");
    }
  }, [user, navigate, isSuccess]);

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
      await hacerseSocio(user.id, formData);
      
      // --- PASO 2: Intentar crear el registro de SocioInfo ---
      try {
        const socioData = { usuario: user.id };
        await createSocioInfo(socioData);
      } catch (socioError) {
        // MANEJO INTELIGENTE DEL ERROR:
        // Si el error es 400 y dice "already exists", significa que ya se creó antes.
        // En ese caso, lo ignoramos y seguimos adelante.
        const errorMsg = socioError.response?.data?.usuario?.[0] || "";
        if (socioError.response?.status === 400 && errorMsg.includes("already exists")) {
          console.warn("El registro de socio ya existía. Recuperando datos y continuando...");
        } else {
          // Si es otro error, lo lanzamos para que corte el flujo
          throw socioError;
        }
      }

      // --- PASO 3: Recuperar el usuario completo y actualizado ---
      // En lugar de construir el objeto manualmente, pedimos al servidor la versión más reciente
      // que ya tendrá el 'socioinfo' vinculado correctamente.
      const usuarioActualizado = await getMe();
      
      // Activamos la bandera de éxito
      setIsSuccess(true);

      // Actualizamos sesión
      const token = localStorage.getItem("authToken");
      login(token, usuarioActualizado); 

      setMessage("¡Felicitaciones! Ya eres socio del club.");
      
      setTimeout(() => {
        navigate("/dashboard"); 
      }, 2000);

    } catch (error) {
      console.error("Error al asociarse:", error);
      let errorMessage = "Error al procesar la solicitud. Inténtalo de nuevo.";
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        // Intentar sacar el primer mensaje de error legible
        const firstKey = Object.keys(errorData)[0];
        if (firstKey) {
            const msg = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
            errorMessage = `${firstKey}: ${msg}`;
        }
      }
      setMessage(`Error: ${errorMessage}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const tipoDocumentoOptions = [
    { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
    { value: 'PAS', label: 'PAS - Pasaporte' },
  ];
  
  const sexoOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
  ];

  return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Completar Perfil de Socio
        </h1>
        
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700">¡Último paso para hacerte socio!</h2>
            <p className="text-sm text-gray-500 mt-1">
              Por favor, completa tus datos personales para finalizar el registro.
            </p>
          </div>

          {message && (
            <p className={`text-center mb-6 p-3 rounded-lg font-medium ${message.includes("Error") ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300"}`}>
              {message}
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            <SelectField label="Tipo de Documento" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} error={errors.tipo_documento} options={tipoDocumentoOptions} />
            <InputField label="Número de Documento" name="nro_documento" value={formData.nro_documento} onChange={handleChange} error={errors.nro_documento} />
            
            <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} error={errors.telefono} />
            <InputField type="date" label="Fecha de Nacimiento" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} error={errors.fecha_nacimiento} />
            
            <div className="md:col-span-2">
              <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} error={errors.direccion} />
            </div>

            <SelectField label="Sexo" name="sexo" value={formData.sexo} onChange={handleChange} options={sexoOptions} error={errors.sexo} />
            
            <InputField label="URL de Foto de Perfil (Opcional)" name="foto_url" placeholder="https://ejemplo.com/mi-foto.jpg" value={formData.foto_url} onChange={handleChange} />

            <div className="md:col-span-2 mt-6 border-t pt-6">
              <SubmitButton icon={FaUserCheck} disabled={isLoading}>
                {isLoading ? "Procesando..." : "Completar y Asociarme"}
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>
  );
}

export default HacerseSocioPage;