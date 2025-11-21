import React from 'react';

function AuthLayout({ children, title, subtitle, size = '2xl' }) {
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    // 1. Fondo: Más rojo vivo, y  negro puro
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-800 to-black p-4 font-sans">
      
      {/* 2. Tarjeta: bg-white/95 hace que sea casi sólida (menos transparente) */}
      <div className={`relative w-full ${sizeClasses[size]} bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden transition-all duration-500 hover:shadow-red-900/30`}>
        
        {/* Barra superior decorativa */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 shadow-md"></div>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase drop-shadow-sm">
              {title}
            </h2>
            {subtitle && (
              <p className="text-red-600 font-bold tracking-wide text-sm uppercase">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;