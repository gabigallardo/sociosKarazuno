import React from 'react';

// Añadimos la prop "size" con un valor por defecto
function AuthLayout({ children, title, subtitle, size = '2xl' }) {
  // Creamos un objeto para mapear el tamaño a la clase de Tailwind
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-800 via-red-700 to-black p-4">
      <div className={`p-8 ${sizeClasses[size]} w-full bg-white shadow-2xl rounded-xl border border-gray-300 transition duration-500 transform hover:scale-[1.01]`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-black drop-shadow">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;