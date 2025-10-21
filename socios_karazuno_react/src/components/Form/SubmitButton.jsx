import React from 'react';

function SubmitButton({ children, icon: Icon, disabled = false }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {Icon && <Icon />}
      {children}
    </button>
  );
}

export default SubmitButton;