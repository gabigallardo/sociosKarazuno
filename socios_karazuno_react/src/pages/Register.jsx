import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import api from "../config/axiosConfig"; // Usamos la instancia configurada

import AuthLayout from "../components/Auth/AuthLayout";
import InputField from "../components/Form/InputField";
import SubmitButton from "../components/Form/SubmitButton";

function Register() {
  const navigate = useNavigate();
  
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

  // Validación en tiempo real
  const validate = (data) => {
    const newErrors = {};
    if (!data.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!data.apellido.trim()) newErrors.apellido = "El apellido es requerido";
    
    const emailRegex = /\S+@\S+\.\S+/;
    if (!data.email) newErrors.email = "El email es requerido";
    else if (!emailRegex.test(data.email)) newErrors.email = "Email inválido";
    
    if (!data.contrasena) newErrors.contrasena = "La contraseña es requerida";
    else if (data.contrasena.length < 6) newErrors.contrasena = "Mínimo 6 caracteres";
    
    if (data.contrasena !== data.confirm_contrasena) {
      newErrors.confirm_contrasena = "Las contraseñas no coinciden";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  useEffect(() => {
    if (Object.values(formData).some(val => val !== '')) {
      validate(formData);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage("");
  };
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(formData)) return;
    
    setIsLoading(true);
    setMessage("");
    
    try {
      await api.post("/socios/register/", {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        contrasena: formData.contrasena,
      });

      setMessage("¡Registro exitoso! Redirigiendo...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Error registro:", error);
      let msg = "No se pudo completar el registro.";
      
      if (error.response?.data) {
        const data = error.response.data;
        
        if (data.error) {
            if (typeof data.error === "object") {
                const errorKeys = Object.keys(data.error);
                if (errorKeys.length > 0) {
                    const firstField = errorKeys[0];
                    const firstErrorMsg = data.error[firstField];
                    const errorText = Array.isArray(firstErrorMsg) ? firstErrorMsg[0] : firstErrorMsg;
                    msg = `${firstField}: ${errorText}`; 
                }
            } else {
                msg = data.error;
            }
        }
      }
      setMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Nuevo Socio" subtitle="Únete a la familia Karazuno" size="lg">
      {message && (
        <div className={`mb-6 p-3 rounded-lg text-center font-medium text-sm ${
          message.includes("exitoso") 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre y Apellido */}
        <div className="relative">
            <InputField 
                label="Nombre" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                error={errors.nombre}
                placeholder="Tu nombre"
            />
        </div>
        <div className="relative">
            <InputField 
                label="Apellido" 
                name="apellido" 
                value={formData.apellido} 
                onChange={handleChange} 
                error={errors.apellido}
                placeholder="Tu apellido"
            />
        </div>
        
        {/* Email (Ancho completo) */}
        <div className="md:col-span-2 relative">
          <InputField 
            type="email" 
            label="Correo Electrónico" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            error={errors.email}
            placeholder="usuario@email.com"
          />
        </div>
        
        {/* Contraseñas */}
        <div className="relative">
            <InputField 
                type="password" 
                label="Contraseña" 
                name="contrasena" 
                value={formData.contrasena} 
                onChange={handleChange} 
                error={errors.contrasena} 
            />
        </div>
        <div className="relative">
            <InputField 
                type="password" 
                label="Confirmar" 
                name="confirm_contrasena" 
                value={formData.confirm_contrasena} 
                onChange={handleChange} 
                error={errors.confirm_contrasena} 
            />
        </div>

        <div className="md:col-span-2 mt-4">
          <SubmitButton 
            icon={FaUserPlus} 
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white border border-red-600/30 py-3 rounded-xl shadow-lg transition-all duration-300"
          >
            {isLoading ? "Creando cuenta..." : "Registrarse"}
          </SubmitButton>
        </div>
      </form>
      
      <div className="mt-6 flex justify-center items-center space-x-2 text-sm">
        <span className="text-gray-500">¿Ya eres socio?</span>
        <Link to="/login" className="text-red-700 font-bold hover:underline">
          Acceder aquí
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Register;