import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// A ordem importa: os tokens definem as variáveis que o global.css usa
import './styles/tokens.css'
import './styles/global.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)