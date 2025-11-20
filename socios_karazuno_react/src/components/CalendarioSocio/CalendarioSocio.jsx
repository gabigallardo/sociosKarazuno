import React, { useState, useEffect, useContext } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import es from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { getAllEventos } from "../../api/eventos.api";
import { getAllDisciplinas } from "../../api/disciplinas.api";
import { getMisSesiones } from "../../api/sesiones.api";
import { UserContext } from "../../contexts/User.Context";
import { toast } from "react-hot-toast";

const locales = { es: es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const DISCIPLINE_COLORS = [
  "#E53935", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA", "#00ACC1", "#3949AB", "#FDD835",
];

const getId = (item) => {
  if (!item) return null;
  const id = typeof item === 'object' ? item.id : item;
  return id !== null && id !== undefined ? String(id) : null;
};

const CustomToolbar = ({ label, onNavigate, onView, view, compacto }) => {
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <button 
        onClick={() => onNavigate('PREV')} 
        className="p-2 rounded-full hover:bg-red-50 text-red-700 transition-colors"
      >
        <FaChevronLeft />
      </button>
      <span className="text-lg md:text-xl font-extrabold text-gray-800 uppercase tracking-wider text-center flex-1">
        {label}
      </span>
      <div className="flex items-center gap-2">
         {!compacto && (
            <button 
                onClick={() => onNavigate('TODAY')}
                className="text-xs font-bold text-red-700 hover:bg-red-50 px-3 py-1 rounded border border-red-200 transition-colors mr-2"
            >
                HOY
            </button>
         )}
         <button 
            onClick={() => onNavigate('NEXT')} 
            className="p-2 rounded-full hover:bg-red-50 text-red-700 transition-colors"
        >
            <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default function CalendarioSocio({ compacto = false }) {
  const [eventos, setEventos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const roles = user?.roles || [];
  const esSocio = roles.includes("socio");
  const esProfesor = roles.includes("profesor");
  const esAdmin = roles.includes("admin");
  const esDirigente = roles.includes("dirigente");
  const esEmpleado = roles.includes("empleado");

  const usaVistaPorDeporte = esAdmin || esDirigente || esEmpleado || esProfesor;

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, disciplinasData, sesionesData] = await Promise.all([
            getAllEventos(),
            getAllDisciplinas(),
            getMisSesiones()
        ]);
        
        setDisciplinas(disciplinasData || []);

        const eventosProcesados = eventsData.map((ev) => ({
          ...ev,
          id: `evento-${ev.id}`, // Prefijo para diferenciar IDs
          originalId: ev.id,
          start: new Date(ev.fecha_inicio),
          end: new Date(ev.fecha_fin),
          title: ev.titulo,
          tipo: 'evento', // Marca para diferenciar
          esGeneral: !getId(ev.disciplina),
        }));

        // Procesar Sesiones de Entrenamiento
        const sesionesProcesadas = (sesionesData || []).map((sesion) => {
            // Combinar fecha (YYYY-MM-DD) con hora (HH:MM:SS)
            const start = new Date(`${sesion.fecha}T${sesion.hora_inicio}`);
            const end = new Date(`${sesion.fecha}T${sesion.hora_fin}`);
            const tituloDetallado = `${sesion.disciplina_nombre} ${sesion.categoria_nombre}: Entrenamiento`;
            const lugar = sesion.lugar ? ` - ${sesion.lugar}` : '';
            
            return {
                id: `sesion-${sesion.id}`,
                originalId: sesion.id,
                start: start,
                end: end,
                title: `${tituloDetallado}${lugar}`, // Título descriptivo
                tipo: 'entrenamiento', // Marca para diferenciar
                categoriaId: sesion.categoria,
                estado: sesion.estado
            };
        });

        let eventosVisibles = [];
        
        if (esAdmin || esDirigente || esEmpleado) {
            eventosVisibles = eventosProcesados;
        } else if (esProfesor) {
            eventosVisibles = eventosProcesados.filter(ev => {
                const info = user.socio_info || user.socioinfo || {};
                
                const esEventoGeneral = ev.esGeneral;
                const disciplinaEventoId = getId(ev.disciplina);
                const miDisciplinaId = getId(info.disciplina);
                
                const esSuDisciplina = disciplinaEventoId === miDisciplinaId;
                const estaACargo = ev.profesores_a_cargo?.some(p => String(p.id || p) === String(user.id));
                
                return esEventoGeneral || esSuDisciplina || estaACargo;
            });
        } else if (esSocio) {
            // 1. Buscamos la info en user.socio_info O user.socioinfo
            const info = user.socio_info || user.socioinfo || {};
            
            const miDisciplinaId = getId(info.disciplina);
            const miCategoriaId = getId(info.categoria);

            eventosVisibles = eventosProcesados.filter(ev => {
                if (ev.esGeneral) return true;

                const disciplinaEventoId = getId(ev.disciplina);
                const categoriaEventoId = getId(ev.categoria);

                // 1. Coincidencia de Disciplina (Obligatoria si no es general)
                const coincideDisciplina = disciplinaEventoId === miDisciplinaId;
                
                // 2. Coincidencia de Categoría
                // Si el evento NO tiene categoría (es para todo el deporte) -> se renderiza
                // Si el evento SI tiene categoría -> Debe ser MI categoría
                const coincideCategoria = !categoriaEventoId || (categoriaEventoId === miCategoriaId);

                return coincideDisciplina && coincideCategoria;
            });
        }

        if (esAdmin || esDirigente || esEmpleado) {
            eventosVisibles = eventosProcesados;
        } else if (esProfesor) {
             // ... tu lógica profesor
             eventosVisibles = eventosProcesados.filter(ev => { /*...*/ return true; }); // Simplificado para el ejemplo
        } else if (esSocio) {
             // ... tu lógica socio
             const info = user.socio_info || user.socioinfo || {};
             const miDisciplinaId = getId(info.disciplina);
             const miCategoriaId = getId(info.categoria);
             
             eventosVisibles = eventosProcesados.filter(ev => {
                if (ev.esGeneral) return true;
                const disciplinaEventoId = getId(ev.disciplina);
                const categoriaEventoId = getId(ev.categoria);
                const coincideDisciplina = disciplinaEventoId === miDisciplinaId;
                const coincideCategoria = !categoriaEventoId || (categoriaEventoId === miCategoriaId);
                return coincideDisciplina && coincideCategoria;
            });
        }

        // 4. COMBINAR TODO
        // Las sesiones ya vienen filtradas desde el backend ("mis-sesiones"), 
        // así que las agregamos directamente.
        setEventos([...eventosVisibles, ...sesionesProcesadas]);
        
      } catch (error) {
        console.error(error);
        if (!compacto) toast.error("Error al cargar el calendario");
      } finally {
        setLoading(false);
      }
      }
    if (user) fetchData();
  }, [user, esSocio, esProfesor, esAdmin, esDirigente, esEmpleado, compacto]);

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";

    // LÓGICA DE COLORES
    if (event.tipo === 'entrenamiento') {
        // Color específico para entrenamientos (ej: Violeta oscuro o Gris oscuro)
        backgroundColor = "#6D28D9"; 
        if (event.estado === 'cancelada') backgroundColor = "#EF4444"; // Rojo si se canceló
    } else {
        // Lógica existente para eventos
        const disciplinaId = getId(event.disciplina);
        if (usaVistaPorDeporte) {
            if (event.esGeneral) {
                backgroundColor = "#607D8B";
            } else if (disciplinaId) {
                const numId = parseInt(disciplinaId, 10) || 0;
                const index = numId % DISCIPLINE_COLORS.length;
                backgroundColor = DISCIPLINE_COLORS[index];
            }
        } else {
            if (event.esGeneral) backgroundColor = "#F59E0B";
            else backgroundColor = "#10B981";
        }
    }

    return { 
        style: { 
            backgroundColor, 
            borderRadius: "6px", 
            opacity: 1, 
            color: "white", 
            border: "0px", 
            display: "block", 
            fontSize: "0.75em",
            fontWeight: "600",
            padding: "2px 5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            cursor: "pointer"
        } 
    };
  };

  const handleSelectEvent = (event) => {
      if (event.tipo === 'evento') {
          navigate(`/eventos/${event.originalId}`);
      } else {
          // Opcional: Mostrar un toast o modal simple con info del entrenamiento
          toast(`Entrenamiento: ${event.title}\nHorario: ${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`);
      }
  };

  const disciplinasEnCalendario = disciplinas.filter(d => 
      eventos.some(e => getId(e.disciplina) === getId(d))
  );

  if (loading) return <div className="p-8 text-center text-sm text-gray-500">Cargando calendario...</div>;

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-xl border border-gray-100 flex flex-col relative overflow-hidden 
        ${compacto ? "h-full min-h-[450px]" : "h-[80vh]"}`}>
      
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-400"></div>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className={`flex flex-wrap gap-2 mb-2 text-xs relative z-2 ${compacto ? "justify-end" : "justify-end mb-4"}`}>
        
        {usaVistaPorDeporte ? (
            <>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-200 shadow-sm cursor-default">
                    <span className="w-2 h-2 rounded-full bg-gray-500 block"></span>
                    <span className="text-gray-600 font-bold uppercase text-[10px]">General</span>
                </div>
                {disciplinasEnCalendario.map(d => {
                    const numId = parseInt(d.id, 10) || 0;
                    const color = DISCIPLINE_COLORS[numId % DISCIPLINE_COLORS.length];
                    return (
                        <div key={d.id} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm cursor-default">
                            <span style={{ backgroundColor: color }} className="w-2 h-2 rounded-full block"></span>
                            <span className="text-gray-700 font-bold uppercase text-[10px]">{d.nombre}</span>
                        </div>
                    );
                })}
            </>
        ) : (
             <>
                <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 block"></span><span className="text-yellow-800 font-medium">Club</span>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 block"></span><span className="text-green-800 font-medium">Míos</span>
                </div>
             </>
        )}
      </div>

      <div className="flex-1 text-sm relative z-1">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={['month']}
          style={{ height: "100%" }}
          popup={true}
          messages={{
            noEventsInRange: "Sin eventos",
            showMore: (total) => `+${total} más`, // Traduce "+2 more" a "+2 más"
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día"
          }}
          culture="es"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          components={{
            toolbar: (props) => <CustomToolbar {...props} compacto={compacto} />
          }}
        />
      </div>
    </div>
  );
}