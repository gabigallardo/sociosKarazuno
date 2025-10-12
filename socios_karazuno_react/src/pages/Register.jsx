import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

// Componente reutilizable para los campos del formulario
const InputField = ({ type = "text", name, placeholder, value, onChange, label, error }) => (
  <div>
    <label className="block text-sm font-semibold text-black mb-1">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-400'} rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-red-500'} transition duration-150`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Componente para el menú desplegable de Tipo de Documento
const SelectField = ({ name, value, onChange, label, error, options }) => (
    <div>
        <label className="block text-sm font-semibold text-black mb-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-400'} rounded-lg bg-white text-black focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-red-500'} transition duration-150`}
        >
            <option value="">{`Seleccionar ${label}`}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);


function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo_documento: "",
    nro_documento: "",
    nombre: "",
    apellido: "",
    email: "",
    contrasena: "",
    confirm_contrasena: "",
    telefono: "",
    fecha_nacimiento: "",
    direccion: "",
    sexo: "",
    foto_url: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const REGISTER_URL = "http://127.0.0.1:8000/socios/register/";

  // --- Validación en tiempo real ---
  useEffect(() => {
    validate(formData);
  }, [formData]);

  const validate = (data) => {
    const newErrors = {};

    // Validaciones básicas (puedes agregar más)
    if (!data.nombre) newErrors.nombre = "El nombre es obligatorio.";
    if (!data.apellido) newErrors.apellido = "El apellido es obligatorio.";
    if (!data.email) newErrors.email = "El email es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "El formato del email no es válido.";
    if (!data.nro_documento) newErrors.nro_documento = "El número de documento es obligatorio.";
    if (!data.tipo_documento) newErrors.tipo_documento = "Selecciona un tipo de documento.";
    if (!data.contrasena) newErrors.contrasena = "La contraseña es obligatoria.";
    else if (data.contrasena.length < 6) newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres.";
    if (data.contrasena !== data.confirm_contrasena) newErrors.confirm_contrasena = "Las contraseñas no coinciden.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


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

    setMessage("Registrando usuario...");

    try {
      await axios.post(REGISTER_URL, formData);

      setMessage("¡Registro exitoso! Serás redirigido para iniciar sesión.");

      // Redirige al login después de 2 segundos
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      console.error("Error al registrar:", error);
      setMessage(error.response?.data?.error || "Error en el registro. Inténtalo de nuevo.");
    }
  };

  const tipoDocumentoOptions = [
      { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
      { value: 'CI', label: 'CI - Cédula de Identidad' },
      { value: 'LC', label: 'LC - Libreta Cívica' },
      { value: 'LE', label: 'LE - Libreta de Enrolamiento' },
      { value: 'PAS', label: 'PAS - Pasaporte' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-800 via-red-700 to-black p-4">
      <div className="p-8 max-w-2xl w-full bg-white shadow-2xl rounded-xl border border-gray-300">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-black">Crea tu Cuenta</h2>
          <p className="text-gray-500 mt-2">Completa todos los datos para registrarte</p>
        </div>

        {message && (
          <p className={`text-center mb-4 p-3 rounded-lg font-medium ${message.includes("Error") || message.includes("corrige") ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Tipo de Documento" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} error={errors.tipo_documento} options={tipoDocumentoOptions} />
          <InputField label="Número de Documento" name="nro_documento" value={formData.nro_documento} onChange={handleChange} error={errors.nro_documento} />
          <InputField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} error={errors.nombre} />
          <InputField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} error={errors.apellido} />
          <InputField type="email" label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
          <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
          <InputField type="password" label="Contraseña" name="contrasena" value={formData.contrasena} onChange={handleChange} error={errors.contrasena} />
          <InputField type="password" label="Confirmar Contraseña" name="confirm_contrasena" value={formData.confirm_contrasena} onChange={handleChange} error={errors.confirm_contrasena} />
          <InputField type="date" label="Fecha de Nacimiento" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
          <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />

          <SelectField
            label="Sexo"
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            options={[
                { value: 'masculino', label: 'Masculino' },
                { value: 'femenino', label: 'Femenino' },
                { value: 'otro', label: 'Otro' },
            ]}
          />

          <div className="md:col-span-2">
            <InputField
              label="URL de Foto de Perfil (Opcional)"
              name="foto_url"
              placeholder="https://ejemplo.com/mi-foto.jpg"
              value={formData.foto_url}
              onChange={handleChange}
            />
          </div>

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