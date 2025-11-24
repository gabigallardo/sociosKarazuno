import React, { useState, useRef, useEffect } from 'react';
import { 
    FaCheckCircle, 
    FaTimesCircle, 
    FaUserCircle, 
    FaQrcode, 
    FaExclamationTriangle, 
    FaSpinner, 
    FaExpand, 
    FaCompress 
} from 'react-icons/fa';
import { verificarAcceso } from '../api/socios.api';

export default function ControlAccesoPage() {
    const [estado, setEstado] = useState('esperando'); // esperando | procesando | aprobado | denegado
    const [datos, setDatos] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false); // Estado para controlar la UI
    const inputRef = useRef(null);
    const pageRef = useRef(null); // Referencia al contenedor principal

    // --- 1. LÓGICA DE FOCO (Kiosco Mode) ---
    useEffect(() => {
        const enfocar = () => inputRef.current?.focus();
        enfocar();
        const handleBlur = () => setTimeout(enfocar, 10);
        
        const inputEl = inputRef.current;
        if (inputEl) inputEl.addEventListener('blur', handleBlur);
        
        return () => {
            if (inputEl) inputEl.removeEventListener('blur', handleBlur);
        };
    }, []);

    // --- 2. DETECTAR CAMBIOS DE PANTALLA COMPLETA ---
    useEffect(() => {
        const handleFullScreenChange = () => {
            // Si hay elemento en fullscreen, activamos modo kiosco
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    // --- 3. TOGGLE FULLSCREEN ---
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            // Entrar a pantalla completa
            pageRef.current?.requestFullscreen().catch(err => {
                console.error(`Error al intentar activar pantalla completa: ${err.message}`);
            });
        } else {
            // Salir de pantalla completa
            document.exitFullscreen();
        }
    };

    // --- 4. LÓGICA DE SONIDO ---
    const reproducirSonido = (tipo) => {
        const ruta = tipo === 'exito' ? '/sounds/correcto.mp3' : '/sounds/incorrecto.mp3';
        const audio = new Audio(ruta);
        audio.play().catch(e => console.error("Error reproduciendo audio:", e));
    };

    const hablarMensaje = (texto) => {
        if (!texto) return;

        // Cancelar cualquier audio anterior para que no se solapen
        window.speechSynthesis.cancel();

        const locucion = new SpeechSynthesisUtterance(texto);
        locucion.lang = 'es-ES'; // Español
        locucion.rate = 1.1; // Un poco más rápido para agilidad
        locucion.pitch = 1; 

        window.speechSynthesis.speak(locucion);
    };

    // --- 5. MANEJO DEL ESCANEO ---
    const handleScan = async (e) => {
        e.preventDefault();
        const codigo = inputRef.current.value.trim();
        if (!codigo) return;

        inputRef.current.value = ''; 
        setEstado('procesando');

        try {
            const res = await verificarAcceso(codigo);
            const data = res.data;

            setDatos(data);
            setEstado(data.estado); 

            if (data.estado === 'aprobado') {
                reproducirSonido('exito');
                // Si el backend nos mandó un texto para leer (el saludo + recordatorio)
                if (data.texto_tts) {
                    // Esperamos 500ms para que no se pise con el sonido del "Ding"
                    setTimeout(() => hablarMensaje(data.texto_tts), 500);
                }
            } else {
                reproducirSonido('error');
            }
            // Aumentamos un poco el tiempo de reset para que termine de hablar si el mensaje es largo
            const tiempoReset = data.texto_tts ? 5000 : 3500;
            setTimeout(resetear, tiempoReset);

        } catch (error) {
            console.error("Error de escaneo:", error);
            setEstado('denegado');
            reproducirSonido('error');
            setDatos({ mensaje: 'Error de conexión o lectura', motivo: 'error' });
            setTimeout(resetear, 3000);
        }
    };

    const resetear = () => {
        setEstado('esperando');
        setDatos(null);
        inputRef.current?.focus();
    };

    // Definimos los estilos dinámicos para el anillo de estado
    const getStatusColor = () => {
        switch (estado) {
            case 'aprobado': return 'from-emerald-500 to-green-600 shadow-green-500/50';
            case 'denegado': return 'from-rose-500 to-red-600 shadow-red-500/50';
            case 'procesando': return 'from-blue-500 to-indigo-600 shadow-blue-500/50';
            default: return 'from-slate-700 to-slate-800 shadow-slate-500/20';
        }
    };

    return (
        // El contenedor principal tiene la referencia 'pageRef' para solicitar fullscreen sobre ÉL MISMO
        // Cuando está en fullscreen, el navegador lo pone al frente de todo automáticamente.
        // Si NO está en fullscreen pero queremos que tape el layout (opcional), podemos usar clases fixed.
        <div 
            ref={pageRef}
            className={`
                flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 transition-all duration-300
                ${isFullScreen ? 'fixed inset-0 w-screen h-screen z-[9999]' : 'min-h-[calc(100vh-4rem)] w-full'}
            `}
        >
            
            {/* Botón Flotante para Pantalla Completa */}
            <button 
                onClick={toggleFullScreen}
                className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 shadow-lg group"
                title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
                {isFullScreen ? <FaCompress className="text-xl" /> : <FaExpand className="text-xl" />}
                
                {/* Tooltip simple */}
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isFullScreen ? "Salir" : "Modo Kiosco"}
                </span>
            </button>

            {/* Fondo decorativo animado */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-20 transition-all duration-700 ease-out 
                ${estado === 'aprobado' ? 'from-green-900 via-emerald-900 to-slate-900' : 
                  estado === 'denegado' ? 'from-red-900 via-rose-900 to-slate-900' : 
                  'from-slate-800 via-gray-900 to-black'}`} 
            />

            {/* --- TARJETA PRINCIPAL (Glassmorphism) --- */}
            <div className="relative z-10 w-full max-w-2xl mx-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl flex flex-col items-center text-center min-h-[500px] justify-center transition-all duration-500">
                    
                    {/* ESTADO: ESPERANDO */}
                    {estado === 'esperando' && (
                        <div className="flex flex-col items-center animate-fade-in">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                                <FaQrcode className="relative text-8xl text-white/80 drop-shadow-lg" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2 tracking-wide">PUNTO DE ACCESO</h2>
                            <p className="text-lg text-slate-400 font-light">Por favor, acerque su credencial al lector</p>
                            
                            <div className="mt-10 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">Sistema Activo</span>
                            </div>
                        </div>
                    )}

                    {/* ESTADO: PROCESANDO */}
                    {estado === 'procesando' && (
                        <div className="flex flex-col items-center animate-pulse">
                            <FaSpinner className="text-8xl text-blue-400 animate-spin mb-8" />
                            <h2 className="text-3xl font-bold text-white">Verificando...</h2>
                        </div>
                    )}

                    {/* ESTADO: APROBADO */}
                    {estado === 'aprobado' && (
                        <div className="flex flex-col items-center w-full animate-scale-in">
                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getStatusColor()} flex items-center justify-center mb-6 shadow-lg`}>
                                <FaCheckCircle className="text-6xl text-white drop-shadow-md" />
                            </div>
                            
                            <h2 className="text-5xl font-black text-white mb-2 tracking-tight">BIENVENIDO</h2>
                            <div className="h-1 w-24 bg-emerald-500 rounded-full mb-6"></div>

                            {datos?.socio && (
                                <div className="bg-white/10 border border-white/5 rounded-2xl p-6 w-full max-w-md backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <FaUserCircle className="text-5xl text-emerald-400" />
                                        <div className="text-left">
                                            <p className="text-sm text-emerald-200 uppercase font-semibold tracking-wider">Socio Autorizado</p>
                                            <p className="text-2xl font-bold text-white truncate">{datos.socio}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ESTADO: DENEGADO */}
                    {estado === 'denegado' && (
                        <div className="flex flex-col items-center w-full animate-shake">
                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getStatusColor()} flex items-center justify-center mb-6 shadow-lg`}>
                                {datos?.motivo === 'deuda' ? (
                                    <FaExclamationTriangle className="text-6xl text-white drop-shadow-md" />
                                ) : (
                                    <FaTimesCircle className="text-6xl text-white drop-shadow-md" />
                                )}
                            </div>

                            <h2 className="text-5xl font-black text-white mb-2 tracking-tight">ACCESO DENEGADO</h2>
                            <div className="h-1 w-24 bg-rose-500 rounded-full mb-6"></div>
                            
                            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 w-full max-w-md">
                                <p className="text-2xl font-bold text-rose-200 mb-1">
                                    {datos?.mensaje || 'Credencial inválida'}
                                </p>
                                {datos?.socio && (
                                    <p className="text-rose-300/80 font-medium uppercase text-sm tracking-wider">
                                        {datos.socio}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Input Invisible */}
            <form onSubmit={handleScan} className="absolute opacity-0 top-0 left-0 h-0 w-0 overflow-hidden">
                <input ref={inputRef} type="text" autoComplete="off" autoFocus />
                <button type="submit"></button>
            </form>

            {/* Footer Discreto */}
            {!isFullScreen && (
               <div className="absolute bottom-6 text-slate-500 text-xs font-medium tracking-widest opacity-60">
                   SISTEMA DE CONTROL • KARAZUNO
               </div>
            )}
        </div>
    );
}