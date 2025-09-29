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
