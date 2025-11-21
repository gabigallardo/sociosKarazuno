import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/User.Context.jsx";
import AuthLayout from "../components/Auth/AuthLayout";
import InputField from "../components/Form/InputField";
import SubmitButton from "../components/Form/SubmitButton";
import api from "../config/axiosConfig"; //

function Login() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", contrasena: "" });
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message) {
      setMessage("");
      setStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Autenticando...");
    setStatus(null); // Estado neutro para loading

    try {
      const response = await api.post("/socios/login/", {
        email: formData.email,
        contrasena: formData.contrasena,
      });

      const { token, usuario } = response.data;
      login(token, usuario);

      setStatus("success");
      setMessage("¡Bienvenido de nuevo!");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);

    } catch (error) {
      console.error("Error login:", error);
      setStatus("error");
      const errorMessage = error.response?.data?.error || "Credenciales incorrectas.";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Acceso Socios"
      subtitle="Bienvenido al equipo"
      size="md"
    >
      {/* Mensaje de Estado - CORREGIDO PARA ALTO CONTRASTE */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-bold text-center border shadow-sm transition-all duration-300 ${
            status === "error"
              ? "bg-red-100 text-red-800 border-red-200" // Rojo oscuro sobre claro
              : status === "success"
              ? "bg-green-100 text-green-800 border-green-200" // Verde oscuro sobre claro
              : "bg-gray-100 text-gray-800 border-gray-200 animate-pulse" // Gris oscuro (Loading)
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
            <InputField
                type="email"
                label="Correo Electrónico"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@karazuno.com"
                required
            />
        </div>

        <div className="space-y-1">
            <InputField
                type="password"
                label="Contraseña"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="••••••••"
                required
            />
        </div>

        <div className="pt-4">
          <SubmitButton 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 border border-red-500/30 cursor-pointer"
          >
            {isLoading ? "Verificando..." : "INICIAR SESIÓN"}
          </SubmitButton>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">
          ¿Aún no eres parte del equipo?
        </p>
        <Link
          to="/register"
          className="inline-block text-red-700 font-bold hover:text-black transition-colors duration-300 border-b-2 border-red-100 hover:border-black pb-0.5"
        >
          CREAR CUENTA
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Login;