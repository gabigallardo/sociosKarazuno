import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/User.Context.jsx";
import { FaSignInAlt } from "react-icons/fa";
import AuthLayout from "../components/Auth/AuthLayout";
import InputField from "../components/Form/InputField";
import SubmitButton from "../components/Form/SubmitButton";

function Login() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", contrasena: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Iniciando sesión...");
    try {
      await login(formData.email, formData.contrasena);
      setMessage("¡Inicio de sesión exitoso! Redirigiendo...");
      navigate("/socios");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMessage("Error: Email o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Bienvenido Socio" subtitle="Accede a tu cuenta" size="md">
      {message && (
        <p className={`text-center mb-4 p-3 rounded-lg font-medium ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
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
        <Link to="/register" className="text-red-600 font-semibold hover:text-red-800">
          Regístrate aquí
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;