import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaCalendar, FaClock } from "react-icons/fa";

// --- CONFIGURACIÓN CENTRALIZADA DE LOS PASOS ---
const stepsConfig = [
  {
    id: "tipo",
    label: "¿Qué tipo de evento vas a crear?",
    type: "select",
    options: [
      { value: "torneo", label: "Torneo" },
      { value: "partido", label: "Partido" },
      { value: "viaje", label: "Viaje" },
      { value: "otro", label: "Otro" },
    ],
    validation: (value) => value ? null : "Debes seleccionar un tipo.",
  },
  {
    id: "titulo",
    label: "Dale un título al evento",
    type: "text",
    placeholder: "Ej: Torneo Anual de Verano",
    validation: (value) => value.length > 3 ? null : "El título debe tener al menos 4 caracteres.",
  },
  {
    id: "lugar",
    label: "¿Dónde se realizará?",
    type: "text",
    placeholder: "Ej: Sede Principal del Club",
    validation: (value) => value ? null : "El lugar es obligatorio.",
  },
  {
    id: "horario",
    label: "Define el horario del evento",
    type: "datetime-split",
    validation: (value, formData) => {
        if (!formData.fecha_inicio_date || !formData.fecha_inicio_time || !formData.fecha_fin_date || !formData.fecha_fin_time) {
            return "Debes completar la fecha y hora de inicio y fin.";
        }
        const start = new Date(`${formData.fecha_inicio_date}T${formData.fecha_inicio_time}`);
        const end = new Date(`${formData.fecha_fin_date}T${formData.fecha_fin_time}`);
        if (end < start) {
            return "El evento no puede terminar antes de que empiece.";
        }
        return null;
    }
  },
  {
    id: "organizador",
    label: "¿Quién es el organizador principal?",
    type: "select",
    validation: (value) => value ? null : "Debes seleccionar un organizador.",
  },
  {
    id: "descripcion",
    label: "Añade una descripción (opcional)",
    type: "textarea",
    placeholder: "Detalles adicionales, reglas, etc.",
    validation: () => null,
  },
  {
    id: "requisito_pago",
    label: "¿El evento requiere el pago de una cuota?",
    type: "toggle",
    validation: () => null,
  },
  {
    id: "costo",
    label: "Indica el costo de la inscripción (ARS)",
    type: "number",
    placeholder: "0.00",
    condition: (formData) => formData.requisito_pago,
    validation: (value, formData) => {
        if (formData.requisito_pago && (value === null || value === '' || parseFloat(value) <= 0)) {
            return "Si requiere pago, el costo debe ser mayor a 0.";
        }
        return null;
    }
  },
];


export default function EventosForm({ onSubmit, initialValues, usuarios, isLoading = false }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    tipo: "torneo",
    titulo: "",
    lugar: "",
    fecha_inicio_date: "",
    fecha_inicio_time: "",
    fecha_fin_date: "",
    fecha_fin_time: "",
    organizador: "",
    descripcion: "",
    requisito_pago: false,
    costo: 0.0,
  });
  const [error, setError] = useState(null);
  

  useEffect(() => {
    if (initialValues) {
      const { fecha_inicio, fecha_fin, ...rest } = initialValues;
      
      const startDate = fecha_inicio ? new Date(fecha_inicio) : null;
      const endDate = fecha_fin ? new Date(fecha_fin) : null;

      setFormData({
        ...formData,
        ...rest,
        fecha_inicio_date: startDate ? startDate.toISOString().split('T')[0] : "",
        fecha_inicio_time: startDate ? startDate.toTimeString().slice(0, 5) : "",
        fecha_fin_date: endDate ? endDate.toISOString().split('T')[0] : "",
        fecha_fin_time: endDate ? endDate.toTimeString().slice(0, 5) : "",
      });
    }
  }, [initialValues]); 

  const visibleSteps = stepsConfig.filter(step => !step.condition || step.condition(formData));
  const currentStep = visibleSteps[currentStepIndex];

  const handleNext = () => {
    const currentValue = formData[currentStep.id];
    const validationError = currentStep.validation(currentValue, formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (currentStepIndex < visibleSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleSubmit = () => {
     const payload = {
      ...formData,
      organizador_id: Number(formData.organizador),
      fecha_inicio: formData.fecha_inicio_date && formData.fecha_inicio_time ? new Date(`${formData.fecha_inicio_date}T${formData.fecha_inicio_time}`).toISOString() : null,
      fecha_fin: formData.fecha_fin_date && formData.fecha_fin_time ? new Date(`${formData.fecha_fin_date}T${formData.fecha_fin_time}`).toISOString() : null,
    };
    delete payload.organizador;
    delete payload.fecha_inicio_date;
    delete payload.fecha_inicio_time;
    delete payload.fecha_fin_date;
    delete payload.fecha_fin_time;
    onSubmit(payload);
  };
  
  const progress = ((currentStepIndex + 1) / visibleSteps.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border">
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500 mb-2">Paso {currentStepIndex + 1} de {visibleSteps.length}</p>
        <div className="bg-gray-200 rounded-full h-2"><div className="bg-red-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
      </div>

      <div className="min-h-[220px]">
        <label className="text-xl font-bold text-gray-800 mb-4 block">{currentStep.label}</label>

        {currentStep.type === "datetime-split" ? (
          <div className="space-y-4">
            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-sm font-medium text-gray-600">Inicio del Evento</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FaCalendar className="text-gray-400"/></div>
                         <input type="date" name="fecha_inicio_date" value={formData.fecha_inicio_date} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500 focus:outline-none"/>
                    </div>
                    <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FaClock className="text-gray-400"/></div>
                         <input type="time" name="fecha_inicio_time" value={formData.fecha_inicio_time} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500 focus:outline-none"/>
                    </div>
                </div>
            </fieldset>
            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-sm font-medium text-gray-600">Fin del Evento</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FaCalendar className="text-gray-400"/></div>
                        <input type="date" name="fecha_fin_date" value={formData.fecha_fin_date} onChange={handleChange} min={formData.fecha_inicio_date} className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500 focus:outline-none"/>
                    </div>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FaClock className="text-gray-400"/></div>
                        <input type="time" name="fecha_fin_time" value={formData.fecha_fin_time} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500 focus:outline-none"/>
                    </div>
                </div>
            </fieldset>
          </div>
        ) : (
          <>
            {currentStep.type === "select" && (
              <select id={currentStep.id} name={currentStep.id} value={formData[currentStep.id]} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500 focus:outline-none">
                {currentStep.id === 'organizador' ? (
                  <>
                    <option value="">-- Seleccionar --</option>
                    {usuarios?.map(u => <option key={u.id} value={u.id}>{`${u.nombre} ${u.apellido}`}</option>)}
                  </>
                ) : (
                  currentStep.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                )}
              </select>
            )}
            {["text", "number"].includes(currentStep.type) && ( <input id={currentStep.id} name={currentStep.id} type={currentStep.type} value={formData[currentStep.id]} onChange={handleChange} placeholder={currentStep.placeholder} className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500 focus:outline-none"/> )}
            {currentStep.type === "textarea" && ( <textarea id={currentStep.id} name={currentStep.id} value={formData[currentStep.id]} onChange={handleChange} placeholder={currentStep.placeholder} rows="4" className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500 focus:outline-none"></textarea> )}
            {currentStep.type === "toggle" && (
              <div className="flex items-center space-x-4">
                <button type="button" onClick={() => handleChange({ target: { name: currentStep.id, checked: true, type: 'checkbox' } })} className={`w-full p-3 rounded-lg text-center font-bold ${formData[currentStep.id] ? 'bg-red-600 text-white ring-2 ring-red-700' : 'bg-gray-200'}`}>Sí</button>
                <button type="button" onClick={() => handleChange({ target: { name: currentStep.id, checked: false, type: 'checkbox' } })} className={`w-full p-3 rounded-lg text-center font-bold ${!formData[currentStep.id] ? 'bg-red-600 text-white ring-2 ring-red-700' : 'bg-gray-200'}`}>No</button>
              </div>
            )}
          </>
        )}

        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      <div className="flex justify-between items-center mt-8 pt-4 border-t">
        <button type="button" onClick={handleBack} disabled={currentStepIndex === 0} className="py-2 px-4 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
          <FaArrowLeft className="inline mr-2" /> Atrás
        </button>
        <button type="button" onClick={handleNext} disabled={isLoading} className="py-2 px-6 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400">
          {currentStepIndex === visibleSteps.length - 1 ? ( <> {isLoading ? 'Creando...' : 'Crear Evento'} <FaCheck className="inline ml-2" /> </> ) : ( <> Siguiente <FaArrowRight className="inline ml-2" /> </> )}
        </button>
      </div>
    </div>
  );
}