import React from 'react';

const InputField = ({ type = "text", name, placeholder, value, onChange, label, error }) => (
  <div>
    <label className="block text-sm font-semibold text-black mb-1">{label}</label>
    <input
      type={type}
      name={name}
      id={name} 
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-400'} rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-red-500'} transition duration-150`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default InputField;