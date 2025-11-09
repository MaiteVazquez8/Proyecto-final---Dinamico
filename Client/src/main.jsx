import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./Global.css"
import App from './App.jsx'

// Aplicar modo oscuro inmediatamente antes de que React se monte
// Solo aplicar para clientes o usuarios no autenticados
(function applyDarkMode() {
  try {
    const currentUserStr = localStorage.getItem('currentUser')
    let shouldApplyDarkMode = true
    
    // Si hay un usuario guardado, verificar si es cliente
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr)
        const userRole = currentUser?.Cargo?.toLowerCase()
        // Solo aplicar modo oscuro para clientes o si no hay cargo definido
        // Para empleados, gerentes y superadmin, no aplicar automáticamente
        if (userRole && userRole !== 'cliente') {
          shouldApplyDarkMode = false
        }
      } catch (e) {
        // Si hay error parseando, asumir que es cliente o invitado
        shouldApplyDarkMode = true
      }
    }
    
    if (shouldApplyDarkMode) {
      const saved = localStorage.getItem('darkMode')
      if (saved === 'true') {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else if (saved === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('darkMode', 'true')
      }
    } else {
      // Si es empleado/gerente/superadmin, no aplicar modo oscuro al inicio
      // El Layout.jsx se encargará de permitirlo solo en home si el usuario lo activa
      document.documentElement.removeAttribute('data-theme')
    }
  } catch (e) {
    // En caso de error, aplicar lógica por defecto
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
