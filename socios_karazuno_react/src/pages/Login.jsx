import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/User.Context.jsx";

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
        navigate("/socios"); // navegación sin recargar página
      }, 1000);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMessage("Error: Email o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 max-w-sm w-full bg-white shadow-xl rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar Sesión
        </h2>

        {message && (
          <p
            className={`text-center mb-4 p-2 rounded ${
              message.includes("Error")
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tu email"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          No tienes una cuenta?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
