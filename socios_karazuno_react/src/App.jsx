import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import "./index.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { UserProviderWrapper } from "./contexts/User.Context.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HacerseSocioPage from "./pages/sociosP/HacerseSocioPage.jsx";
import DeportesPage from "./pages/deportesP/DeportesPage.jsx";



function App() {
  return (
    <UserProviderWrapper>
      <BrowserRouter>
        <Routes>
          {/* ----------------------------------------------------- */}
          {/* RUTAS PÚBLICAS (Accesibles sin estar logueado) */}
          {/* ----------------------------------------------------- */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ----------------------------------------------------- */}
          {/* RUTAS PROTEGIDAS*/}
          {/* ----------------------------------------------------- */}
          {/* Usa <ProtectedRoute> para todas las demás rutas */}
          <Route path="/socios" element={<ProtectedRoute element={<SociosPage />} />} />
          <Route path="/form" element={<ProtectedRoute element={<SociosForm />} />} />
          <Route path="/usuarios" element={<ProtectedRoute element={<UsuariosPage />} allowedRoles={['admin']} />} />
          <Route path="/usuarios/crear" element={<ProtectedRoute element={<UsuariosCreatePage />} />} />
          <Route path="/usuarios/editar/:id" element={<ProtectedRoute element={<UsuariosEditarPage />} />} />
          <Route path="/usuarios/:id" element={<ProtectedRoute element={<UsuarioIdPage />} />} />
          <Route path="/roles" element={<ProtectedRoute element={<RolesPage />} />} />
          <Route path="/eventos" element={<ProtectedRoute element={<EventosPage />} />} />
          <Route path="/eventos/crear" element={<ProtectedRoute element={<EventosCreatePage />} />} />
          <Route path="/eventos/editar/:id" element={<ProtectedRoute element={<EventosEditarPage />} />} />
          <Route path="/eventos/:id" element={<ProtectedRoute element={<EventosIdPage />} />} />
          <Route path="/hacerse-socio" element={<ProtectedRoute element={<HacerseSocioPage />} />} />
<Route 
            path="/deportes" 
            element={
              <ProtectedRoute 
                element={<DeportesPage />} 
                allowedRoles={['admin', 'profesor', 'dirigente']} 
              />
            } 
          />
        </Routes>
      </BrowserRouter>
    </UserProviderWrapper>
  );
}


export default App;