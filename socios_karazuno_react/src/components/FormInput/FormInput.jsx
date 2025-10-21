import React from 'react';

function FormInput({
  register,
  name,
  label,
  type = 'text',
  error,
  validationRules = {},
  ...props
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name, validationRules)}
        {...props}
        className={`w-full p-3 border rounded-lg text-lg focus:ring-2 focus:outline-none ${
          error
            ? 'border-red-500 ring-red-300'
            : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
        }`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

export default FormInput;