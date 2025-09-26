import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' 
import SociosPage from './pages/SociosPage.jsx'
import SociosForm from './pages/SociosForm.jsx'
import './index.css' 
import { Navigation } from './components/navigation.jsx'
function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/socios" />} />
        <Route path="/socios" element={<SociosPage />} />
        <Route path="/form" element={<SociosForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App  