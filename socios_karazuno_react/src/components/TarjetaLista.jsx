export function TarjetaLista({ socio }) {
  return (
    <div key={socio.id}>
      {socio.nombre} {socio.apellido}
    </div>
  );
}