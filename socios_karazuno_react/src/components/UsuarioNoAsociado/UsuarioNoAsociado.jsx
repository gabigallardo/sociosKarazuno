import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import logoImg from '../../assets/logo.webp';

function UsuarioNoAsociado() {
  const navigate = useNavigate();

  return (
    <div className="text-center p-8 bg-white rounded-2xl shadow-xl border max-w-4xl mx-auto">
      <img src={logoImg} alt="Logo Karazuno" className="mx-auto w-40 mb-4" />
      <h1 className="text-4xl font-extrabold text-red-700 mb-4">¡Bienvenido a Karazuno!</h1>
      <p className="text-lg text-gray-600 mb-6">Estás a un paso de ser parte de nuestro club. Como socio, tendrás acceso a increíbles beneficios:</p>

      <ul className="list-disc list-inside text-left text-gray-700 mb-8 space-y-2 max-w-md mx-auto">
        <li>Acceso a todas las instalaciones del club.</li>
        <li>Descuentos en cuotas y eventos especiales.</li>
        <li>Inscripción prioritaria a torneos y actividades.</li>
        <li>Una credencial digital para un acceso rápido y seguro.</li>
      </ul>

      <button
        onClick={() => navigate('/hacerse-socio')}
        className="bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-lg transition duration-300 hover:bg-red-700 transform hover:scale-105 flex items-center gap-3 mx-auto text-lg"
      >
        <FaUserPlus />
        ¡Quiero Hacerme Socio Ahora!
      </button>
    </div>
  );
}

export default UsuarioNoAsociado;