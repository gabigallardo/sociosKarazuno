import React, { useState, useContext } from "react"; 
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/User.Context.jsx"; 
import { FaUserPlus } from "react-icons/fa"; 

function Register() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); 

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
  const [fotoUrl, setFotoUrl] = useState("");
  const [message, setMessage] = useState("");

  const REGISTER_URL = "http://127.0.0.1:8000/socios/register/";
  const LOGIN_URL = "http://127.0.0.1:8000/socios/login/"; 

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
        foto_url: fotoUrl,
      });

      setMessage("Registro exitoso. Iniciando sesión automáticamente...");

      const loginResponse = await axios.post(LOGIN_URL, { email, contrasena });
      const token = loginResponse.data.token;
      const usuario = loginResponse.data.usuario;

      localStorage.setItem("authToken", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      setUser(usuario); 

      setTimeout(() => navigate("/socios"), 1500); 

    } catch (error) {
      console.error("Error al registrar:", error);
      setMessage(error.response?.data?.error || "Error en el registro o inicio de sesión automático.");
    }
  };

  const InputField = ({ type = "text", placeholder, value, onChange, required = false, className = "", label }) => (
    <div>
        <label className="block text-sm font-semibold text-black mb-1">{label}</label>
        <input 
            type={type} 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange} 
            required={required} 
            className={`w-full px-4 py-2 border border-gray-400 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150 ${className}`}
        />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-800 via-red-700 to-black p-4">
      <div className="p-8 max-w-2xl w-full bg-white shadow-2xl rounded-xl border border-gray-300">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-black">Crea tu Cuenta</h2>
            <p className="text-gray-500 mt-2">Completa todos los datos para registrarte</p>
        </div>

        {/* Mensaje */}
        {message && (
          <p className={`text-center mb-4 p-3 rounded-lg font-medium ${message.includes("Error") ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300"}`}>
            {message}
          </p>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <InputField label="Tipo de Documento" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} required />
          <InputField label="Número de Documento" value={nroDocumento} onChange={(e) => setNroDocumento(e.target.value)} required />
          <InputField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <InputField label="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          <InputField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <InputField label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <InputField type="password" label="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
          <InputField type="password" label="Confirmar Contraseña" value={confirmContrasena} onChange={(e) => setConfirmContrasena(e.target.value)} required />
          <InputField type="date" label="Fecha de Nacimiento" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          <InputField label="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Sexo</label>
            <select value={sexo} onChange={(e) => setSexo(e.target.value)} className="w-full px-4 py-2 border border-gray-400 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150">
              <option value="">Seleccionar Sexo</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <InputField 
                label="URL de Foto de Perfil (Opcional)" 
                placeholder="https://ejemplo.com/mi-foto.jpg" 
                value={fotoUrl} 
                onChange={(e) => setFotoUrl(e.target.value)} 
            />
          </div>

          {/* Botón Registro */}
          <div className="md:col-span-2 mt-4">
            <button 
                type="submit" 
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <FaUserPlus />
              Registrar
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-red-600 font-semibold hover:text-red-800 transition duration-150">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
