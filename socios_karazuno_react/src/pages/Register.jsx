import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

// Componentes
import AuthLayout from "../components/Auth/AuthLayout";
import InputField from "../components/Form/InputField";
import SubmitButton from "../components/Form/SubmitButton";

function Register() {
  const navigate = useNavigate();
  
  // --- Estado del formulario simplificado ---
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    contrasena: "",
    confirm_contrasena: "",
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // URL del endpoint de registro
  const REGISTER_URL = "http://127.0.0.1:8000/socios/register/";

  // --- Validación en tiempo real  ---
  const validate = (data) => {
    const newErrors = {};

    if (!data.nombre) newErrors.nombre = "El nombre es obligatorio.";
    if (!data.apellido) newErrors.apellido = "El apellido es obligatorio.";
    if (!data.email) newErrors.email = "El email es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "El formato del email no es válido.";
    
    if (!data.contrasena) newErrors.contrasena = "La contraseña es obligatoria.";
    else if (data.contrasena.length < 6) newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres.";
    
    if (data.contrasena !== data.confirm_contrasena) {
      newErrors.confirm_contrasena = "Las contraseñas no coinciden.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Re-validar al cambiar los datos
  useEffect(() => {
    if (Object.keys(formData).some(key => formData[key] !== '')) {
      validate(formData);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(formData)) {
      setMessage("Por favor, corrige los errores en el formulario.");
      return;
    }
    
    setIsLoading(true);
    setMessage("Registrando usuario...");
    
    // Prepara los datos para enviar (sin confirm_contrasena)
    const dataToSubmit = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      contrasena: formData.contrasena,
    };

    try {
      // El backend (RegisterSerializer) solo espera estos campos
      await axios.post(REGISTER_URL, dataToSubmit);
      setMessage("¡Registro exitoso! Serás redirigido para iniciar sesión.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error al registrar:", error);
      let errorMessage = "Error en el registro. Inténtalo de nuevo.";
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        // Manejo de errores de la API (ej: email ya existe)
        const firstErrorKey = Object.keys(errorData)[0];
        if (firstErrorKey && Array.isArray(errorData[firstErrorKey])) {
          errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey][0]}`;
        } else if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Crea tu Cuenta" subtitle="Un par de datos y listo" size="lg"> {/* Tamaño más pequeño */}
      {message && (
        <p className={`text-center mb-4 p-3 rounded-lg font-medium ${message.includes("Error") || message.includes("corrige") ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300"}`}>
          {message}
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <InputField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} error={errors.nombre} />
        <InputField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} error={errors.apellido} />
        
        <div className="md:col-span-2">
          <InputField type="email" label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
        </div>
        
        <InputField type="password" label="Contraseña" name="contrasena" value={formData.contrasena} onChange={handleChange} error={errors.contrasena} />
        <InputField type="password" label="Confirmar Contraseña" name="confirm_contrasena" value={formData.confirm_contrasena} onChange={handleChange} error={errors.confirm_contrasena} />

        <div className="md:col-span-2 mt-4">
          <SubmitButton icon={FaUserPlus} disabled={isLoading}>
            {isLoading ? "Registrando..." : "Crear Cuenta"}
          </SubmitButton>
        </div>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-red-600 font-semibold hover:text-red-800 transition duration-150">
          Inicia sesión aquí
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;