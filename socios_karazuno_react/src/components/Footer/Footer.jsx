import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 border-t-4 border-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Contenedor Flex: Se apila en móviles, se alinea en escritorio */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* 1. Identidad (Logo + Nombre) */}
          <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Karazuno Logo" 
                className="h-10 w-auto object-contain bg-white rounded-full p-1" 
              />
              <span className="text-xl font-bold tracking-widest text-white uppercase">
                Karazuno
              </span>
          </div>

          {/* 2. Navegación Horizontal Limpia */}
          <nav>
            <ul className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-400">

              <li>
                <Link to="/eventos" className="hover:text-red-500 transition-colors">Eventos</Link>
              </li>
              <li>
                <Link to="/deportes" className="hover:text-red-500 transition-colors">Deportes</Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-red-500 transition-colors">Contacto</Link>
              </li>
            </ul>
          </nav>

          {/* 3. Redes Sociales (Iconos sutiles) */}
          <div className="flex gap-5">
            <SocialLink href="#" icon={<FaFacebookF />} />
            <SocialLink href="#" icon={<FaInstagram />} />
            <SocialLink href="#" icon={<FaTwitter />} />
            <SocialLink href="#" icon={<FaYoutube />} />
          </div>
        </div>

        {/* Copyright Sutil */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Club Deportivo Karazuno. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};

// Sub-componente para iconos sociales
const SocialLink = ({ href, icon }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-200 text-lg"
  >
    {icon}
  </a>
);

export default Footer;