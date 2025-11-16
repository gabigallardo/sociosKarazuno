// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importaciones de Páginas (Asegúrate que las rutas sean correctas)
import SociosPage from "./pages/sociosPage.jsx"; 
import SociosForm from "./pages/SociosForm.jsx"; 
import UsuariosPage from "./pages/usuariosP/usuariosPage.jsx";
import UsuariosCreatePage from "./pages/usuariosP/UsuariosCreatePage.jsx";
import UsuariosEditarPage from "./pages/usuariosP/UsuariosEditarPage.jsx";
import UsuarioIdPage from "./pages/usuariosP/UsuarioIdPage.jsx";
import EventosPage from "./pages/eventosP/eventosPages.jsx";
import EventosCreatePage from "./pages/eventosP/eventosCreatePage.jsx";
import EventosEditarPage from "./pages/eventosP/eventosEditarPage.jsx";
import EventosIdPage from "./pages/eventosP/eventosIdPage.jsx";
import RolesPage from "./pages/rolesPage.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HacerseSocioPage from "./pages/sociosP/hacerseSocioPage.jsx"; 
import DeportesPage from "./pages/deportesP/DeportesPage.jsx";
import MiPerfilPage from './pages/MiPerfilPage';
import MisCuotasPage from "./pages/cuotasP/misCuotasPage.jsx";
import PagarCuotaPage from "./pages/cuotasP/pagarCuotaPage.jsx";
import SociosPagesP from "./pages/sociosP/sociosPage.jsx";
import SocioDetailPage from "./pages/sociosP/SocioDetailPage.jsx";
import EntrenadoresPage from "./pages/entrenadoresP/EntrenadoresPage.jsx";
import JugadoresPage from "./pages/jugadoresP/JugadoresPage.jsx";
import GestionUsuariosPage from './pages/GestionUsuariosPage'; 

// Importaciones de Componentes y Contexto
import { UserProviderWrapper } from "./contexts/User.Context.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./Layouts/Layout.jsx"; 

import "./index.css";

function App() {
    const rolesSocio = ['socio']; // Ajusta si el nombre del rol es diferente
    const rolesGestionDeportes = ['admin', 'profesor', 'dirigente', 'empleado'];
    const rolesGestionAdmin = ['admin', 'dirigente', 'empleado']; // Para usuarios, eventos, entrenadores
    const rolesSuperAdmin = ['admin', 'dirigente']; // Para roles, por ejemplo

    return (
        <UserProviderWrapper>
            <BrowserRouter>
                <Routes>
                    {/* ----------------------------------------------------- */}
                    {/* RUTAS PÚBLICAS (Sin Layout/Navigation) */}
                    {/* ----------------------------------------------------- */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* ----------------------------------------------------- */}
                    {/* RUTAS PROTEGIDAS (Usan Layout con Navigation) */}
                    {/* ----------------------------------------------------- */}
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}> {/* Protege el Layout */}

                        {/* Rutas Comunes para usuarios logueados */}
                        <Route path="/dashboard" element={<SociosPage />} /> 
                        <Route path="/mi-perfil" element={<MiPerfilPage />} />
                        <Route path="/eventos" element={<EventosPage />} />
                        <Route path="/eventos/:id" element={<EventosIdPage />} />
                        <Route path="/hacerse-socio" element={<HacerseSocioPage />} />

                        {/* Rutas solo para Socios */}
                        <Route path="/mis-cuotas" element={<ProtectedRoute allowedRoles={rolesSocio}><MisCuotasPage /></ProtectedRoute>} />
                        <Route path="/cuotas/pagar/:id" element={<ProtectedRoute allowedRoles={rolesSocio}><PagarCuotaPage /></ProtectedRoute>} />

                        {/* Rutas para Gestión de Deportes */}
                        <Route path="/deportes" element={<ProtectedRoute allowedRoles={rolesGestionDeportes}><DeportesPage /></ProtectedRoute>} />
                        <Route path="/jugadores" element={<ProtectedRoute allowedRoles={rolesGestionDeportes}><JugadoresPage /></ProtectedRoute>} />

                        {/* Rutas para Admin, Dirigente, Empleado */}
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
                        {/* RUTA PARA ENTRENADORES */}
                        <Route path="/entrenadores" element={<ProtectedRoute allowedRoles={rolesGestionAdmin}><EntrenadoresPage /></ProtectedRoute>} />

                        {/* Rutas solo para Admin, Dirigente */}
                        <Route path="/roles" element={<ProtectedRoute allowedRoles={rolesSuperAdmin}><RolesPage /></ProtectedRoute>} />

                        {/* Ruta Catch-all para usuarios logueados: redirige a su dashboard o perfil */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />

                    </Route>

                  
                </Routes>
            </BrowserRouter>
        </UserProviderWrapper>
    );
}

export default App;