import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importaciones de Componentes de Layout y Contexto (estos se mantienen estáticos porque son críticos)
import { UserProviderWrapper } from "./contexts/User.Context.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./Layouts/Layout.jsx";
import "./index.css";

// El navegador no descargará estos archivos hasta que sean necesarios.
const SociosPage = lazy(() => import("./pages/sociosPage.jsx"));
const SociosForm = lazy(() => import("./pages/SociosForm.jsx"));
const UsuariosPage = lazy(() => import("./pages/usuariosP/usuariosPage.jsx"));
const UsuariosCreatePage = lazy(() => import("./pages/usuariosP/UsuariosCreatePage.jsx"));
const UsuariosEditarPage = lazy(() => import("./pages/usuariosP/UsuariosEditarPage.jsx"));
const UsuarioIdPage = lazy(() => import("./pages/usuariosP/UsuarioIdPage.jsx"));
const EventosPage = lazy(() => import("./pages/eventosP/eventosPages.jsx"));
const EventosCreatePage = lazy(() => import("./pages/eventosP/eventosCreatePage.jsx"));
const EventosEditarPage = lazy(() => import("./pages/eventosP/eventosEditarPage.jsx"));
const EventosIdPage = lazy(() => import("./pages/eventosP/eventosIdPage.jsx"));
const RolesPage = lazy(() => import("./pages/rolesPage.jsx"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const HacerseSocioPage = lazy(() => import("./pages/sociosP/hacerseSocioPage.jsx"));
const DeportesPage = lazy(() => import("./pages/deportesP/DeportesPage.jsx"));
const MiPerfilPage = lazy(() => import('./pages/MiPerfilPage'));
const MisCuotasPage = lazy(() => import("./pages/cuotasP/misCuotasPage.jsx"));
const PagarCuotaPage = lazy(() => import("./pages/cuotasP/pagarCuotaPage.jsx"));
const SociosPagesP = lazy(() => import("./pages/sociosP/sociosPage.jsx"));
const SocioDetailPage = lazy(() => import("./pages/sociosP/SocioDetailPage.jsx"));
const EntrenadoresPage = lazy(() => import("./pages/entrenadoresP/EntrenadoresPage.jsx"));
const JugadoresPage = lazy(() => import("./pages/jugadoresP/JugadoresPage.jsx"));
const GestionUsuariosPage = lazy(() => import('./pages/GestionUsuariosPage'));
const HorariosPage = lazy(() => import("./pages/HorariosPage.jsx"));
const MiCalendarioPage = lazy(() => import("./pages/MiCalendarioPage"));
const GestionClubPage = lazy(() => import("./pages/GestionClubPage.jsx"));
const ControlAccesoPage = lazy(() => import("./pages/ControlAccesoPage.jsx"));
const HistorialAccesosPage = lazy(() => import("./pages/HistorialAccesos.jsx"));
// Componente de carga simple y ligero
const Loading = () => (
  <div className="flex items-center justify-center h-screen w-full bg-gray-50">
    <div className="text-lg font-medium text-gray-600 animate-pulse">Cargando...</div>
  </div>
);

function App() {
    const rolesSocio = ['socio'];
    const rolesGestionDeportes = ['admin', 'profesor', 'dirigente', 'empleado'];
    const rolesGestionAdmin = ['admin', 'dirigente', 'empleado'];
    const rolesSuperAdmin = ['admin', 'dirigente'];
    const rolesGestionClub = ['admin', 'dirigente', 'empleado', 'profesor'];
    return (
        <UserProviderWrapper>
            <BrowserRouter>
                {/* Suspense maneja el estado de carga mientras llegan los archivos JS */}
                <Suspense fallback={<Loading />}>
                    <Routes>
                        {/* RUTAS PÚBLICAS */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* RUTAS PROTEGIDAS */}
                        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            
                            {/* Comunes */}
                            <Route path="/dashboard" element={<SociosPage />} /> 
                            <Route path="/mi-perfil" element={<MiPerfilPage />} />
                            <Route path="/eventos" element={<EventosPage />} />
                            <Route path="/eventos/:id" element={<EventosIdPage />} />
                            <Route path="/hacerse-socio" element={<HacerseSocioPage />} />

                            {/* Socios */}
                            <Route path="/mis-cuotas" element={<ProtectedRoute allowedRoles={rolesSocio}><MisCuotasPage /></ProtectedRoute>} />
                            <Route path="/cuotas/pagar/:id" element={<ProtectedRoute allowedRoles={rolesSocio}><PagarCuotaPage /></ProtectedRoute>} />

                            {/* Gestión Deportes */}
                            <Route path="/deportes" element={<ProtectedRoute allowedRoles={rolesGestionDeportes}><DeportesPage /></ProtectedRoute>} />
                            <Route path="/jugadores" element={<ProtectedRoute allowedRoles={rolesGestionDeportes}><JugadoresPage /></ProtectedRoute>} />
                            <Route path="/horarios" element={<ProtectedRoute allowedRoles={rolesGestionDeportes}><HorariosPage /></ProtectedRoute>} />
                            <Route path="/gestion-club" element={<ProtectedRoute allowedRoles={rolesGestionClub}><GestionClubPage /></ProtectedRoute>} />                                           
                            {/* Admin/Gestión */}
                            <Route path="/form" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><SociosForm /></ProtectedRoute>} />
                            <Route path="/usuarios" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><UsuariosPage /></ProtectedRoute>} />
                            <Route path="/usuarios/crear" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><UsuariosCreatePage /></ProtectedRoute>} />
                            <Route path="/usuarios/editar/:id" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><UsuariosEditarPage /></ProtectedRoute>} />
                            <Route path="/usuarios/:id" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><UsuarioIdPage /></ProtectedRoute>} />
                            <Route path="/eventos/crear" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><EventosCreatePage /></ProtectedRoute>} />
                            <Route path="/eventos/editar/:id" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><EventosEditarPage /></ProtectedRoute>} />
                            <Route path="/socios" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><SociosPagesP /></ProtectedRoute>} />
                            <Route path="/socios/:id" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><SocioDetailPage /></ProtectedRoute>} />
                            <Route path="/gestionar-usuarios" element={<GestionUsuariosPage />} />
                            <Route 
                                path="/control-acceso" 
                                element={
                                    // Solo Admin, Empleados o Dirigentes pueden controlar la puerta
                                    <ProtectedRoute allowedRoles={rolesGestionAdmin}>
                                        <ControlAccesoPage />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/historial-acceso" 
                                element={
                                <ProtectedRoute allowedRoles={rolesGestionAdmin}>
                                    <HistorialAccesosPage />
                                </ProtectedRoute>
                                } 
                            />
                            {/* Entrenadores */}
                            <Route path="/entrenadores" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><EntrenadoresPage /></ProtectedRoute>} />

                            {/* Super Admin */}
                            <Route path="/roles" element={<ProtectedRoute allowedRoles={rolesSuperAdmin}><RolesPage /></ProtectedRoute>} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/mi-calendario" element={<MiCalendarioPage />} />
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </UserProviderWrapper>
    );
}

export default App;