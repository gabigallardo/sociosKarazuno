import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmContrasena, setConfirmContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [sexo, setSexo] = useState("");
  const [message, setMessage] = useState("");

  const REGISTER_URL = "http://127.0.0.1:8000/socios/register/";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (contrasena !== confirmContrasena) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setMessage("Registrando usuario...");

    try {
      await axios.post(REGISTER_URL, {
        tipo_documento: tipoDocumento,
        nro_documento: nroDocumento,
        nombre,
        apellido,
        email,
        contrasena,
        confirm_contrasena: confirmContrasena,
        telefono,
        fecha_nacimiento: fechaNacimiento,
        direccion,
        sexo,
      });

      setMessage("Registro exitoso. Redirigiendo a login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Error al registrar:", error);
      setMessage(error.response?.data?.error || "Error en el registro.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 max-w-lg w-full bg-white shadow-xl rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Registro de Usuario</h2>

        {message && (
          <p className={`text-center mb-4 p-2 rounded ${message.includes("Error") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input type="text" placeholder="Tipo de Documento" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} required />
          <input type="text" placeholder="Número de Documento" value={nroDocumento} onChange={(e) => setNroDocumento(e.target.value)} required />
          <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
          <input type="password" placeholder="Confirmar Contraseña" value={confirmContrasena} onChange={(e) => setConfirmContrasena(e.target.value)} required />
          <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <input type="date" placeholder="Fecha de Nacimiento" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">Seleccionar Sexo</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="mixto">Mixto</option>
            <option value="otro">Otro</option>
          </select>

          <button type="submit" className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md mt-4">Registrar</button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
