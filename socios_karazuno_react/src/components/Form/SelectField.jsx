import React from 'react';

const SelectField = ({ name, value, onChange, label, error, options }) => (
  <div>
    <label className="block text-sm font-semibold text-black mb-1">{label}</label>
    <select
      name={name}
      id={name}
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

export default SelectField;