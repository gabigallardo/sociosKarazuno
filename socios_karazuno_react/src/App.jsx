import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SociosPage from "./pages/SociosPage.jsx";
import SociosForm from "./pages/SociosForm.jsx";
import UsuariosPage from "./pages/usuariosPage.jsx";
import UsuariosCreatePage from "./pages/UsuariosCreatePage.jsx";
import UsuariosEditarPage from "./pages/UsuariosEditarPage.jsx";
import UsuarioIdPage from "./pages/UsuarioIdPage.jsx";
import RolesPage from "./pages/rolesPage.jsx";
import "./index.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { UserProviderWrapper } from "./contexts/User.Context.jsx";

function App() {
  return (
    <UserProviderWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/socios" element={<SociosPage />} />
          <Route path="/form" element={<SociosForm />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/usuarios/crear" element={<UsuariosCreatePage />} />
          <Route path="/usuarios/editar/:id" element={<UsuariosEditarPage />} />
          <Route path="/usuarios/:id" element={<UsuarioIdPage />} />
          <Route path="/roles" element={<RolesPage />} />
        </Routes>
      </BrowserRouter>
    </UserProviderWrapper>
  );
}

export default App;
