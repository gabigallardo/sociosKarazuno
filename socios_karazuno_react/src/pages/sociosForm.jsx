import React from "react";
import { useForm } from "react-hook-form";
function SociosForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data) => {  
    console.log(data);
  };
  return (
    <div>
      <h1>Formulario de Socios</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Nombre" {...register("nombre", { required: true })} />
        {errors.nombre && <span>Este campo es obligatorio</span>}
        <input type="text" placeholder="Apellido" {...register("apellido", { required: true })} />
        {errors.apellido && <span>Este campo es obligatorio</span>}
        <input type="email" placeholder="Email" {...register("email", { required: true })} />
        {errors.email && <span>Este campo es obligatorio</span>}
        <button type="submit">Agregar Socio</button>
    </form>
  </div>
  );
}
export default SociosForm;
