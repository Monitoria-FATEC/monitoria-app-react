import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { aplicarPreferencias, lerPreferencias } from './utils/acessibilidade'

// Aplica as preferências de acessibilidade antes de desenhar a tela, para não piscar.
aplicarPreferencias(lerPreferencias())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)