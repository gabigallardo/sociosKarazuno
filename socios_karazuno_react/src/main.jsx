
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProviderWrapper } from './contexts/User.Context.jsx'

createRoot(document.getElementById('root')).render(     
  <StrictMode>
    <UserProviderWrapper>
      <App />
    </UserProviderWrapper>
  </StrictMode>,
)
