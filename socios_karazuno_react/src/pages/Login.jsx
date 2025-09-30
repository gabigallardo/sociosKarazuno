import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/User.Context.jsx";
import { FaSignInAlt } from "react-icons/fa"; 

function Login() {
  const { setUser } = useContext(UserContext); 
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [message, setMessage] = useState("");

  const LOGIN_URL = "http://127.0.0.1:8000/socios/login/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Iniciando sesión...");

    try {
      const response = await axios.post(LOGIN_URL, { email, contrasena });
      const token = response.data.token;
      const usuario = response.data.usuario;

      if (!usuario) {
        setMessage("Error: Email o contraseña incorrectos");
        return;
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      setUser(usuario); 

      setMessage("¡Inicio de sesión exitoso! Redirigiendo...");
      setTimeout(() => {
        navigate("/socios"); 
      }, 1000);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMessage("Error: Email o contraseña incorrectos");
    }
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-800 via-red-700 to-black">
        
      <div className="p-10 max-w-md w-full bg-white shadow-2xl rounded-xl border border-gray-300 transition duration-500 transform hover:scale-[1.01]">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-black drop-shadow">
              Bienvenido Socio
            </h2>
            <p className="text-gray-500 mt-2">Accede a tu cuenta</p>
        </div>

        {/* Mensajes */}
        {message && (
          <p
            className={`text-center mb-4 p-3 rounded-lg font-medium transition duration-300 ${
              message.includes("Error")
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {message}
          </p>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Campo Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
              placeholder="tu.correo@ejemplo.com"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="mb-6">
            <label htmlFor="contrasena" className="block text-sm font-semibold text-black mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
              placeholder="Contraseña segura"
            />
          </div>

          {/* Botón Entrar */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <FaSignInAlt />
            Entrar
          </button>
        </form>

        {/* Enlace registro */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-red-600 font-semibold hover:text-red-800 transition duration-150">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
