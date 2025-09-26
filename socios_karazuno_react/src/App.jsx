import { BrowserRouter, Routes, Route } from 'react-router-dom' 
import SociosPage from './pages/SociosPage.jsx'
import SociosForm from './pages/SociosForm.jsx'
import './index.css' 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SociosPage />} />
        <Route path="/form" element={<SociosForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App  