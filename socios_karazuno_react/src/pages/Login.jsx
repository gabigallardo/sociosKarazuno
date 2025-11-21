import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/User.Context.jsx";
import { FaSignInAlt } from "react-icons/fa";
import AuthLayout from "../components/Auth/AuthLayout";
import InputField from "../components/Form/InputField";
import SubmitButton from "../components/Form/SubmitButton";
import api from "../config/axiosConfig"; // 1. Importa tu instancia de Axios

function Login() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", contrasena: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Lógica de inicio de sesión corregida
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Iniciando sesión...");
    try {
      // Realiza la llamada a la API para el login
      const response = await api.post("/socios/login/", {
        email: formData.email,
        contrasena: formData.contrasena,
      });

      // Si la llamada es exitosa, obtén el token y los datos del usuario
      const { token, usuario } = response.data;

      // Llama a la función login del contexto con los datos correctos
      login(token, usuario);

      setMessage("¡Inicio de sesión exitoso! Redirigiendo...");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const errorMessage =
        error.response?.data?.error || "Email o contraseña incorrectos";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido Socio"
      subtitle="Accede a tu cuenta"
      size="md"
    >
      {message && (
        <p
          className={`text-center mb-4 p-3 rounded-lg font-medium ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          type="email"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu.correo@ejemplo.com"
          required
        />
        <InputField
          type="password"
          label="Contraseña"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="Contraseña segura"
          required
        />
        <SubmitButton icon={FaSignInAlt} disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{" "}
        <Link
          to="/register"
          className="text-red-600 font-semibold hover:text-red-800"
        >
          Regístrate aquí
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;